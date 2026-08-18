"use client";

import { useState } from "react";

import Navbar from "@/components/Navbar";
import { FcGoogle } from "react-icons/fc";
import { FiPhone, FiArrowRight } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
    const [otpSent, setOtpSent] = useState(false);
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "http://localhost:3000",
            },
        });
    };

    const handleSendOtp = async () => {
        setLoading(true);
        setMessage("");

        const phone = `+91${mobile}`;

        const { error } = await supabase.auth.signInWithOtp({
            phone,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setOtpSent(true);
            setMessage("OTP sent successfully.");
        }

        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        setMessage("");

        const phone = `+91${mobile}`;

        const { error } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: "sms",
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Login successful.");
            window.location.href = "/";
        }

        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            <section className="flex min-h-screen items-center justify-center px-5 pt-32 pb-16 sm:px-6 lg:px-8">
                <div className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_10px_35px_var(--shadow)] sm:p-8">
                    <div className="mb-8 text-center">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                            Welcome
                        </p>

                        <h1 className="text-3xl font-bold text-[var(--text)]">
                            Login to Vanodhan Herbs
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                            Continue with Google or mobile number to access your cart and orders.
                        </p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg)] px-6 py-4 font-semibold text-[var(--text)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--surface-2)]"
                    >
                        <FcGoogle size={22} />
                        Continue with Google
                    </button>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-[var(--border)]" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            Or
                        </span>
                        <div className="h-px flex-1 bg-[var(--border)]" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                            Mobile Number
                        </label>

                        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                            <FiPhone className="text-[var(--text-secondary)]" />

                            <span className="text-sm font-semibold text-[var(--text)]">
                                +91
                            </span>

                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="Enter mobile number"
                                className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSendOtp}
                        disabled={loading || mobile.length !== 10}
                        className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-6 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiArrowRight />
                        {loading ? "Sending..." : "Send OTP"}
                    </button>

                    {otpSent && (
                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                                Enter OTP
                            </label>

                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
                            />

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                                className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-6 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </div>
                    )}

                    {message && (
                        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
                            {message}
                        </p>
                    )}

                    <p className="mt-6 text-center text-xs leading-6 text-[var(--text-secondary)]">
                        By continuing, you agree to Vanodhan Herbs&apos; Terms & Conditions and Privacy Policy.
                    </p>
                </div>
            </section>
        </main>
    );
}