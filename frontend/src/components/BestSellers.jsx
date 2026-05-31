import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function BestSellers() {
    return (
        <section className="bg-[var(--bg)] py-16 transition-colors duration-300 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

                <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                            Customer-favorite
                        </p>

                        <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
                            Best Selling Ayurvedic Products
                        </h2>
                    </div>

                    <button
                        className="
              hidden md:block
              rounded-full
              border
              border-[var(--primary)]
              px-6 py-3
              font-medium
              text-[var(--primary)]
              transition-all duration-300
              hover:bg-[var(--primary)]
              hover:text-white
            "
                    >
                        View All Products
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            slug={product.slug}
                            image={product.image}
                            name={product.name}
                            price={product.price}
                            discount={product.discount}
                            rating={product.rating}
                            reviews={product.reviews}
                            tag={product.tag}
                            badge={product.badge}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}