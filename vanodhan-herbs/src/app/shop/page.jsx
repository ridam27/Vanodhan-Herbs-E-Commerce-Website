import Navbar from "@/components/Navbar";
import ShopProducts from "@/components/ShopProducts";
import { getProducts } from "@/lib/products";

export const metadata = {
    title: "Shop Authentic Herbal Powders, Churna & Wellness Remedies",
    description:
        "Explore Vanodhan Herbs complete collection of 100% natural Ayurvedic powders, traditional churnas, cold-pressed oils, and botanical daily wellness products.",
    alternates: {
        canonical: "/shop",
    },
    openGraph: {
        title: "Shop Herbal Powders & Churna | Vanodhan Herbs",
        description:
            "Browse 100% pure Ayurvedic formulations, lab-tested herbal powders, and holistic wellness remedies.",
        url: "/shop",
    },
};

export default async function ShopPage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            <section className="pt-36 pb-16 sm:pt-40 lg:pt-44">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                            Our Store
                        </p>

                        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-5xl">
                            Shop Herbal Products
                        </h1>
                    </div>

                    <ShopProducts products={products} />
                </div>
            </section>
        </main>
    );
}
