/**
 * SEO & Brand Configuration for Vanodhan Herbs
 * Single source of truth for canonical metadata, OpenGraph, JSON-LD, and robots indexing.
 */

export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://vanodhanherbs.com"
        : process.env.NEXT_PUBLIC_APP_URL || "https://vanodhanherbs.com")
).replace(/\/$/, "");

export const siteConfig = {
    name: "Vanodhan Herbs",
    shortName: "Vanodhan Herbs",
    legalName: "Vanodhan Herbs",
    tagline: "100% Pure Herbal & Herbal Botanical Wellness",
    description:
        "Experience pure, chemical-free Ayurvedic wellness with Vanodhan Herbs. Explore 100% authentic herbal powders, digestion churnas, rejuvenating botanical oils, and traditional natural remedies.",
    url: SITE_URL,
    telephone: "+91 99752 26220",
    email: "vanodhanherbs@gmail.com",
    address: {
        streetAddress: "760, Uttam Town, Inzapur",
        addressLocality: "Wardha",
        addressRegion: "Maharashtra",
        postalCode: "442001",
        addressCountry: "IN",
    },
    keywords: [
        "Vanodhan Herbs",
        "Ayurvedic products",
        "herbal powders online",
        "pure churna India",
        "ayurvedic hair oil",
        "organic herbal remedies",
        "ashwagandha powder",
        "triphala churna",
        "herbal wellness store",
        "botanical herbs Maharashtra",
        "chemical-free ayurveda",
        "authentic herbal wellness",
        "traditional Indian herbs",
        "natural digestion remedies",
    ],
    social: {
        instagram: "https://instagram.com/vanodhanherbs",
        facebook: "https://facebook.com/vanodhanherbs",
    },
};

