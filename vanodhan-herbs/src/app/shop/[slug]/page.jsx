import { getProductBySlug, getProducts } from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";
import { SITE_URL } from "@/lib/seo";
import ProductDetailsClient from "./ProductDetailsClient";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: "Product Not Found",
            description: "The requested Ayurvedic product could not be found.",
        };
    }

    const cleanDescription = product.description
        ? product.description.replace(/<[^>]*>?/gm, "").slice(0, 160)
        : `Buy pure ${product.name} online at Vanodhan Herbs. 100% authentic Ayurvedic herbal formulation.`;

    const primaryImage =
        Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "/logo-light.png";

    return {
        title: product.name,
        description: cleanDescription,
        alternates: {
            canonical: `/shop/${slug}`,
        },
        openGraph: {
            title: `${product.name} | Vanodhan Herbs`,
            description: cleanDescription,
            url: `/shop/${slug}`,
            images: [
                {
                    url: primaryImage,
                    width: 800,
                    height: 800,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.name} | Vanodhan Herbs`,
            description: cleanDescription,
            images: [primaryImage],
        },
    };
}

export default async function ProductDetailsPage({ params }) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);
    const relatedProducts = await getProducts();

    const reviews = product ? await getProductReviews(product.id) : [];

    let productJsonLd = null;
    let breadcrumbJsonLd = null;

    if (product) {
        const price = product.sale_price || product.price || 0;
        const inStock =
            typeof product.stock === "number" ? product.stock > 0 : true;

        productJsonLd = {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description:
                product.description ||
                `Pure authentic ${product.name} from Vanodhan Herbs`,
            image:
                Array.isArray(product.images) && product.images.length > 0
                    ? product.images
                    : [`${SITE_URL}/logo-light.png`],
            sku: String(product.id),
            brand: {
                "@type": "Brand",
                name: "Vanodhan Herbs",
            },
            offers: {
                "@type": "Offer",
                url: `${SITE_URL}/shop/${slug}`,
                priceCurrency: "INR",
                price: price,
                priceValidUntil: "2027-12-31",
                availability: inStock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
            },
        };

        if (reviews && reviews.length > 0) {
            const totalRating = reviews.reduce(
                (sum, r) => sum + (Number(r.rating) || 0),
                0
            );
            const avgRating = (totalRating / reviews.length).toFixed(1);
            productJsonLd.aggregateRating = {
                "@type": "AggregateRating",
                ratingValue: avgRating,
                reviewCount: reviews.length,
                bestRating: "5",
                worstRating: "1",
            };
        }

        breadcrumbJsonLd = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: `${SITE_URL}`,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Shop",
                    item: `${SITE_URL}/shop`,
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: product.name,
                    item: `${SITE_URL}/shop/${slug}`,
                },
            ],
        };
    }

    return (
        <>
            {productJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(productJsonLd),
                    }}
                />
            )}
            {breadcrumbJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbJsonLd),
                    }}
                />
            )}
            <ProductDetailsClient
                product={product}
                relatedProducts={relatedProducts}
                reviews={reviews}
            />
        </>
    );
}
