"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PendingVerificationModal from "@/components/PendingVerificationModal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const pathname = usePathname();
    const isCheckout = pathname === "/checkout";
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [profileStatus, setProfileStatus] = useState({
        isComplete: true,
        hasPhone: true,
        hasGoogle: true,
        isChecked: false,
    });
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    const checkServerProfileStatus = useCallback(async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                setProfileStatus({
                    isComplete: true,
                    hasPhone: false,
                    hasGoogle: false,
                    isChecked: true,
                });
                return;
            }

            const response = await fetch("/api/user/profile-status", {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setProfileStatus({
                    isComplete: data.isComplete,
                    hasPhone: data.hasPhone,
                    hasGoogle: data.hasGoogle,
                    isChecked: true,
                });

                if (!data.isComplete) {
                    setShowVerificationModal(true);
                }
            }
        } catch (error) {
            console.error("Failed to check server profile status:", error);
        }
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setUser(session?.user ?? null);
            setAuthLoading(false);

            if (session?.user) {
                await checkServerProfileStatus();
            }
        };

        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);

            if (session?.user) {
                await checkServerProfileStatus();
            } else {
                setProfileStatus({
                    isComplete: true,
                    hasPhone: false,
                    hasGoogle: false,
                    isChecked: true,
                });
                setShowVerificationModal(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [checkServerProfileStatus]);

    const sendPhoneOtp = async (mobile) => {
        try {
            const phone = `+91${mobile}`;
            const { error } = await supabase.auth.updateUser({ phone });

            if (error) {
                return { error: error.message };
            }
            return { error: null };
        } catch (err) {
            return { error: err.message || "Failed to send OTP" };
        }
    };

    const verifyPhoneOtp = async (mobile, otp) => {
        try {
            const phone = `+91${mobile}`;
            const { error } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: "phone_change",
            });

            if (error) {
                return { error: error.message };
            }

            await checkServerProfileStatus();
            return { error: null };
        } catch (err) {
            return { error: err.message || "Failed to verify OTP" };
        }
    };

    const linkGoogleAccount = async () => {
        try {
            const redirectUrl = `${window.location.origin}/auth/callback`;
            const { error } = await supabase.auth.linkIdentity({
                provider: "google",
                options: {
                    redirectTo: redirectUrl,
                },
            });

            if (error) {
                return { error: error.message };
            }
            return { error: null };
        } catch (err) {
            return { error: err.message || "Failed to link Google account" };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setShowVerificationModal(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                authLoading,
                isLoggedIn: !!user,
                logout,
                profileStatus,
                checkServerProfileStatus,
                showVerificationModal,
                setShowVerificationModal,
                sendPhoneOtp,
                verifyPhoneOtp,
                linkGoogleAccount,
            }}
        >
            {children}
            {Boolean(user) && !profileStatus.isComplete && (
                <PendingVerificationModal
                    isOpen={isCheckout || showVerificationModal}
                    isMandatory={isCheckout}
                    hasPhone={profileStatus.hasPhone}
                    hasGoogle={profileStatus.hasGoogle}
                    onClose={() => {
                        if (!isCheckout) {
                            setShowVerificationModal(false);
                        }
                    }}
                    onSuccess={() => checkServerProfileStatus()}
                />
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}