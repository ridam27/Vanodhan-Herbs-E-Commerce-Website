import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT_SET",
        resolvedSeoSiteUrl: SITE_URL,
        siteUrlEnv:
            process.env.NEXT_PUBLIC_SITE_URL ||
            "NOT_SET (using default: https://vanodhanherbs.com)",
        nodeEnv: process.env.NODE_ENV || "unknown",
        timestamp: new Date().toISOString(),
    });
}
