import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPhonePePayment } from "@/lib/phonepe";

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

        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .select("id, user_id, total, status, payment_status, payment_method, gateway_order_id")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .single();

        if (error || !order) {
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
            return NextResponse.json(
                { success: false, message: "Order already paid." },
                { status: 400 }
            );
        }

        if (order.status === "cancelled") {
            return NextResponse.json(
                { success: false, message: "Cancelled order cannot be paid." },
                { status: 400 }
            );
        }

        const total = Number(order.total);

        if (!Number.isInteger(total) || total <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid order amount." },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl || !appUrl.startsWith("http")) {
            return NextResponse.json(
                { success: false, message: "Invalid app URL configuration." },
                { status: 500 }
            );
        }

        const merchantOrderId = order.gateway_order_id || `VH-${order.id}`;

        await supabaseAdmin
            .from("orders")
            .update({
                gateway_order_id: merchantOrderId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
            .eq("user_id", user.id);

        const redirectUrl = `${appUrl}/payment/phonepe/status?orderId=${order.id}`;

        const phonepeResponse = await createPhonePePayment({
            merchantOrderId,
            amount: total,
            redirectUrl,
        });

        const paymentUrl =
            phonepeResponse?.redirectUrl ||
            phonepeResponse?.data?.redirectUrl ||
            phonepeResponse?.paymentUrl ||
            phonepeResponse?.data?.instrumentResponse?.redirectInfo?.url;

        if (!paymentUrl) {
            console.error("PhonePe payment URL missing:", phonepeResponse);

            return NextResponse.json(
                { success: false, message: "Payment link not received." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            paymentUrl,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unable to create payment.",
            },
            { status: 500 }
        );
    }
}