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
    FiCopy,
    FiTruck,
} from "react-icons/fi";

export default function OrderDetailsPage({ params }) {
    const { orderId } = use(params);
    const { user, authLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const [copied, setCopied] = useState(false);

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

    const isCancelled =
        order.status === "cancelled";

    const orderSteps = [
        "confirmed",
        "packed",
        "shipped",
        "delivered",
    ];

    const currentStepIndex = orderSteps.indexOf(order.status);

    const estimatedDelivery = new Date(order.created_at);

    estimatedDelivery.setDate(
        estimatedDelivery.getDate() + 5
    );

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

                    <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                                Order Details
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
                                    #{order.id.slice(0, 8)}
                                </h1>

                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(order.id);
                                        setCopied(true);

                                        setTimeout(() => {
                                            setCopied(false);
                                        }, 2000);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                >
                                    <FiCopy size={14} />
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                Placed on{" "}
                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                            {/* Estimated Delivery */}
                            <div className="col-span-2 rounded-3xl border border-[var(--primary)] bg-[var(--surface)] px-5 py-4 shadow-sm lg:col-span-1">
                                <p className="text-sm font-semibold text-[var(--primary)] lg:text-xs lg:uppercase lg:tracking-[0.2em]">
                                    Estimated Delivery Date:{" "}
                                    <span className="font-bold text-[var(--primary)] lg:block lg:mt-1 lg:text-lg">
                                        {estimatedDelivery.toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </p>
                            </div>

                            {/* Order Status */}
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm flex-1 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                                    Order Status
                                </p>

                                <p
                                    className={`mt-1 text-lg font-bold capitalize ${order.status === "cancelled"
                                        ? "text-red-500"
                                        : "text-green-500"
                                        }`}
                                >
                                    {order.status}
                                </p>
                            </div>

                            {/* Payment Status */}
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm flex-1 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                                    Payment Status
                                </p>

                                <p
                                    className={`mt-1 text-lg font-bold capitalize ${order.payment_status === "paid"
                                        ? "text-green-500"
                                        : order.payment_status === "failed"
                                            ? "text-red-500"
                                            : "text-orange-500"
                                        }`}
                                >
                                    {order.payment_status}
                                </p>
                            </div>
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

                        <div className="space-y-6 lg:sticky lg:top-32 lg:h-fit">
                            {!isCancelled && (
                                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <FiTruck
                                            className="text-[var(--primary)]"
                                            size={24}
                                        />
                                        <h2 className=" text-2xl font-bold text-[var(--text)]">
                                            Order Timeline
                                        </h2>
                                    </div>

                                    <div className="space-y-0">
                                        {orderSteps.map((step, index) => {
                                            const completed = currentStepIndex >= index;
                                            const lineCompleted = currentStepIndex > index;
                                            const isLast = index === orderSteps.length - 1;

                                            return (
                                                <div key={step} className="relative flex items-start gap-4">
                                                    <div className="relative flex flex-col items-center">
                                                        <div
                                                            className={`z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${completed
                                                                ? "bg-green-500 text-white"
                                                                : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        {!isLast && (
                                                            <div
                                                                className={`h-6 w-[2px] ${lineCompleted
                                                                    ? "bg-green-500"
                                                                    : "bg-[var(--border)]"
                                                                    }`}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="pt-2">
                                                        <p
                                                            className={`font-semibold capitalize ${completed
                                                                ? "text-green-600"
                                                                : "text-[var(--text-secondary)]"
                                                                }`}
                                                        >
                                                            {step}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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

                                    <div className="flex flex-col gap-3 pt-4 sm:flex-col sm:start sm:justify-between">
                                        <div>
                                            <span className="font-semibold text-[var(--primary)]">
                                                Payment Status:
                                            </span>

                                            <span
                                                className={`ml-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold capitalize ${order.payment_status === "paid"
                                                    ? "border-green-200 bg-green-50 text-green-700"
                                                    : order.payment_status === "failed"
                                                        ? "border-red-200 bg-red-50 text-red-600"
                                                        : "border-orange-200 bg-orange-50 text-orange-600"
                                                    }`}
                                            >
                                                {order.payment_status}
                                            </span>
                                        </div>

                                        <div className="sm:text-left">
                                            <span className="font-semibold text-[var(--primary)]">
                                                Payment Method:
                                            </span>

                                            <span className="ml-2 inline-flex rounded-full border border-[var(--primary)] bg-[var(--primary)]/5 px-3 py-1 text-sm font-semibold uppercase text-[var(--primary)]">
                                                {order.payment_method}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}