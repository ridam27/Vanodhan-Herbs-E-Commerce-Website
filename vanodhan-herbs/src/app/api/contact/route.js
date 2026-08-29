import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_INQUIRY_TYPES = [
    "General Inquiry",
    "Order Status & Shipping",
    "Payment Status & Failure",
    "Herbal Usage Advice",
    "Wholesale & Bulk Orders",
];

// Basic HTML sanitization to prevent XSS injection
function sanitizeText(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(request) {
    try {
        // 1. Bearer Token Authentication
        const authHeader = request.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in to submit your support query." },
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
                { success: false, message: "Session expired or invalid. Please log in again." },
                { status: 401 }
            );
        }

        // 2. Parse Payload
        const body = await request.json();
        const { fullName, email, phone, inquiryType, subject, message } = body;

        // 3. Validation Rules
        if (!fullName || String(fullName).trim().length < 2) {
            return NextResponse.json(
                { success: false, message: "Full Name must be at least 2 characters long." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(String(email).trim())) {
            return NextResponse.json(
                { success: false, message: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        if (!inquiryType || !VALID_INQUIRY_TYPES.includes(inquiryType)) {
            return NextResponse.json(
                { success: false, message: "Invalid inquiry category selected." },
                { status: 400 }
            );
        }

        if (!subject || String(subject).trim().length < 3 || String(subject).trim().length > 200) {
            return NextResponse.json(
                { success: false, message: "Subject must be between 3 and 200 characters long." },
                { status: 400 }
            );
        }

        if (!message || String(message).trim().length < 10 || String(message).trim().length > 2000) {
            return NextResponse.json(
                { success: false, message: "Message must be between 10 and 2000 characters long." },
                { status: 400 }
            );
        }

        // 4. Rate Limiting Check (Max 2 queries per user within 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

        const { data: recentQueries, error: rateLimitError } = await supabaseAdmin
            .from("support_queries")
            .select("id")
            .eq("user_id", user.id)
            .gte("created_at", fifteenMinutesAgo);

        if (!rateLimitError && recentQueries && recentQueries.length >= 2) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Rate limit reached. You can submit maximum 2 support queries per 15 minutes.",
                },
                { status: 429 }
            );
        }

        // 5. Extract IP & User Agent for security log
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown IP";
        const userAgent = request.headers.get("user-agent") || "Unknown User Agent";

        // 6. Database Insertion
        const { data: queryRecord, error: insertError } = await supabaseAdmin
            .from("support_queries")
            .insert({
                user_id: user.id,
                full_name: sanitizeText(String(fullName).trim()),
                email: String(email).trim().toLowerCase(),
                phone: phone ? sanitizeText(String(phone).trim()) : null,
                inquiry_type: inquiryType,
                subject: sanitizeText(String(subject).trim()),
                message: sanitizeText(String(message).trim()),
                ip_address: ip,
                user_agent: userAgent,
                status: "pending",
            })
            .select("id, status, created_at")
            .single();

        if (insertError) {
            console.error("Supabase support_queries Insert Error:", insertError);
            return NextResponse.json(
                { success: false, message: "Failed to submit support query. Please try again later." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Your support query has been submitted successfully.",
                queryId: queryRecord.id,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Contact API Exception:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
