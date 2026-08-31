"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiPhone, FiLock, FiAlertCircle, FiCheckCircle, FiX, FiArrowRight } from "react-icons/fi";
import { useAuth } from "@/providers/AuthProvider";

export default function PendingVerificationModal({
    isOpen,
    isMandatory = false,
    hasPhone = false,
    hasGoogle = false,
    onClose,
    onSuccess,
}) {
    const { sendPhoneOtp, verifyPhoneOtp, linkGoogleAccount } = useAuth();

    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    if (!isOpen) return null;

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        if (mobile.length !== 10) return;

        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const result = await sendPhoneOtp(mobile);

        if (result.error) {
            setErrorMsg(result.error);
        } else {
            setOtpSent(true);
            setSuccessMsg("SMS OTP sent to +91 " + mobile);
        }

        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault();
        if (otp.length !== 6) return;

        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const result = await verifyPhoneOtp(mobile, otp);

        if (result.error) {
            setErrorMsg(result.error);
        } else {
            setSuccessMsg("Phone number verified successfully!");
            setTimeout(() => {
                if (onSuccess) onSuccess();
                if (onClose && !isMandatory) onClose();
            }, 1200);
        }

        setLoading(false);
    };

    const handleLinkGoogle = async () => {
        setLoading(true);
        setErrorMsg("");

        const result = await linkGoogleAccount();

        if (result?.error) {
            setErrorMsg(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl">
                {/* Close Button (Hidden if mandatory) */}
                {!isMandatory && (
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] transition hover:text-[var(--text)]"
                    >
                        <FiX size={20} />
                    </button>
                )}

                {/* Header Badge */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <FiLock size={32} />
                    </div>

                    <span className="inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
                        {!hasPhone
                            ? "Phone Verification Pending"
                            : !hasGoogle
                                ? "Google Account Link Pending"
                                : "Complete Profile"}
                    </span>

                    <h2 className="text-2xl font-bold text-[var(--text)]">
                        {!hasPhone ? "Verify Mobile Number" : "Connect Google Account"}
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {isMandatory
                            ? "Vanodhan Herbs requires both a verified mobile number and Google identity before completing checkout."
                            : !hasPhone
                                ? "Please verify your 10-digit mobile number to enable order updates & fast checkout."
                                : "Link your Google account to secure your profile and enable one-click access."}
                    </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                        <FiAlertCircle className="shrink-0 text-red-500" size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <FiCheckCircle className="shrink-0 text-emerald-500" size={18} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* CASE A: Missing Phone Number */}
                {!hasPhone && (
                    <div>
                        {!otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                                        Enter Mobile Number
                                    </label>

                                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                                        <FiPhone className="text-[var(--text-secondary)]" />
                                        <span className="text-sm font-semibold text-[var(--text)]">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                            maxLength={10}
                                            placeholder="10-digit mobile number"
                                            className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || mobile.length !== 10}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] py-3.5 px-6 font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60 shadow-md"
                                >
                                    <span>{loading ? "Sending OTP..." : "Send Verification OTP"}</span>
                                    <FiArrowRight />
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-sm font-medium text-[var(--text)]">
                                            Enter 6-Digit OTP
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-xs text-[var(--primary)] hover:underline"
                                        >
                                            Change Number (+91 {mobile})
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP code"
                                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center text-lg font-bold tracking-widest text-[var(--text)] outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-[var(--text-secondary)]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] py-3.5 px-6 font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60 shadow-md"
                                >
                                    <span>{loading ? "Verifying..." : "Verify & Link Phone"}</span>
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* CASE B: Missing Google Account */}
                {!hasGoogle && hasPhone && (
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={handleLinkGoogle}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg)] px-6 py-4 font-semibold text-[var(--text)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--surface-2)] shadow-md"
                        >
                            <FcGoogle size={22} />
                            <span>{loading ? "Connecting..." : "Connect Google Account"}</span>
                        </button>
                    </div>
                )}

                {/* Dismiss option note if not mandatory */}
                {!isMandatory && (
                    <button
                        onClick={onClose}
                        className="mt-5 w-full text-center text-xs text-[var(--text-secondary)] transition hover:text-[var(--text)] hover:underline"
                    >
                        Remind Me Later
                    </button>
                )}
            </div>
        </div>
    );
}
