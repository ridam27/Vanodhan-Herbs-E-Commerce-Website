"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FiPackage, FiShoppingBag } from "react-icons/fi";

export default function OrdersPage() {
    const { user, authLoading } = useAuth();

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const estimatedDelivery = (createdAt) => {
        const date = new Date(createdAt);
        date.setDate(date.getDate() + 5);

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    useEffect(() => {
        const loadOrders = async () => {
            if (!user) {
                setOrdersLoading(false);
                return;
            }

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

        if (!authLoading) {
            loadOrders();
        }
    }, [authLoading, user]);

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
                            {orders.map((order) => {
                                const hiddenItemsCount =
                                    order.order_items.length - 2;

                                return (
                                    <Link
                                        href={`/orders/${order.id}`}
                                        key={order.id}
                                        className="block rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_25px_var(--shadow)] transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                                                    Order ID
                                                </p>

                                                <h3 className="mt-1 font-bold text-[var(--text)]">
                                                    #{order.id.slice(0, 8)}
                                                </h3>
                                            </div>

                                            <span
                                                className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize ${order.status === "cancelled" ||
                                                        order.status === "pending"
                                                        ? "border-red-500 text-red-500"
                                                        : "border-green-500 text-green-500"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            {order.order_items
                                                .slice(0, 2)
                                                .map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-4"
                                                    >
                                                        <img
                                                            src={item.product_image}
                                                            alt={item.product_name}
                                                            className="h-14 w-14 rounded-xl object-cover sm:h-16 sm:w-16"
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="truncate font-semibold text-[var(--text)]">
                                                                {item.product_name}
                                                            </h4>

                                                            <p className="text-sm text-[var(--text-secondary)]">
                                                                Qty: {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}

                                            {hiddenItemsCount > 0 && (
                                                <p className="pl-[72px] text-sm font-semibold text-[var(--primary)] sm:pl-20">
                                                    +{hiddenItemsCount} more item
                                                    {hiddenItemsCount > 1 ? "s" : ""}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-5 rounded-2xl bg-[var(--surface-2)] px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
                                                Estimated Delivery
                                            </p>

                                            <p className="mt-1 font-semibold text-[var(--text)]">
                                                {estimatedDelivery(order.created_at)}
                                            </p>
                                        </div>

                                        <div className="mt-5 border-t border-[var(--border)] pt-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                                                        Total
                                                    </p>

                                                    <p className="font-bold text-[var(--text)]">
                                                        ₹{order.total}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`w-fit rounded-full border px-3 py-1 text-sm font-semibold capitalize ${order.payment_status === "paid"
                                                            ? "border-green-500 text-green-500"
                                                            : "border-red-500 text-red-500"
                                                        }`}
                                                >
                                                    Payment {order.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}