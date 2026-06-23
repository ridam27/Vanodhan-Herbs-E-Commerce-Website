"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

export default function PhonePeStatusClient() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("Verifying your payment...");
    const [attempt, setAttempt] = useState(1);

    useEffect(() => {
        let isMounted = true;
        let redirectTimer = null;

        const verifyPayment = async () => {
            const maxAttempts = 5;

            if (!orderId) {
                if (!isMounted) return;
                setStatus("failed");
                setMessage("Order ID missing.");
                return;
            }

            try {
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    if (!isMounted) return;
                    setStatus("failed");
                    setMessage("Please login to verify payment.");
                    return;
                }

                for (let i = 1; i <= maxAttempts; i++) {
                    if (!isMounted) return;

                    setAttempt(i);
                    setStatus("verifying");
                    setMessage(
                        `Verifying your payment... Attempt ${i}/${maxAttempts}`
                    );

                    const response = await fetch("/api/phonepe/verify-payment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({ orderId }),
                    });

                    let result = null;

                    try {
                        result = await response.json();
                    } catch {
                        result = {
                            success: false,
                            message: "Invalid server response.",
                        };
                    }

                    if (result.success) {
                        if (!isMounted) return;

                        setStatus("success");
                        setMessage(
                            "Payment successful. Your order has been confirmed."
                        );

                        redirectTimer = setTimeout(() => {
                            window.location.href = `/orders/${orderId}`;
                        }, 3000);

                        return;
                    }

                    const isLastAttempt = i === maxAttempts;

                    if (isLastAttempt) {
                        if (!isMounted) return;
                        setStatus("failed");
                        setMessage(
                            result.message || "Payment verification failed."
                        );
                        return;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
            } catch {
                if (!isMounted) return;
                setStatus("failed");
                setMessage("Unable to verify payment.");
            }
        };

        verifyPayment();

        return () => {
            isMounted = false;

            if (redirectTimer) {
                clearTimeout(redirectTimer);
            }
        };
    }, [orderId]);

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <Navbar />

            <section className="flex min-h-screen items-center justify-center px-5 pt-32 pb-16">
                <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_8px_25px_var(--shadow)]">
                    {status === "verifying" && (
                        <FiLoader
                            size={48}
                            className="mx-auto animate-spin text-[var(--primary)]"
                        />
                    )}

                    {status === "success" && (
                        <FiCheckCircle
                            size={56}
                            className="mx-auto text-green-500"
                        />
                    )}

                    {status === "failed" && (
                        <FiXCircle
                            size={56}
                            className="mx-auto text-red-500"
                        />
                    )}

                    <h1 className="mt-6 text-2xl font-bold">
                        {status === "verifying"
                            ? "Verifying Payment"
                            : status === "success"
                              ? "Payment Successful"
                              : "Payment Failed"}
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {message}
                    </p>

                    {status === "verifying" && (
                        <p className="mt-3 text-xs text-[var(--text-secondary)]">
                            Please do not close or refresh this page.
                        </p>
                    )}

                    {status === "success" && (
                        <p className="mt-3 text-xs text-[var(--text-secondary)]">
                            Redirecting to your order in 3 seconds...
                        </p>
                    )}

                    {status === "failed" && (
                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                            >
                                Verify Again
                            </button>

                            <Link
                                href="/orders"
                                className="rounded-full border border-[var(--border)] px-6 py-3 font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            >
                                View Orders
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}