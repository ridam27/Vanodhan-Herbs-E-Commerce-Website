"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { FiPackage, FiShoppingBag } from "react-icons/fi";

export default function OrdersPage() {
    const { user, authLoading } = useAuth();

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

                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-[0_8px_25px_var(--shadow)]">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--primary)]">
                            <FiPackage size={34} />
                        </div>

                        <h2 className="mt-6 text-2xl font-bold text-[var(--text)]">
                            No Orders Yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                            Looks like you haven&apos;t placed any orders yet. Start exploring
                            Vanodhan Herbs products and place your first order.
                        </p>

                        <Link
                            href="/shop"
                            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                        >
                            <FiShoppingBag />
                            Shop Products
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}