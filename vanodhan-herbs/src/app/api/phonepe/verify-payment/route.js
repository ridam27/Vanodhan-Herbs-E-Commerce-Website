import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkPhonePeOrderStatus } from "@/lib/phonepe";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractPhonePeState(response) {
    return response?.state || null;
}

function extractPhonePeAmount(response) {
    return response?.amount || null;
}

function extractPhonePeCurrency(response) {
    return response?.currency || null;
}

function extractPhonePeOrderId(response) {
    return response?.orderId || null;
}

function extractPhonePeTransactionId(response) {
    return response?.paymentDetails?.[0]?.transactionId || null;
}

export async function POST(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized request." },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        const {
            data: { user },
            error: userError,
        } = await supabaseAdmin.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json(
                { success: false, message: "Invalid session." },
                { status: 401 }
            );
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required." },
                { status: 400 }
            );
        }

        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        if (order.payment_method !== "phonepe") {
            return NextResponse.json(
                { success: false, message: "Invalid payment method." },
                { status: 400 }
            );
        }

        if (order.payment_status === "paid") {
            return NextResponse.json({
                success: true,
                message: "Payment already verified.",
                orderId: order.id,
            });
        }

        if (order.status === "cancelled") {
            return NextResponse.json(
                { success: false, message: "Cancelled order cannot be verified." },
                { status: 400 }
            );
        }

        const { data: lockedOrder, error: lockError } = await supabaseAdmin
            .from("orders")
            .update({
                payment_status: "verifying",
                updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
            .eq("user_id", user.id)
            .eq("payment_status", "pending")
            .select("*")
            .single();

        if (lockError || !lockedOrder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment is already being processed or is not pending.",
                },
                { status: 409 }
            );
        }

        const merchantOrderId =
            lockedOrder.gateway_order_id || `VH-${lockedOrder.id}`;

        const phonepeStatus = await checkPhonePeOrderStatus(merchantOrderId);

        const paymentState = extractPhonePeState(phonepeStatus);
        const paidAmount = Number(extractPhonePeAmount(phonepeStatus));
        const currency = extractPhonePeCurrency(phonepeStatus);
        const phonepeOrderId = extractPhonePeOrderId(phonepeStatus);
        const transactionId = extractPhonePeTransactionId(phonepeStatus);

        const expectedAmount = Number(lockedOrder.total) * 100;

        if (paymentState !== "COMPLETED") {
            await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: paymentState === "FAILED" ? "failed" : "pending",
                    phonepe_order_id: phonepeOrderId,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", lockedOrder.id);

            return NextResponse.json(
                {
                    success: false,
                    message: "Payment not completed.",
                    paymentState,
                },
                { status: 400 }
            );
        }

        if (currency !== "INR") {
            await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: "failed",
                    phonepe_order_id: phonepeOrderId,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", lockedOrder.id);

            return NextResponse.json(
                { success: false, message: "Invalid payment currency." },
                { status: 400 }
            );
        }

        if (!Number.isInteger(paidAmount) || paidAmount !== expectedAmount) {
            await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: "failed",
                    phonepe_order_id: phonepeOrderId,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", lockedOrder.id);

            return NextResponse.json(
                { success: false, message: "Payment amount mismatch." },
                { status: 400 }
            );
        }

        if (!transactionId) {
            await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: "failed",
                    phonepe_order_id: phonepeOrderId,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", lockedOrder.id);

            return NextResponse.json(
                { success: false, message: "Payment transaction ID missing." },
                { status: 400 }
            );
        }

        const { data: orderItems, error: itemsError } = await supabaseAdmin
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
            .eq("order_id", lockedOrder.id);

        if (itemsError || !orderItems || orderItems.length === 0) {
            await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: "failed",
                    phonepe_order_id: phonepeOrderId,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", lockedOrder.id);

            return NextResponse.json(
                { success: false, message: "Order items not found." },
                { status: 500 }
            );
        }

        for (const item of orderItems) {
            const { data: updatedProduct, error: stockError } =
                await supabaseAdmin
                    .from("products")
                    .update({
                        stock_quantity:
                            Number(item.products.stock_quantity) -
                            Number(item.quantity),
                    })
                    .eq("id", item.product_id)
                    .gte("stock_quantity", Number(item.quantity))
                    .select("id")
                    .single();

            if (stockError || !updatedProduct) {
                await supabaseAdmin
                    .from("orders")
                    .update({
                        payment_status: "failed",
                        phonepe_order_id: phonepeOrderId,
                        gateway_response: phonepeStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", lockedOrder.id);

                return NextResponse.json(
                    {
                        success: false,
                        message: `${item.products.name} is out of stock.`,
                    },
                    { status: 400 }
                );
            }
        }

        if (lockedOrder.coupon_id) {
            const { data: coupon } = await supabaseAdmin
                .from("coupons")
                .select("id, used_count")
                .eq("id", lockedOrder.coupon_id)
                .single();

            if (coupon) {
                await supabaseAdmin
                    .from("coupons")
                    .update({
                        used_count: Number(coupon.used_count) + 1,
                    })
                    .eq("id", coupon.id);

                await supabaseAdmin.from("coupon_redemptions").insert({
                    coupon_id: coupon.id,
                    user_id: lockedOrder.user_id,
                    order_id: lockedOrder.id,
                });
            }
        }

        await supabaseAdmin
            .from("orders")
            .update({
                status: "confirmed",
                payment_status: "paid",
                phonepe_order_id: phonepeOrderId,
                gateway_transaction_id: transactionId,
                gateway_response: phonepeStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", lockedOrder.id);

        await supabaseAdmin
            .from("cart_items")
            .delete()
            .eq("user_id", lockedOrder.user_id);

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully.",
            orderId: lockedOrder.id,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Payment verification failed.",
            },
            { status: 500 }
        );
    }
}