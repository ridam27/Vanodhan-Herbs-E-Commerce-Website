import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getSellingPrice(product) {
    const price = Number(product.price || 0);
    const discount = Number(product.discount || 0);

    return discount > 0
        ? Math.round(price - (price * discount) / 100)
        : price;
}

export async function POST(request) {
    try {
        const ip =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";

        const tenMinutesAgo = new Date(
            Date.now() - 10 * 60 * 1000
        ).toISOString();

        const { count } = await supabaseAdmin
            .from("coupon_attempts")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq("ip", ip)
            .gte("attempted_at", tenMinutesAgo);

        if (count > 10) {
            return NextResponse.json(
                {
                    valid: false,
                    message: "Too many attempts. Try again later.",
                },
                { status: 429 }
            );
        }

        await supabaseAdmin.from("coupon_attempts").insert({ ip });

        const authHeader = request.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { valid: false, message: "Unauthorized request." },
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
                { valid: false, message: "Invalid session." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const couponCode = String(body.couponCode || "")
            .trim()
            .toUpperCase();

        if (!couponCode || couponCode.length > 30) {
            return NextResponse.json(
                { valid: false, message: "Invalid coupon code." },
                { status: 400 }
            );
        }

        const { data: cartItems, error: cartError } = await supabaseAdmin
            .from("cart_items")
            .select(`
        product_id,
        quantity,
        products (
          id,
          price,
          discount,
          is_active,
          stock_quantity
        )
      `)
            .eq("user_id", user.id);

        if (cartError) {
            return NextResponse.json(
                { valid: false, message: "Unable to check cart." },
                { status: 500 }
            );
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { valid: false, message: "Cart is empty." },
                { status: 400 }
            );
        }

        let subtotal = 0;

        for (const item of cartItems) {
            const product = item.products;

            if (!product || !product.is_active) {
                return NextResponse.json(
                    { valid: false, message: "Cart contains unavailable product." },
                    { status: 400 }
                );
            }

            if (Number(product.stock_quantity) < Number(item.quantity)) {
                return NextResponse.json(
                    { valid: false, message: "Some products are out of stock." },
                    { status: 400 }
                );
            }

            subtotal += getSellingPrice(product) * Number(item.quantity);
        }

        const { data: coupon, error: couponError } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .eq("code", couponCode)
            .eq("is_active", true)
            .single();

        if (couponError || !coupon) {
            return NextResponse.json(
                { valid: false, message: "Invalid coupon code." },
                { status: 404 }
            );
        }

        const now = new Date();
        const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
        const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

        if (startsAt && startsAt > now) {
            return NextResponse.json(
                { valid: false, message: "Coupon is not active yet." },
                { status: 400 }
            );
        }

        if (expiresAt && expiresAt <= now) {
            return NextResponse.json(
                { valid: false, message: "Coupon has expired." },
                { status: 400 }
            );
        }

        if (subtotal < Number(coupon.min_order_amount)) {
            return NextResponse.json(
                {
                    valid: false,
                    message: `Minimum order amount is ₹${coupon.min_order_amount}.`,
                },
                { status: 400 }
            );
        }

        if (
            coupon.usage_limit !== null &&
            Number(coupon.used_count) >= Number(coupon.usage_limit)
        ) {
            return NextResponse.json(
                { valid: false, message: "Coupon usage limit reached." },
                { status: 400 }
            );
        }

        const { count: userUsageCount, error: usageError } = await supabaseAdmin
            .from("coupon_redemptions")
            .select("id", { count: "exact", head: true })
            .eq("coupon_id", coupon.id)
            .eq("user_id", user.id);

        if (usageError) {
            return NextResponse.json(
                { valid: false, message: "Unable to verify coupon usage." },
                { status: 500 }
            );
        }

        if (Number(userUsageCount || 0) >= Number(coupon.per_user_limit)) {
            return NextResponse.json(
                { valid: false, message: "You have already used this coupon." },
                { status: 400 }
            );
        }

        let couponDiscount = 0;

        if (coupon.discount_type === "percentage") {
            couponDiscount = Math.floor(
                (subtotal * Number(coupon.discount_value)) / 100
            );

            if (coupon.max_discount !== null) {
                couponDiscount = Math.min(couponDiscount, Number(coupon.max_discount));
            }
        }

        if (coupon.discount_type === "fixed") {
            couponDiscount = Number(coupon.discount_value);
        }

        couponDiscount = Math.min(couponDiscount, subtotal);

        return NextResponse.json({
            valid: true,
            message: "Coupon applied successfully.",
            coupon: {
                id: coupon.id,
                code: coupon.code,
            },
            subtotal,
            couponDiscount,
            payableAmount: subtotal - couponDiscount,
        });
    } catch (error) {
        return NextResponse.json(
            { valid: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}