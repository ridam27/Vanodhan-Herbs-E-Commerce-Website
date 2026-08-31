import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized request." },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        const {
            data: { user: initialUser },
            error: userError,
        } = await supabaseAdmin.auth.getUser(token);

        if (userError || !initialUser) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired session." },
                { status: 401 }
            );
        }

        let user = initialUser;

        // Auto-sync Google identity metadata into primary user record if missing
        const googleIdentity = user.identities?.find((id) => id.provider === "google");
        if (googleIdentity?.identity_data) {
            const gData = googleIdentity.identity_data;
            const currentMeta = user.user_metadata || {};
            const updatePayload = {};
            let needsUpdate = false;

            if (!user.email && gData.email) {
                updatePayload.email = gData.email;
                updatePayload.email_confirm = true;
                needsUpdate = true;
            }

            const updatedMeta = { ...currentMeta };

            if (!currentMeta.full_name && (gData.full_name || gData.name)) {
                updatedMeta.full_name = gData.full_name || gData.name;
                needsUpdate = true;
            }
            if (!currentMeta.name && (gData.name || gData.full_name)) {
                updatedMeta.name = gData.name || gData.full_name;
                needsUpdate = true;
            }
            if (!currentMeta.avatar_url && (gData.avatar_url || gData.picture)) {
                updatedMeta.avatar_url = gData.avatar_url || gData.picture;
                needsUpdate = true;
            }
            if (!currentMeta.picture && (gData.picture || gData.avatar_url)) {
                updatedMeta.picture = gData.picture || gData.avatar_url;
                needsUpdate = true;
            }

            if (needsUpdate) {
                updatePayload.user_metadata = updatedMeta;
                const { data: updatedRes, error: updateErr } =
                    await supabaseAdmin.auth.admin.updateUserById(
                        user.id,
                        updatePayload
                    );

                if (!updateErr && updatedRes?.user) {
                    user = updatedRes.user;
                }
            }
        }

        // Server-side check for verified phone
        const hasPhone = Boolean(
            user.phone && String(user.phone).trim().length >= 10
        );

        // Server-side check for linked Google identity
        const hasGoogle = Boolean(
            user.identities?.some((id) => id.provider === "google") ||
            user.app_metadata?.providers?.includes("google") ||
            (user.app_metadata?.provider === "google" && user.email)
        );

        const isComplete = hasPhone && hasGoogle;

        const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            googleIdentity?.identity_data?.full_name ||
            googleIdentity?.identity_data?.name ||
            "Customer";

        const avatarUrl =
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            googleIdentity?.identity_data?.avatar_url ||
            googleIdentity?.identity_data?.picture ||
            null;

        return NextResponse.json({
            success: true,
            isComplete,
            hasPhone,
            hasGoogle,
            user: {
                id: user.id,
                email: user.email || googleIdentity?.identity_data?.email || null,
                phone: user.phone || null,
                fullName,
                avatarUrl,
            },
        });
    } catch (error) {
        console.error("Error checking profile status:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
