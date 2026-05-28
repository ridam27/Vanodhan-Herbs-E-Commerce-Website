import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function FeaturedProducts() {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
                            Our Products
                        </p>
                        <h2 className="text-4xl font-bold text-gray-900">
                            Featured Ayurvedic Products
                        </h2>
                    </div>

                    <button className="hidden rounded-full border border-green-700 px-6 py-3 font-medium text-green-700 transition hover:bg-green-700 hover:text-white md:block">
                        View All Products
                    </button>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            image={product.image}
                            name={product.name}
                            price={product.price}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}