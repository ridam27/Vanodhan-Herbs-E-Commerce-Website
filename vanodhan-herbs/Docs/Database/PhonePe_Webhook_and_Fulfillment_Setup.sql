-- ====================================================================
-- VANODHAN HERBS — PHONEPE PAYMENT WEBHOOK & ATOMIC FULFILLMENT SETUP
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Create Webhook Audit Logging Table
CREATE TABLE IF NOT EXISTS public.payment_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_order_id TEXT,
    event_type TEXT,
    payload JSONB,
    headers JSONB,
    status TEXT, -- 'processed', 'duplicate', 'failed', 'mismatch', 'invalid'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize search and monitoring
CREATE INDEX IF NOT EXISTS payment_webhook_logs_merchant_order_id_idx 
    ON public.payment_webhook_logs (merchant_order_id);

CREATE INDEX IF NOT EXISTS payment_webhook_logs_created_at_idx 
    ON public.payment_webhook_logs (created_at DESC);

-- Enable RLS for Security
ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow Admins & Super Admins to view audit logs
DROP POLICY IF EXISTS "Admins can view payment webhook logs" ON public.payment_webhook_logs;
CREATE POLICY "Admins can view payment webhook logs"
ON public.payment_webhook_logs
FOR SELECT
TO authenticated
USING (
    COALESCE(
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
        ''
    ) IN ('admin', 'super_admin')
    OR public.get_current_user_role() IN ('admin', 'super_admin')
);

-- Prevent duplicate coupon redemptions for the same order
CREATE UNIQUE INDEX IF NOT EXISTS coupon_redemptions_order_coupon_uidx 
    ON public.coupon_redemptions (order_id, coupon_id) 
    WHERE order_id IS NOT NULL;


-- ====================================================================
-- 2. Atomic Order Fulfillment Stored Procedure
-- Solves Race Conditions between Webhook and Client-Side Redirect
-- Performs: Row Lock -> Idempotency Check -> Stock Decrement -> 
--           Coupon Counter Increment -> Order Confirmation -> Cart Clearing
-- ====================================================================
CREATE OR REPLACE FUNCTION public.complete_order_payment(
    p_order_id UUID,
    p_phonepe_order_id TEXT,
    p_gateway_transaction_id TEXT,
    p_gateway_response JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    -- 1. Acquire exclusive row-level lock on the order
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ORDER_NOT_FOUND',
            'message', 'Order not found.'
        );
    END IF;

    -- 2. Strict Idempotency Check: If already marked paid, exit cleanly
    IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object(
            'success', true,
            'code', 'ALREADY_PAID',
            'message', 'Order is already marked as paid.'
        );
    END IF;

    -- 3. Verify order is in a valid state
    IF v_order.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ORDER_CANCELLED',
            'message', 'Cancelled order cannot be marked as paid.'
        );
    END IF;

    -- 4. Deduct Inventory for all items in order
    FOR v_item IN
        SELECT oi.product_id, oi.quantity, p.name, p.stock_quantity
        FROM public.order_items oi
        JOIN public.products p ON p.id = oi.product_id
        WHERE oi.order_id = p_order_id
        FOR UPDATE OF p
    LOOP
        UPDATE public.products
        SET stock_quantity = GREATEST(stock_quantity - v_item.quantity, 0),
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    -- 5. Record Coupon Redemption (if coupon applied)
    IF v_order.coupon_id IS NOT NULL THEN
        UPDATE public.coupons
        SET used_count = COALESCE(used_count, 0) + 1,
            updated_at = NOW()
        WHERE id = v_order.coupon_id;

        INSERT INTO public.coupon_redemptions (coupon_id, user_id, order_id, created_at)
        VALUES (v_order.coupon_id, v_order.user_id, p_order_id, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. Transition Order Status to Paid & Confirmed
    UPDATE public.orders
    SET status = 'confirmed',
        payment_status = 'paid',
        phonepe_order_id = p_phonepe_order_id,
        gateway_transaction_id = p_gateway_transaction_id,
        gateway_response = p_gateway_response,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 7. Clear Customer's Cart
    IF v_order.user_id IS NOT NULL THEN
        DELETE FROM public.cart_items
        WHERE user_id = v_order.user_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'ORDER_FULFILLED',
        'message', 'Order payment completed successfully.'
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.complete_order_payment(UUID, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_order_payment(UUID, TEXT, TEXT, JSONB) TO service_role;
