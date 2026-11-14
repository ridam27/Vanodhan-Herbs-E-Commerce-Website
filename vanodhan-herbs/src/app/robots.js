import { SITE_URL } from "@/lib/seo";

export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/shop", "/shop/*", "/about", "/contact"],
                disallow: [
                    "/api/",
                    "/account",
                    "/account/*",
                    "/cart",
                    "/checkout",
                    "/orders",
                    "/orders/*",
                    "/auth",
                    "/auth/*",
                    "/payment",
                    "/payment/*",
                    "/contact/tickets",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}

