"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import {
    FiSend,
    FiCheckCircle,
    FiUser,
    FiMail,
    FiPhone,
    FiTag,
    FiLock,
    FiAlertCircle,
    FiRefreshCw,
    FiLogIn,
    FiX,
} from "react-icons/fi";

const DRAFT_STORAGE_KEY = "vanodhan_contact_draft";

export default function ContactForm({ onQuerySubmitted }) {
    const { user, isLoggedIn } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        inquiryType: "General Inquiry",
        subject: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [restoredNotice, setRestoredNotice] = useState(false);

    // 1. Rehydrate draft or prefill user details on mount / auth change
    useEffect(() => {
        const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);

        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData((prev) => ({
                    ...prev,
                    ...parsed,
                    // If user is logged in, prioritize user's actual email/name if draft lacked them
                    email: parsed.email || user?.email || "",
                    fullName: parsed.fullName || user?.user_metadata?.full_name || user?.user_metadata?.name || "",
                }));

                if (isLoggedIn) {
                    setRestoredNotice(true);
                    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
                }
            } catch (e) {
                console.error("Failed to parse saved contact draft:", e);
                sessionStorage.removeItem(DRAFT_STORAGE_KEY);
            }
        } else if (user) {
            // Auto pre-fill logged in user email and name
            setFormData((prev) => ({
                ...prev,
                email: prev.email || user.email || "",
                fullName: prev.fullName || user.user_metadata?.full_name || user.user_metadata?.name || "",
            }));
        }
    }, [user, isLoggedIn]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrorMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // 2. Check if user is logged in
        if (!isLoggedIn || !user) {
            // Save typed message draft to sessionStorage so work is never lost
            sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
            setShowAuthModal(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // Get current Supabase session token
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                setErrorMessage("Authentication session expired. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "Failed to submit support query. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // Success! Clear session storage draft
            sessionStorage.removeItem(DRAFT_STORAGE_KEY);
            setSubmittedData(result);
            setIsSubmitting(false);
            if (onQuerySubmitted) {
                onQuerySubmitted();
            }
            setFormData({
                fullName: user.user_metadata?.full_name || user.user_metadata?.name || "",
                email: user.email || "",
                phone: "",
                inquiryType: "General Inquiry",
                subject: "",
                message: "",
            });
        } catch (error) {
            console.error("Submit Error:", error);
            setErrorMessage("Network error. Please check your connection and try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-[0_10px_30px_var(--shadow)]">
            {/* Draft Restored Banner */}
            {restoredNotice && (
                <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                        <FiRefreshCw className="animate-spin text-emerald-500" />
                        <span>Welcome back! Your saved support query draft has been restored.</span>
                    </div>
                    <button
                        onClick={() => setRestoredNotice(false)}
                        className="text-emerald-600 dark:text-emerald-400 hover:opacity-75"
                    >
                        <FiX size={18} />
                    </button>
                </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                    <FiAlertCircle className="shrink-0 text-red-500" size={20} />
                    <span>{errorMessage}</span>
                </div>
            )}

            {submittedData ? (
                /* Success Confirmation State */
                <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-6">
                        <FiCheckCircle size={44} />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text)]">
                        Support Query Submitted!
                    </h3>
                    <p className="mt-2 text-xs font-mono uppercase tracking-widest text-[var(--primary)]">
                        Query Ticket ID: {submittedData.queryId?.slice(0, 8) || "SUCCESS"}
                    </p>
                    <p className="mt-4 max-w-md text-base text-[var(--text-secondary)] leading-relaxed">
                        Your query has been logged securely in our support system. Our botanical specialists will review your ticket and reply within 24 business hours.
                    </p>
                    <button
                        onClick={() => setSubmittedData(null)}
                        className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3.5 font-semibold text-white transition hover:bg-[var(--primary-hover)] shadow-md"
                    >
                        Submit Another Query
                    </button>
                </div>
            ) : (
                /* Main Contact Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>

                        {/* Inquiry Category */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Inquiry Category <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <select
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] appearance-none cursor-pointer"
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Order Status & Shipping">Order Status & Shipping</option>
                                    <option value="Payment Status & Failure">Payment Status & Failure</option>
                                    <option value="Herbal Usage Advice">Herbal Product & Usage Advice</option>
                                    <option value="Wholesale & Bulk Orders">Wholesale & Bulk Orders</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="How can we assist you?"
                            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 px-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                            Your Message <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="message"
                                required
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Describe your question, concern, or product requirement..."
                                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--primary)] py-4 px-8 font-semibold text-white transition-all hover:bg-[var(--primary-hover)] disabled:opacity-70 shadow-lg hover:shadow-xl"
                    >
                        {isSubmitting ? (
                            <span>Submitting query...</span>
                        ) : (
                            <>
                                <FiSend size={18} />
                                <span>Send Message</span>
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* Login Prompt Modal (Preserves Draft State) */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] mb-5">
                            <FiLock size={32} />
                        </div>

                        <h3 className="text-2xl font-bold text-[var(--text)]">
                            Login Required
                        </h3>

                        <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                            Please log in to submit your support query. Your message has been <strong className="text-[var(--primary)]">saved safely</strong> and will be restored automatically after login.
                        </p>

                        <div className="mt-8 space-y-3">
                            <Link
                                href="/auth?redirect=/contact"
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] py-3.5 px-6 font-semibold text-white transition hover:bg-[var(--primary-hover)] shadow-md"
                            >
                                <FiLogIn size={18} />
                                Log In to Submit
                            </Link>

                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="w-full rounded-2xl border border-[var(--border)] py-3 px-6 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg)]"
                            >
                                Continue Editing Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
