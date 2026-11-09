import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkPhonePeOrderStatus } from "@/lib/phonepe";
import {
    fulfillOrderPayment,
    extractPhonePeState,
    extractPhonePeAmount,
    extractPhonePeCurrency,
    extractPhonePeOrderId,
    extractPhonePeTransactionId,
} from "@/lib/orderFulfillment";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

        // Fast path: If already paid (e.g. fulfilled by webhook right before client redirect)
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

        const merchantOrderId =
            order.gateway_order_id || `VH-${order.id}`;

        const phonepeStatus = await checkPhonePeOrderStatus(merchantOrderId);

        const paymentState = extractPhonePeState(phonepeStatus);
        const paidAmount = Number(extractPhonePeAmount(phonepeStatus));
        const currency = extractPhonePeCurrency(phonepeStatus);
        const phonepeOrderId = extractPhonePeOrderId(phonepeStatus);
        const transactionId = extractPhonePeTransactionId(phonepeStatus);

        const expectedAmount = Number(order.total) * 100;

        if (paymentState !== "COMPLETED") {
            await supabaseAdmin
                .from("orders")
                .update({
                    payment_status: paymentState === "FAILED" ? "failed" : "pending",
                    phonepe_order_id: phonepeOrderId || null,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", order.id);

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
                    phonepe_order_id: phonepeOrderId || null,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", order.id);

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
                    phonepe_order_id: phonepeOrderId || null,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", order.id);

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
                    phonepe_order_id: phonepeOrderId || null,
                    gateway_response: phonepeStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", order.id);

            return NextResponse.json(
                { success: false, message: "Payment transaction ID missing." },
                { status: 400 }
            );
        }

        // Delegate atomic fulfillment (handles RPC row-locking + safe JS fallback)
        const fulfillmentResult = await fulfillOrderPayment({
            orderId: order.id,
            phonepeOrderId: phonepeOrderId || merchantOrderId,
            transactionId,
            gatewayResponse: phonepeStatus,
            source: "client_verify",
        });

        if (!fulfillmentResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: fulfillmentResult.message || "Payment verification failed.",
                    code: fulfillmentResult.code,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: fulfillmentResult.message || "Payment verified successfully.",
            orderId: order.id,
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