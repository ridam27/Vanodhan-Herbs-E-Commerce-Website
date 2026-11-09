"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useAddress } from "@/providers/AddressProvider";
import {
    FiLogOut,
    FiMapPin,
    FiPackage,
    FiShoppingBag,
    FiPhone,
    FiMail,
    FiCalendar,
    FiCheckCircle,
    FiAlertCircle,
    FiShield,
    FiChevronRight,
    FiHeadphones,
    FiLock,
    FiExternalLink,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

function formatPhoneNumber(phone) {
    if (!phone) return null;
    const str = String(phone).trim();
    const digitsOnly = str.replace(/\D/g, "");

    // e.g. 919876543210 (12 digits with 91 prefix)
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
        const core = digitsOnly.slice(2);
        return `+91 ${core.slice(0, 5)} ${core.slice(5)}`;
    }
    // 10 digits without prefix
    if (digitsOnly.length === 10) {
        return `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
    }
    // Already in international or other custom format
    if (str.startsWith("+")) {
        return str;
    }
    return `+91 ${str}`;
}

export default function AccountPage() {
    const { user, logout, authLoading, profileStatus, setShowVerificationModal } = useAuth();
    const { addresses, addressLoading } = useAddress();

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
                            className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)] shadow-md"
                        >
                            Login
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    const googleIdentity = user?.identities?.find(
        (id) => id.provider === "google"
    )?.identity_data;

    const fullName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        googleIdentity?.full_name ||
        googleIdentity?.name ||
        "Vanodhan Customer";

    const avatar =
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        googleIdentity?.avatar_url ||
        googleIdentity?.picture;

    const email = user?.email || googleIdentity?.email || "Not available";

    // Authoritative phone number resolution from Supabase Auth & server profile status
    const rawPhone =
        user?.phone ||
        profileStatus?.phone ||
        profileStatus?.user?.phone ||
        user?.user_metadata?.phone ||
        null;

    const formattedPhone = formatPhoneNumber(rawPhone);

    const hasPhoneVerified = Boolean(
        user?.phone ||
        profileStatus?.hasPhone ||
        (rawPhone && String(rawPhone).replace(/\D/g, "").length >= 10)
    );

    const hasGoogleLinked = Boolean(
        user?.identities?.some((id) => id.provider === "google") ||
        user?.app_metadata?.providers?.includes("google") ||
        (user?.app_metadata?.provider === "google" && user?.email)
    );

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
                    {/* Header Bar */}
                    <div className="mb-10 flex items-center justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                                Customer Account
                            </p>

                            <h1 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
                                Account Overview
                            </h1>
                        </div>

                        <button
                            onClick={logout}
                            className="hidden lg:flex items-center gap-2.5 rounded-full bg-red-500/10 border border-red-500/20 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white dark:text-red-400"
                        >
                            <FiLogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
                        {/* ==================================================== */}
                        {/* REDESIGNED LEFT ACCOUNT INFO CARD                    */}
                        {/* ==================================================== */}
                        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_35px_var(--shadow)] transition-all duration-300">
                            {/* Decorative Ayurvedic Botanical Header Banner */}
                            <div className="relative h-28 w-full bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-teal-600/15 p-5 dark:from-emerald-950/60 dark:to-zinc-900">
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--primary)]/20 blur-2xl"
                                />

                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[var(--surface)]/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[var(--primary)] shadow-sm">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                        </span>
                                        <span>Wellness Member</span>
                                    </span>

                                    <span className="text-[11px] font-mono font-medium text-[var(--text-secondary)]">
                                        ID #{user.id.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Main Body */}
                            <div className="px-6 pb-6 pt-0 sm:px-8">
                                {/* Profile Avatar & Name */}
                                <div className="-mt-12 flex items-end justify-between gap-4">
                                    <div className="relative">
                                        {avatar ? (
                                            <Image
                                                src={avatar}
                                                alt={fullName}
                                                width={96}
                                                height={96}
                                                unoptimized
                                                className="h-24 w-24 rounded-full object-cover ring-4 ring-[var(--surface)] shadow-lg bg-[var(--surface)]"
                                            />
                                        ) : (
                                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-3xl font-extrabold text-white ring-4 ring-[var(--surface)] shadow-lg">
                                                {fullName.charAt(0)}
                                            </div>
                                        )}

                                        <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-white ring-2 ring-[var(--surface)] shadow">
                                            <FiShield size={14} />
                                        </div>
                                    </div>

                                    <div className="hidden sm:block text-right">
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">Status</span>
                                        <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            <FiCheckCircle size={13} />
                                            <span>Active Account</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Name & Welcome Tagline */}
                                <div className="mt-4">
                                    <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">
                                        {fullName}
                                    </h2>
                                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                        Vanodhan Herbs Ayurvedic Health &amp; Natural Care
                                    </p>
                                </div>

                                {/* Divider */}
                                <hr className="my-6 border-[var(--border)]" />

                                {/* Detailed Contact Info Rows */}
                                <div className="space-y-4">
                                    {/* 1. Email Address Row */}
                                    <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3.5 transition-colors hover:border-[var(--primary)]/40">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                                <FiMail size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                                    Email Address
                                                </span>
                                                <p className="mt-0.5 truncate text-sm font-semibold text-[var(--text)]">
                                                    {email}
                                                </p>
                                            </div>
                                        </div>

                                        {hasGoogleLinked && (
                                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                <FcGoogle size={13} />
                                                <span className="hidden sm:inline">Linked</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* 2. Phone Number Row */}
                                    <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3.5 transition-colors hover:border-[var(--primary)]/40">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                                <FiPhone size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                                    Phone Number
                                                </span>
                                                {formattedPhone ? (
                                                    <p className="mt-0.5 text-sm font-bold text-[var(--text)] tracking-wide">
                                                        {formattedPhone}
                                                    </p>
                                                ) : (
                                                    <p className="mt-0.5 text-sm italic text-[var(--text-secondary)]">
                                                        No phone number linked
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {hasPhoneVerified ? (
                                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <FiCheckCircle size={12} />
                                                <span>Verified</span>
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setShowVerificationModal(true)}
                                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 transition hover:bg-amber-500 hover:text-white dark:text-amber-400"
                                            >
                                                <FiAlertCircle size={12} />
                                                <span>Verify Now</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* 3. Member Since Row */}
                                    <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3.5 transition-colors hover:border-[var(--primary)]/40">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                                <FiCalendar size={16} />
                                            </div>
                                            <div>
                                                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                                    Member Since
                                                </span>
                                                <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">
                                                    {memberSince}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-[11px] font-medium text-[var(--primary)]">
                                            Ayurveda Care
                                        </span>
                                    </div>
                                </div>

                                {/* Verification Security Banner */}
                                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                                            <FiShield size={14} className="text-[var(--primary)]" />
                                            Security &amp; Dual Verification
                                        </span>
                                        <span className={`text-[11px] font-bold ${hasPhoneVerified && hasGoogleLinked ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                            {hasPhoneVerified && hasGoogleLinked ? "Complete (2/2)" : "Action Required"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px] mt-3">
                                        <div className={`flex items-center gap-1.5 rounded-xl border p-2 ${hasGoogleLinked ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"}`}>
                                            <FcGoogle size={14} />
                                            <span className="truncate">{hasGoogleLinked ? "Google Linked" : "Google Pending"}</span>
                                        </div>

                                        <div className={`flex items-center gap-1.5 rounded-xl border p-2 ${hasPhoneVerified ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"}`}>
                                            <FiPhone size={13} className={hasPhoneVerified ? "text-emerald-600" : "text-amber-600"} />
                                            <span className="truncate">{hasPhoneVerified ? "Phone Verified" : "Phone Pending"}</span>
                                        </div>
                                    </div>

                                    {(!hasPhoneVerified || !hasGoogleLinked) && (
                                        <button
                                            type="button"
                                            onClick={() => setShowVerificationModal(true)}
                                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--primary-hover)]"
                                        >
                                            <span>Complete Identity Linking</span>
                                            <FiChevronRight size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Support Link Footer */}
                                <div className="mt-5">
                                    <Link
                                        href="/contact/tickets"
                                        className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-2)]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <FiHeadphones className="text-[var(--primary)]" size={16} />
                                            <span>View My Support Tickets</span>
                                        </span>
                                        <FiChevronRight size={16} className="text-[var(--text-secondary)]" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ==================================================== */}
                        {/* RIGHT COLUMN: ADDRESSES & QUICK ACTIONS              */}
                        {/* ==================================================== */}
                        <div className="grid gap-6">
                            {/* Saved Addresses */}
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[var(--text)]">
                                            Saved Addresses
                                        </h2>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Manage your delivery addresses for seamless checkout.
                                        </p>
                                    </div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md">
                                        <FiMapPin size={22} />
                                    </div>
                                </div>

                                {addressLoading ? (
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Loading addresses...
                                    </p>
                                ) : addresses.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-center">
                                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                            No saved addresses yet. You can add and manage addresses during checkout.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:border-[var(--primary)]/40"
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

                                                        <p className="mt-1 text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                                                            <FiPhone size={13} className="text-[var(--primary)]" />
                                                            <span>Phone: {address.phone}</span>
                                                        </p>

                                                        {address.is_default && (
                                                            <span className="mt-3 inline-block rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white shadow-sm">
                                                                Default Delivery Address
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions Grid */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Link
                                    href="/orders"
                                    className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition-all hover:-translate-y-1 hover:border-[var(--primary)]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform group-hover:scale-110">
                                        <FiPackage size={24} />
                                    </div>

                                    <h3 className="mt-4 text-lg font-bold text-[var(--text)]">
                                        My Orders
                                    </h3>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Track shipments, download tax invoices, and view order history.
                                    </p>
                                </Link>

                                <Link
                                    href="/cart"
                                    className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition-all hover:-translate-y-1 hover:border-[var(--primary)]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform group-hover:scale-110">
                                        <FiShoppingBag size={24} />
                                    </div>

                                    <h3 className="mt-4 text-lg font-bold text-[var(--text)]">
                                        My Cart
                                    </h3>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Review your selected herbal powders, churnas, and checkout.
                                    </p>
                                </Link>
                            </div>

                            {/* Mobile Logout Button */}
                            <button
                                onClick={logout}
                                className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-red-500 px-6 py-4 font-semibold text-white transition hover:bg-red-600 lg:hidden shadow-md"
                            >
                                <FiLogOut />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
