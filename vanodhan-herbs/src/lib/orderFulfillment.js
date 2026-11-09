import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Extracts standard attributes from PhonePe PG V2 Order Status response.
 * Resilient to response wrappers (e.g. data.*, payload.*, or top-level properties).
 */
export function extractPhonePeState(response) {
    return (
        response?.data?.state ||
        response?.state ||
        response?.payload?.state ||
        null
    );
}

export function extractPhonePeAmount(response) {
    const amt =
        response?.data?.amount ??
        response?.amount ??
        response?.payload?.amount;
    return amt !== undefined && amt !== null ? Number(amt) : null;
}

export function extractPhonePeCurrency(response) {
    return (
        response?.data?.currency ||
        response?.currency ||
        response?.payload?.currency ||
        "INR"
    );
}

export function extractPhonePeOrderId(response) {
    return (
        response?.data?.orderId ||
        response?.orderId ||
        response?.payload?.orderId ||
        null
    );
}

export function extractPhonePeTransactionId(response) {
    return (
        response?.data?.paymentDetails?.[0]?.transactionId ||
        response?.paymentDetails?.[0]?.transactionId ||
        response?.data?.transactionId ||
        response?.transactionId ||
        response?.payload?.paymentDetails?.[0]?.transactionId ||
        null
    );
}

/**
 * Centrally fulfills a paid order in an atomic, idempotent manner.
 * 
 * Strategy:
 * 1. Primary: Invokes public.complete_order_payment() PostgreSQL RPC function
 *    which runs within a single database transaction with row-level locking (SELECT FOR UPDATE).
 * 2. Secondary Fallback: If RPC has not yet been applied in Supabase SQL editor,
 *    executes an optimistic-locking JavaScript transaction to guarantee orders
 *    are never fulfilled twice or double-debited.
 * 
 * @param {Object} params
 * @param {string} params.orderId - Supabase order UUID
 * @param {string} [params.phonepeOrderId] - PhonePe merchant order reference
 * @param {string} params.transactionId - PhonePe payment transaction ID
 * @param {Object} params.gatewayResponse - Complete PhonePe status API response
 * @param {string} [params.source='webhook'] - Invocation source ('webhook' or 'client_verify')
 * 
 * @returns {Promise<{success: boolean, alreadyPaid?: boolean, code?: string, message: string}>}
 */
export async function fulfillOrderPayment({
    orderId,
    phonepeOrderId,
    transactionId,
    gatewayResponse,
    source = "webhook",
}) {
    if (!orderId) {
        return { success: false, code: "INVALID_ORDER_ID", message: "Order ID is required." };
    }

    // 1. Try atomic PostgreSQL RPC execution first
    try {
        const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
            "complete_order_payment",
            {
                p_order_id: orderId,
                p_phonepe_order_id: phonepeOrderId || null,
                p_gateway_transaction_id: transactionId || null,
                p_gateway_response: gatewayResponse || null,
            }
        );

        if (!rpcError && rpcResult) {
            if (rpcResult.code === "ALREADY_PAID") {
                return {
                    success: true,
                    alreadyPaid: true,
                    code: "ALREADY_PAID",
                    message: rpcResult.message || "Order is already marked as paid.",
                };
            }

            if (rpcResult.success) {
                return {
                    success: true,
                    alreadyPaid: false,
                    code: rpcResult.code || "ORDER_FULFILLED",
                    message: rpcResult.message || "Order payment completed successfully.",
                };
            }

            return {
                success: false,
                code: rpcResult.code || "RPC_ERROR",
                message: rpcResult.message || "Fulfillment procedure failed.",
            };
        }

        // If RPC function is not created or threw an error, log warning and use safe JS fallback
        if (rpcError) {
            console.warn(
                `[orderFulfillment] complete_order_payment RPC not available (${rpcError.message}), running JS fallback.`
            );
        }
    } catch (rpcCatchErr) {
        console.warn(
            `[orderFulfillment] Error invoking complete_order_payment RPC:`,
            rpcCatchErr.message
        );
    }

    // 2. JavaScript Transaction Fallback with Optimistic Concurrency Control
    try {
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("id, user_id, status, payment_status, coupon_id, total")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return {
                success: false,
                code: "ORDER_NOT_FOUND",
                message: "Order not found in database.",
            };
        }

        // Idempotency: Already paid
        if (order.payment_status === "paid") {
            return {
                success: true,
                alreadyPaid: true,
                code: "ALREADY_PAID",
                message: "Order is already marked as paid.",
            };
        }

        if (order.status === "cancelled") {
            return {
                success: false,
                code: "ORDER_CANCELLED",
                message: "Cancelled order cannot be marked as paid.",
            };
        }

        // Lock row by setting payment_status to 'verifying' conditionally
        const { data: lockedOrder, error: lockError } = await supabaseAdmin
            .from("orders")
            .update({
                payment_status: "verifying",
                updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
            .eq("payment_status", "pending")
            .select("id, user_id, coupon_id")
            .single();

        if (lockError || !lockedOrder) {
            // Concurrent execution detected: Re-fetch to check if already fulfilled
            const { data: currentOrder } = await supabaseAdmin
                .from("orders")
                .select("payment_status")
                .eq("id", order.id)
                .single();

            if (currentOrder?.payment_status === "paid") {
                return {
                    success: true,
                    alreadyPaid: true,
                    code: "ALREADY_PAID",
                    message: "Order was already marked as paid by concurrent request.",
                };
            }

            return {
                success: false,
                code: "CONCURRENT_PROCESSING",
                message: "Payment is already being processed.",
            };
        }

        // Deduct inventory for all order items
        const { data: orderItems } = await supabaseAdmin
            .from("order_items")
            .select(`
                product_id,
                quantity,
                products (
                    id,
                    name,
                    stock_quantity
                )
            `)
            .eq("order_id", order.id);

        if (orderItems && orderItems.length > 0) {
            for (const item of orderItems) {
                const currentStock = Number(item.products?.stock_quantity || 0);
                const quantity = Number(item.quantity || 0);
                const newStock = Math.max(0, currentStock - quantity);

                await supabaseAdmin
                    .from("products")
                    .update({
                        stock_quantity: newStock,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", item.product_id);
            }
        }

        // Increment coupon count and record redemption if applicable
        if (order.coupon_id) {
            const { data: coupon } = await supabaseAdmin
                .from("coupons")
                .select("id, used_count")
                .eq("id", order.coupon_id)
                .single();

            if (coupon) {
                await supabaseAdmin
                    .from("coupons")
                    .update({
                        used_count: Number(coupon.used_count || 0) + 1,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", coupon.id);

                await supabaseAdmin
                    .from("coupon_redemptions")
                    .insert({
                        coupon_id: coupon.id,
                        user_id: order.user_id,
                        order_id: order.id,
                    });
            }
        }

        // Mark order as paid & confirmed
        await supabaseAdmin
            .from("orders")
            .update({
                status: "confirmed",
                payment_status: "paid",
                phonepe_order_id: phonepeOrderId || null,
                gateway_transaction_id: transactionId || null,
                gateway_response: gatewayResponse || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

        // Clear user's cart
        if (order.user_id) {
            await supabaseAdmin
                .from("cart_items")
                .delete()
                .eq("user_id", order.user_id);
        }

        return {
            success: true,
            alreadyPaid: false,
            code: "ORDER_FULFILLED",
            message: "Order payment fulfilled successfully.",
        };
    } catch (err) {
        console.error(`[orderFulfillment] Error fulfilling order ${orderId}:`, err);
        return {
            success: false,
            code: "INTERNAL_ERROR",
            message: err.message || "Failed to fulfill order payment.",
        };
    }
}
