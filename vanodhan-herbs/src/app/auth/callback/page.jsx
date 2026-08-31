"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("Completing account linking...");

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const redirectTarget = searchParams.get("redirect") || "/";

                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth callback error:", error.message);
                    setStatus("Authentication failed. Redirecting...");
                    setTimeout(() => {
                        window.location.href = redirectTarget;
                    }, 1500);
                    return;
                }

                if (session?.access_token) {
                    setStatus("Syncing account details...");

                    // Call profile-status to trigger server-side identity metadata sync
                    await fetch("/api/user/profile-status", {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });

                    // Refresh client session to receive updated user_metadata and email
                    await supabase.auth.refreshSession();

                    setStatus("Account linked successfully! Redirecting...");
                    window.location.href = redirectTarget;
                } else {
                    setTimeout(() => {
                        window.location.href = redirectTarget;
                    }, 1000);
                }
            } catch (err) {
                console.error("Callback exception:", err);
                router.push("/");
            }
        };

        handleAuthCallback();
    }, [router, searchParams]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5 text-[var(--text)]">
            <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
                <h1 className="text-xl font-bold">{status}</h1>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Please wait while we finalize your account link and sync your profile.
                </p>
            </div>
        </main>
    );
}
