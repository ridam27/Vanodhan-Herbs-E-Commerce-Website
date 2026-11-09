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

/**
 * Safely parse incoming webhook payload from PhonePe.
 * Supports:
 * 1. Base64 encoded payload: { response: "..." }
 * 2. Nested event payload: { event: "...", payload: { merchantOrderId: "..." } }
 * 3. Direct JSON payload: { merchantOrderId: "...", ... }
 */
function parseWebhookPayload(rawBody) {
    let parsed = null;
    let decodedJson = null;

    try {
        parsed = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch {
        return { error: "INVALID_JSON", raw: rawBody };
    }

    // Check if PhonePe sent a base64 encoded response wrapper
    if (parsed && typeof parsed.response === "string") {
        try {
            const decodedString = Buffer.from(parsed.response, "base64").toString("utf8");
            decodedJson = JSON.parse(decodedString);
        } catch (e) {
            console.warn("[PhonePe Webhook] Failed to decode base64 response:", e.message);
        }
    }

    const payloadCandidate = decodedJson || parsed;

    // Search for merchantOrderId across common PhonePe payload schemas
    const merchantOrderId =
        payloadCandidate?.data?.merchantOrderId ||
        payloadCandidate?.data?.merchantTransactionId ||
        payloadCandidate?.payload?.merchantOrderId ||
        payloadCandidate?.payload?.merchantTransactionId ||
        payloadCandidate?.merchantOrderId ||
        payloadCandidate?.merchantTransactionId ||
        payloadCandidate?.orderId ||
        null;

    const eventType =
        payloadCandidate?.event ||
        payloadCandidate?.code ||
        payloadCandidate?.type ||
        payloadCandidate?.data?.state ||
        "WEBHOOK_EVENT";

    return {
        merchantOrderId,
        eventType,
        payload: payloadCandidate,
        rawPayload: parsed,
    };
}

/**
 * Audit helper to insert logs into payment_webhook_logs.
 * Non-blocking: will never crash the webhook flow if table is not yet created.
 */
async function logWebhookEvent({
    merchantOrderId,
    eventType,
    payload,
    headers,
    status,
    errorMessage = null,
}) {
    try {
        await supabaseAdmin.from("payment_webhook_logs").insert({
            merchant_order_id: merchantOrderId || "UNKNOWN",
            event_type: eventType || "UNKNOWN",
            payload: payload || {},
            headers: headers || {},
            status,
            error_message: errorMessage,
        });
    } catch (logErr) {
        console.warn("[PhonePe Webhook] Unable to write audit log:", logErr.message);
    }
}

export async function POST(request) {
    const loggedHeaders = {
        "x-verify": request.headers.get("x-verify") || null,
        "content-type": request.headers.get("content-type") || null,
        "user-agent": request.headers.get("user-agent") || null,
        "phonepe-signature": request.headers.get("phonepe-signature") || null,
    };

    let rawText = "";

    try {
        // Enforce max payload size limit (32KB)
        const contentLength = Number(request.headers.get("content-length") || 0);
        if (contentLength > 32768) {
            return NextResponse.json(
                { success: false, message: "Payload size too large." },
                { status: 413 }
            );
        }

        rawText = await request.text();

        if (!rawText || rawText.trim().length === 0) {
            await logWebhookEvent({
                merchantOrderId: null,
                eventType: "EMPTY_BODY",
                payload: {},
                headers: loggedHeaders,
                status: "invalid",
                errorMessage: "Empty webhook body received",
            });

            return NextResponse.json(
                { success: false, message: "Webhook body is empty." },
                { status: 400 }
            );
        }

        const { merchantOrderId, eventType, payload, rawPayload, error } =
            parseWebhookPayload(rawText);

        if (error || !merchantOrderId) {
            await logWebhookEvent({
                merchantOrderId: null,
                eventType: eventType || "MALFORMED_PAYLOAD",
                payload: rawPayload || { raw: rawText },
                headers: loggedHeaders,
                status: "invalid",
                errorMessage: "Missing merchantOrderId in webhook payload",
            });

            return NextResponse.json(
                { success: false, message: "Missing merchant order reference." },
                { status: 400 }
            );
        }

        // 1. Resolve Order from Database
        const cleanedId = merchantOrderId.startsWith("VH-")
            ? merchantOrderId.slice(3)
            : merchantOrderId;

        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("id, user_id, total, status, payment_status, payment_method, gateway_order_id")
            .or(`gateway_order_id.eq.${merchantOrderId},id.eq.${cleanedId}`)
            .maybeSingle();

        if (orderError || !order) {
            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload,
                headers: loggedHeaders,
                status: "not_found",
                errorMessage: `Order matching ${merchantOrderId} not found`,
            });

            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        // 2. Strict Idempotency Check
        // If order is already paid, acknowledge HTTP 200 immediately to halt gateway retries
        if (order.payment_status === "paid") {
            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload,
                headers: loggedHeaders,
                status: "duplicate",
                errorMessage: null,
            });

            return NextResponse.json(
                {
                    success: true,
                    code: "ALREADY_PAID",
                    message: "Order is already marked as paid.",
                    orderId: order.id,
                },
                { status: 200 }
            );
        }

        // Cancelled orders cannot be paid
        if (order.status === "cancelled") {
            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload,
                headers: loggedHeaders,
                status: "failed",
                errorMessage: "Cannot fulfill cancelled order",
            });

            return NextResponse.json(
                { success: false, message: "Cancelled order cannot be fulfilled." },
                { status: 400 }
            );
        }

        // 3. ZERO-TRUST MANDATORY S2S CHECK TO PHONEPE GATEWAY
        // We never trust the webhook payload alone. We query PhonePe directly using our OAuth credentials.
        let phonepeStatus;
        try {
            phonepeStatus = await checkPhonePeOrderStatus(merchantOrderId);
        } catch (statusError) {
            console.error(
                `[PhonePe Webhook] S2S Status verification failed for ${merchantOrderId}:`,
                statusError.message
            );

            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload,
                headers: loggedHeaders,
                status: "failed",
                errorMessage: `S2S check failed: ${statusError.message}`,
            });

            // Return 500 so PhonePe retries if it was a temporary network/server glitch
            return NextResponse.json(
                { success: false, message: "Unable to verify order status with PhonePe." },
                { status: 500 }
            );
        }

        const paymentState = extractPhonePeState(phonepeStatus);
        const paidAmount = extractPhonePeAmount(phonepeStatus);
        const currency = extractPhonePeCurrency(phonepeStatus);
        const phonepeOrderId = extractPhonePeOrderId(phonepeStatus);
        const transactionId = extractPhonePeTransactionId(phonepeStatus);

        const expectedAmount = Number(order.total) * 100;

        // Verify Payment State
        if (paymentState !== "COMPLETED") {
            if (paymentState === "FAILED") {
                await supabaseAdmin
                    .from("orders")
                    .update({
                        payment_status: "failed",
                        phonepe_order_id: phonepeOrderId || null,
                        gateway_response: phonepeStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", order.id);
            }

            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload: phonepeStatus,
                headers: loggedHeaders,
                status: "failed",
                errorMessage: `Payment state is ${paymentState}`,
            });

            return NextResponse.json(
                {
                    success: false,
                    message: `Payment not completed (state: ${paymentState}).`,
                    paymentState,
                },
                { status: 200 } // Acknowledge 200 so PhonePe doesn't needlessly hammer terminal states
            );
        }

        // Verify Currency
        if (currency !== "INR") {
            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload: phonepeStatus,
                headers: loggedHeaders,
                status: "mismatch",
                errorMessage: `Currency mismatch: expected INR, received ${currency}`,
            });

            return NextResponse.json(
                { success: false, message: "Invalid payment currency." },
                { status: 400 }
            );
        }

        // Verify Amount (in paisa) strictly against database total
        if (!Number.isInteger(paidAmount) || paidAmount !== expectedAmount) {
            console.error(
                `[PhonePe Webhook SECURITY ALERT] Amount mismatch for order ${order.id}: expected ${expectedAmount} paisa, received ${paidAmount} paisa.`
            );

            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload: phonepeStatus,
                headers: loggedHeaders,
                status: "mismatch",
                errorMessage: `Amount mismatch: expected ${expectedAmount}, received ${paidAmount}`,
            });

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
                { success: false, message: "Payment amount mismatch detected." },
                { status: 400 }
            );
        }

        // Verify Transaction ID
        if (!transactionId) {
            await logWebhookEvent({
                merchantOrderId,
                eventType,
                payload: phonepeStatus,
                headers: loggedHeaders,
                status: "failed",
                errorMessage: "Missing transaction ID from PhonePe status response",
            });

            return NextResponse.json(
                { success: false, message: "Missing transaction ID." },
                { status: 400 }
            );
        }

        // 4. ATOMIC, IDEMPOTENT ORDER FULFILLMENT
        const fulfillmentResult = await fulfillOrderPayment({
            orderId: order.id,
            phonepeOrderId: phonepeOrderId || merchantOrderId,
            transactionId,
            gatewayResponse: phonepeStatus,
            source: "webhook",
        });

        await logWebhookEvent({
            merchantOrderId,
            eventType,
            payload: phonepeStatus,
            headers: loggedHeaders,
            status: fulfillmentResult.success
                ? fulfillmentResult.alreadyPaid
                    ? "duplicate"
                    : "processed"
                : "failed",
            errorMessage: fulfillmentResult.success ? null : fulfillmentResult.message,
        });

        if (!fulfillmentResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: fulfillmentResult.message,
                    code: fulfillmentResult.code,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: fulfillmentResult.message,
                code: fulfillmentResult.code,
                orderId: order.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[PhonePe Webhook FATAL ERROR]:", error);

        await logWebhookEvent({
            merchantOrderId: null,
            eventType: "EXCEPTION",
            payload: { rawText },
            headers: loggedHeaders,
            status: "failed",
            errorMessage: error.message,
        });

        return NextResponse.json(
            { success: false, message: "Internal server error processing webhook." },
            { status: 500 }
        );
    }
}
