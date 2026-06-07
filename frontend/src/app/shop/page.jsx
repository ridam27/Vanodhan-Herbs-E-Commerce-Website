import Navbar from "@/components/Navbar";
import ShopProducts from "@/components/ShopProducts";
import { getProducts } from "@/lib/products";

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
                            Shop Ayurvedic Products
                        </h1>

                        {/* <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                            Explore natural Ayurvedic products crafted for everyday wellness.
                        </p> */}
                    </div>

                    <ShopProducts products={products} />
                </div>
            </section>
        </main>
    );
}