"use client";

import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { FiShield, FiMessageCircle, FiClock, FiArrowRight, FiList } from "react-icons/fi";

export default function ContactSection() {
    return (
        <section className="py-12 bg-[var(--bg)]">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
                    {/* Left Column: Info & Ticket Navigation Card */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
                                Send Us a Message
                            </p>
                            <h2 className="mt-3 text-3xl font-extrabold text-[var(--text)] sm:text-4xl leading-tight">
                                Have a Specific Query or Need Herbal Advice?
                            </h2>
                            <p className="mt-4 text-base text-[var(--text-secondary)] leading-relaxed">
                                Whether you need recommendations on choosing the right herbal formulation or have an inquiry regarding your recent order, fill out the form and our specialist team will connect with you promptly.
                            </p>
                        </div>

                        {/* Track My Tickets Dedicated Card Button */}
                        <div className="relative overflow-hidden rounded-3xl border border-[var(--primary)]/30 bg-[var(--surface)] p-6 sm:p-8 shadow-[0_10px_30px_var(--shadow)] transition-all hover:border-[var(--primary)]">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md">
                                    <FiList size={26} />
                                </div>
                                <div className="space-y-2">
                                    <span className="inline-block rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
                                        Already Submitted a Query?
                                    </span>
                                    <h3 className="text-xl font-bold text-[var(--text)]">
                                        Track Your Support Tickets & Status
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                        View past queries, live resolution status, and specialist replies on your dedicated support tickets page.
                                    </p>

                                    <div className="pt-2">
                                        <Link
                                            href="/contact/tickets"
                                            className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--primary-hover)] hover:gap-3"
                                        >
                                            <span>View My Support Tickets</span>
                                            <FiArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Guarantee Cards */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                    <FiShield size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--text)]">24-Hour Response Guarantee</h4>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">We respect your time and respond to all customer inquiries within 24 hours.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                    <FiMessageCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--text)]">Direct Herbal Guidance</h4>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Get personalized usage advice directly from experienced botanical specialists.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="sticky top-28">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
