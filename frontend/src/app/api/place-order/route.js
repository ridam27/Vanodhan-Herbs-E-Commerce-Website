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

async function validateCoupon({ couponCode, userId, subtotal }) {
    if (!couponCode) {
        return {
            coupon: null,
            couponDiscount: 0,
        };
    }

    const code = String(couponCode).trim().toUpperCase();

    const { data: coupon, error } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .single();

    if (error || !coupon) {
        throw new Error("Invalid coupon code.");
    }

    const now = new Date();
    const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (startsAt && startsAt > now) {
        throw new Error("Coupon is not active yet.");
    }

    if (expiresAt && expiresAt <= now) {
        throw new Error("Coupon has expired.");
    }

    if (subtotal < Number(coupon.min_order_amount)) {
        throw new Error(`Minimum order amount is ₹${coupon.min_order_amount}.`);
    }

    if (
        coupon.usage_limit !== null &&
        Number(coupon.used_count) >= Number(coupon.usage_limit)
    ) {
        throw new Error("Coupon usage limit reached.");
    }

    const { count } = await supabaseAdmin
        .from("coupon_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .eq("user_id", userId);

    if (Number(count || 0) >= Number(coupon.per_user_limit)) {
        throw new Error("You have already used this coupon.");
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

    return {
        coupon,
        couponDiscount,
    };
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

        const body = await request.json();

        const addressId = body.addressId;
        const couponCode = body.couponCode || null;
        const paymentMethod = body.paymentMethod || "cod";

        if (!addressId) {
            return NextResponse.json(
                { success: false, message: "Address is required." },
                { status: 400 }
            );
        }

        if (!["cod", "razorpay"].includes(paymentMethod)) {
            return NextResponse.json(
                { success: false, message: "Invalid payment method." },
                { status: 400 }
            );
        }

        const { data: address, error: addressError } = await supabaseAdmin
            .from("addresses")
            .select("id, user_id")
            .eq("id", addressId)
            .eq("user_id", user.id)
            .single();

        if (addressError || !address) {
            return NextResponse.json(
                { success: false, message: "Invalid delivery address." },
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
                    name,
                    image,
                    price,
                    discount,
                    is_active,
                    stock_quantity
                )
            `)
            .eq("user_id", user.id);

        if (cartError) {
            return NextResponse.json(
                { success: false, message: "Unable to fetch cart." },
                { status: 500 }
            );
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { success: false, message: "Cart is empty." },
                { status: 400 }
            );
        }

        let subtotal = 0;

        const orderItemsPayload = cartItems.map((item) => {
            const product = item.products;
            const quantity = Number(item.quantity);

            if (!product || !product.is_active) {
                throw new Error("Cart contains unavailable product.");
            }

            if (Number(product.stock_quantity) < quantity) {
                throw new Error(`${product.name} is out of stock.`);
            }

            const sellingPrice = getSellingPrice(product);
            const lineTotal = sellingPrice * quantity;

            subtotal += lineTotal;

            return {
                product_id: product.id,
                product_name: product.name,
                product_image: product.image,
                mrp: Number(product.price),
                discount: Number(product.discount || 0),
                price_at_purchase: sellingPrice,
                quantity,
                line_total: lineTotal,
            };
        });

        const deliveryCharge = subtotal >= 499 ? 0 : 50;

        const { coupon, couponDiscount } = await validateCoupon({
            couponCode,
            userId: user.id,
            subtotal,
        });

        const total = subtotal + deliveryCharge - couponDiscount;

        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user.id,
                address_id: addressId,
                subtotal,
                delivery_charge: deliveryCharge,
                coupon_id: coupon?.id || null,
                coupon_code: coupon?.code || null,
                coupon_discount: couponDiscount,
                total,
                status: paymentMethod === "cod" ? "confirmed" : "pending",
                payment_status: paymentMethod === "cod" ? "pending" : "pending",
                payment_method: paymentMethod,
            })
            .select("id")
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { success: false, message: "Unable to create order." },
                { status: 500 }
            );
        }

        const orderItemsWithOrderId = orderItemsPayload.map((item) => ({
            ...item,
            order_id: order.id,
        }));

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItemsWithOrderId);

        if (itemsError) {
            await supabaseAdmin.from("orders").delete().eq("id", order.id);

            return NextResponse.json(
                { success: false, message: "Unable to create order items." },
                { status: 500 }
            );
        }

        for (const item of cartItems) {
            await supabaseAdmin
                .from("products")
                .update({
                    stock_quantity:
                        Number(item.products.stock_quantity) - Number(item.quantity),
                })
                .eq("id", item.product_id);
        }

        if (coupon) {
            await supabaseAdmin
                .from("coupons")
                .update({
                    used_count: Number(coupon.used_count) + 1,
                })
                .eq("id", coupon.id);

            await supabaseAdmin.from("coupon_redemptions").insert({
                coupon_id: coupon.id,
                user_id: user.id,
                order_id: order.id,
            });
        }

        await supabaseAdmin
            .from("cart_items")
            .delete()
            .eq("user_id", user.id);

        return NextResponse.json({
            success: true,
            message: "Order placed successfully.",
            orderId: order.id,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Something went wrong.",
            },
            { status: 500 }
        );
    }
}