import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap() {
    const staticRoutes = [
        {
            url: `${SITE_URL}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/shop`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    try {
        const products = await getProducts();
        const productRoutes = (products || [])
            .filter((p) => Boolean(p && p.slug))
            .map((product) => {
                const modDate = product.updated_at || product.created_at;
                return {
                    url: `${SITE_URL}/shop/${encodeURIComponent(product.slug)}`,
                    lastModified: modDate ? new Date(modDate) : new Date(),
                    changeFrequency: "weekly",
                    priority: 0.8,
                };
            });

        return [...staticRoutes, ...productRoutes];
    } catch (error) {
        console.error("Error generating dynamic product sitemap:", error);
        return staticRoutes;
    }
}

