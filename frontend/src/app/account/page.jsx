"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { FiLogOut, FiMapPin, FiPackage, FiShoppingBag } from "react-icons/fi";
import { useAddress } from "@/providers/AddressProvider";

export default function AccountPage() {
    const { user, logout, authLoading } = useAuth();
    const { addresses, addressLoading } = useAddress();

    console.log(user);

    if (authLoading) {
        return null;
    }

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
                            Login to view your account details.
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

    const fullName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        "Vanodhan Customer";

    const avatar =
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture;

    const email = user?.email || "Not available";

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
        })
        : "Recently joined";

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />
            <section className="pt-36 pb-16 sm:pt-40 lg:pt-44">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="mb-10 flex items-center justify-between gap-4">
                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                                My Account
                            </p>

                            <h1 className="text-4xl font-bold text-[var(--text)]">
                                Account Overview
                            </h1>
                        </div>

                        <button
                            onClick={logout}
                            className="hidden lg:flex items-center gap-3 rounded-full bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
                        >
                            <FiLogOut />
                            Logout
                        </button>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
                        {/* Profile Card */}
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                            <div className="flex items-center gap-5">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={fullName}
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)] text-2xl font-bold text-white">
                                        {fullName.charAt(0)}
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--text)]">
                                        {fullName}
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        {email}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-[var(--primary)]">
                                        Member since {memberSince}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Account Details */}
                        <div className="grid gap-6">
                            {/* Addresses */}
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[var(--text)]">
                                            Saved Addresses
                                        </h2>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Manage your delivery addresses.
                                        </p>
                                    </div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
                                        <FiMapPin size={22} />
                                    </div>
                                </div>

                                {addressLoading ? (
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Loading addresses...
                                    </p>
                                ) : addresses.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-[var(--border)] p-5">
                                        

                                            <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                                    No saved addresses yet. You can add a delivery address during checkout.
                                                </p>
                                            
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4"
                                            >
                                                <div className="flex gap-3">
                                                    <FiMapPin className="mt-1 shrink-0 text-[var(--primary)]" />

                                                    <div>
                                                        <h3 className="text-sm font-bold text-[var(--text)]">
                                                            {address.full_name}
                                                        </h3>

                                                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                                            {address.address_line_1}
                                                            {address.address_line_2
                                                                ? `, ${address.address_line_2}`
                                                                : ""}
                                                            , {address.city}, {address.state} - {address.pincode}
                                                        </p>

                                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                                            Phone: {address.phone}
                                                        </p>

                                                        {address.is_default && (
                                                            <span className="mt-3 inline-block rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Link
                                    href="/orders"
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition hover:-translate-y-1"
                                >
                                    <FiPackage className="mb-4 text-[var(--primary)]" size={28} />

                                    <h3 className="text-lg font-bold text-[var(--text)]">
                                        My Orders
                                    </h3>

                                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                        View your order history and status.
                                    </p>
                                </Link>

                                <Link
                                    href="/cart"
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition hover:-translate-y-1"
                                >
                                    <FiShoppingBag
                                        className="mb-4 text-[var(--primary)]"
                                        size={28}
                                    />

                                    <h3 className="text-lg font-bold text-[var(--text)]">
                                        My Cart
                                    </h3>

                                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                        Continue shopping from your cart.
                                    </p>
                                </Link>
                            </div>
                            <button
                                onClick={logout}
                                className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-red-500 px-6 py-4 font-semibold text-white transition hover:bg-red-600 lg:hidden"
                            >
                                <FiLogOut />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}