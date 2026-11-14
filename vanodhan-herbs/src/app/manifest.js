import { siteConfig } from "@/lib/seo";

export default function manifest() {
    return {
        name: siteConfig.name + " - " + siteConfig.tagline,
        short_name: siteConfig.shortName,
        description: siteConfig.description,
        start_url: "/",
        display: "standalone",
        background_color: "#f0fdf4",
        theme_color: "#15803d",
        icons: [
            {
                src: "/icon.png",
                sizes: "any",
                type: "image/png",
            },
        ],
    };
}

