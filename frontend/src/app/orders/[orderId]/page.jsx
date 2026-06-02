"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState, use } from "react";
import {
    FiArrowLeft,
    FiMapPin,
    FiPackage,
    FiCreditCard,
} from "react-icons/fi";

export default function OrderDetailsPage({ params }) {
    const { orderId } = use(params);
    const { user, authLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from("orders")
                .select(`
                    *,
                    addresses (*),
                    order_items (*)
                `)
                .eq("id", orderId)
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error(error.message);
                setLoading(false);
                return;
            }

            setOrder(data);
            setLoading(false);
        };

        if (!authLoading) {
            loadOrder();
        }
    }, [authLoading, user, orderId]);

    if (authLoading || loading) {
        return null;
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
                <Navbar />

                <section className="flex min-h-screen items-center justify-center px-5 pt-28 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold">Please Login</h1>

                        <p className="mt-4 text-[var(--text-secondary)]">
                            Login to view order details.
                        </p>

                        <Link
                            href="/auth"
                            className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white"
                        >
                            Login
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
                <Navbar />

                <section className="mx-auto max-w-7xl px-5 pt-40">
                    <h1 className="text-3xl font-bold">Order not found</h1>

                    <Link
                        href="/orders"
                        className="mt-6 inline-flex text-[var(--primary)]"
                    >
                        Back to Orders
                    </Link>
                </section>
            </main>
        );
    }

    const address = order.addresses;

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            <section className="pt-36 pb-16 sm:pt-40 lg:pt-44">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <Link
                        href="/orders"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
                    >
                        <FiArrowLeft />
                        Back to Orders
                    </Link>

                    <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                                Order Details
                            </p>

                            <h1 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
                                #{order.id.slice(0, 8)}
                            </h1>

                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                Placed on{" "}
                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        <div
                            className={`w-fit rounded-3xl border px-5 py-4 text-left shadow-sm ${order.status === "cancelled"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-green-200 bg-green-50 text-green-700"
                                }`}
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                                Order Status
                            </p>

                            <p className="mt-1 text-lg font-bold capitalize">
                                {order.status}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                <div className="mb-5 flex items-center gap-3">
                                    <FiPackage className="text-[var(--primary)]" size={24} />

                                    <h2 className="text-2xl font-bold">
                                        Products
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0"
                                        >
                                            <img
                                                src={item.product_image}
                                                alt={item.product_name}
                                                className="h-20 w-20 rounded-2xl object-cover"
                                            />

                                            <div className="flex flex-1 justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-[var(--text)]">
                                                        {item.product_name}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                        Qty: {item.quantity}
                                                    </p>

                                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                        Price: ₹{item.price_at_purchase}
                                                    </p>
                                                </div>

                                                <p className="font-bold text-[var(--primary)]">
                                                    ₹{item.line_total}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                <div className="mb-5 flex items-center gap-3">
                                    <FiMapPin className="text-[var(--primary)]" size={24} />

                                    <h2 className="text-2xl font-bold">
                                        Delivery Address
                                    </h2>
                                </div>

                                <h3 className="font-bold text-[var(--text)]">
                                    {address.full_name}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                    {address.address_line_1}
                                    {address.address_line_2
                                        ? `, ${address.address_line_2}`
                                        : ""}
                                    , {address.city}, {address.state} - {address.pincode}
                                </p>

                                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                    Phone: {address.phone}
                                </p>
                            </div>
                        </div>

                        <div className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] lg:sticky lg:top-32">
                            <div className="mb-5 flex items-center gap-3">
                                <FiCreditCard
                                    className="text-[var(--primary)]"
                                    size={24}
                                />

                                <h2 className="text-2xl font-bold">
                                    Payment Summary
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <span>Subtotal</span>
                                    <span>₹{order.subtotal}</span>
                                </div>

                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <span>Delivery</span>
                                    <span>
                                        {order.delivery_charge === 0
                                            ? "FREE"
                                            : `₹${order.delivery_charge}`}
                                    </span>
                                </div>

                                {order.coupon_discount > 0 && (
                                    <div className="flex justify-between gap-4 text-green-600">
                                        <span>
                                            {order.coupon_code} Coupon
                                        </span>

                                        <span className="font-semibold">
                                            -₹{order.coupon_discount}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-[var(--border)] pt-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span>₹{order.total}</span>
                                    </div>
                                </div>

                                <div className="pt-4 text-sm text-[var(--text-secondary)]">
                                    <p>Payment Method: {order.payment_method}</p>
                                    <p className="mt-1">
                                        Payment Status: {order.payment_status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}