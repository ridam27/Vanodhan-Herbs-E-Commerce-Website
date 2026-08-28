"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import {
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiMessageSquare,
    FiRefreshCw,
    FiCornerDownRight,
    FiLock,
    FiTag,
    FiChevronRight,
} from "react-icons/fi";

export default function UserSupportTickets({ refreshTrigger }) {
    const { user, isLoggedIn, authLoading } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUserTickets = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data, error: fetchError } = await supabase
                .from("support_queries")
                .select("id, inquiry_type, subject, message, status, admin_notes, created_at, updated_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (fetchError) {
                console.error("Error fetching support queries:", fetchError);
                setError("Could not load your support tickets.");
            } else {
                setTickets(data || []);
            }
        } catch (err) {
            console.error("Exception fetching queries:", err);
            setError("Failed to connect to support server.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUserTickets();
    }, [fetchUserTickets, refreshTrigger]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "resolved":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <FiCheckCircle size={14} /> Resolved
                    </span>
                );
            case "in_review":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <FiRefreshCw className="animate-spin text-blue-500" size={14} /> Under Review
                    </span>
                );
            case "archived":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 border border-gray-500/30 px-3 py-1 text-xs font-bold text-gray-500">
                        Archived
                    </span>
                );
            case "pending":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <FiClock size={14} /> Pending Review
                    </span>
                );
        }
    };

    if (authLoading) {
        return (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--text-secondary)]">
                <FiRefreshCw className="animate-spin mx-auto mb-2 text-[var(--primary)]" size={24} />
                Loading your support history...
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_8px_25px_var(--shadow)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] mb-4">
                    <FiLock size={26} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)]">Track Your Support Queries</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                    Log in to view your past support tickets, live resolution status, and replies from our herbal specialists.
                </p>
                <Link
                    href="/auth?redirect=/contact"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] shadow-md"
                >
                    Log In to View Tickets
                    <FiChevronRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_10px_30px_var(--shadow)]">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                        Live Tracking
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--text)] mt-1">
                        My Recent Support Tickets
                    </h3>
                </div>

                <button
                    onClick={fetchUserTickets}
                    disabled={loading}
                    title="Refresh tickets"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] transition hover:text-[var(--primary)] hover:border-[var(--primary)]"
                >
                    <FiRefreshCw className={loading ? "animate-spin text-[var(--primary)]" : ""} size={18} />
                </button>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-600 dark:text-red-400 font-semibold">
                    <FiAlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {loading && tickets.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
                    <FiRefreshCw className="animate-spin mx-auto mb-3 text-[var(--primary)]" size={28} />
                    Fetching your ticket updates...
                </div>
            ) : tickets.length === 0 ? (
                <div className="py-10 text-center rounded-2xl border border-dashed border-[var(--border)] p-6">
                    <FiMessageSquare className="mx-auto mb-3 text-[var(--text-secondary)]" size={32} />
                    <h4 className="font-bold text-[var(--text)]">No Support Queries Found</h4>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                        You haven&apos;t submitted any support queries yet. Submit a message on the contact page to track progress here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition-all duration-200 hover:border-[var(--primary)]/50"
                        >
                            {/* Ticket Top Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-[var(--text-secondary)] bg-[var(--surface)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                                        #TK-{ticket.id.slice(0, 8)}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                                        <FiTag size={12} /> {ticket.inquiry_type}
                                    </span>
                                </div>
                                <div>{getStatusBadge(ticket.status)}</div>
                            </div>

                            {/* Ticket Subject & Message */}
                            <h4 className="text-base font-bold text-[var(--text)] leading-snug">
                                {ticket.subject}
                            </h4>
                            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                                {ticket.message}
                            </p>

                            {/* Response / Notes from Support Team */}
                            {ticket.admin_notes && (
                                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                        <FiCornerDownRight size={16} />
                                        <span>Response from Support Team</span>
                                    </div>
                                    <p className="mt-2 text-sm text-[var(--text)] leading-relaxed pl-5 font-medium">
                                        {ticket.admin_notes}
                                    </p>
                                </div>
                            )}

                            {/* Submitted Timestamp */}
                            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)]">
                                <span>
                                    Submitted: {new Date(ticket.created_at).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                                {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
                                    <span className="text-[var(--primary)] font-medium">
                                        Updated: {new Date(ticket.updated_at).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
