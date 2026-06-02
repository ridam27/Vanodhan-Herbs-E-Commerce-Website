"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function OrdersPage() {
    const { user, authLoading } = useAuth();

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);


    useEffect(() => {
        const loadOrders = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from("orders")
                .select(`
                *,
                order_items (*)
            `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error(error.message);
                setOrdersLoading(false);
                return;
            }

            setOrders(data || []);
            setOrdersLoading(false);
        };

        loadOrders();
    }, [user]);

    if (authLoading) return null;

    if (!user) {
        return (
            <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
                <Navbar />

                <section className="flex min-h-screen items-center justify-center px-5 pt-28 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-[var(--text)]">
                            Please Login
                        </h1>

                        <p className="mt-4 text-[var(--text-secondary)]">
                            Login to view your orders.
                        </p>

                        <Link
                            href="/auth"
                            className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                        >
                            Login
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            <section className="pt-36 pb-16 sm:pt-40 lg:pt-44">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                            My Orders
                        </p>

                        <h1 className="text-4xl font-bold text-[var(--text)]">
                            Order History
                        </h1>
                    </div>

                    {ordersLoading ? (
                        <p className="text-center text-[var(--text-secondary)]">
                            Loading orders...
                        </p>
                    ) : orders.length === 0 ? (
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-[0_8px_25px_var(--shadow)]">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--primary)]">
                                <FiPackage size={34} />
                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-[var(--text)]">
                                No Orders Yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                                Looks like you haven&apos;t placed any orders yet.
                            </p>

                            <Link
                                href="/shop"
                                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                            >
                                <FiShoppingBag />
                                Shop Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                Order ID
                                            </p>

                                            <h3 className="font-bold text-[var(--text)]">
                                                #{order.id.slice(0, 8)}
                                            </h3>
                                        </div>

                                        <span
                                            className={`rounded-full px-4 py-2 text-sm font-semibold 
                                                    ${order.status === "cancelled" ||
                                                    order.status === "pending"
                                                    ? "bg-red-50 text-red-600"
                                                    : "bg-green-50 text-green-700"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {order.order_items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4"
                                            >
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="h-16 w-16 rounded-xl object-cover"
                                                />

                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-[var(--text)]">
                                                        {item.product_name}
                                                    </h4>

                                                    <p className="text-sm text-[var(--text-secondary)]">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>

                                                <p className="font-bold text-[var(--primary)]">
                                                    ₹{item.line_total}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-5 border-t border-[var(--border)] pt-4">
                                        <div className="flex justify-between font-bold text-[var(--text)]">
                                            <span>Total</span>
                                            <span>₹{order.total}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}