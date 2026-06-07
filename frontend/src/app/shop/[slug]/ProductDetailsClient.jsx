"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import RatingsReviews from "@/components/RatingsReviews";
import ProductGallery from "@/components/ProductGallery";
import { useCart } from "@/providers/CartProvider";

import {
    FiChevronRight,
    FiStar,
    FiShoppingBag,
    FiCheckCircle,
} from "react-icons/fi";

export default function ProductDetailsClient({ product, relatedProducts }) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    if (!product) {
        return (
            <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
                <Navbar />
                <section className="mx-auto max-w-7xl px-5 pt-40">
                    <h1 className="text-3xl font-bold">Product not found</h1>
                </section>
            </main>
        );
    }

    const sellingPrice =
        product.discount > 0
            ? Math.round(product.price - (product.price * product.discount) / 100)
            : product.price;

    console.log(product.stock_quantity);
    console.log(typeof product.stock_quantity);

    return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
                <Navbar />
    
                <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-secondary)]">
                        <Link href="/" className="transition hover:text-[var(--primary)]">
                            Home
                        </Link>
    
                        <FiChevronRight size={14} />
    
                        <Link href="/shop" className="transition hover:text-[var(--primary)]">
                            Shop
                        </Link>
    
                        <FiChevronRight size={14} />
    
                        <span className="font-medium text-[var(--primary)]">
                            {product.name}
                        </span>
                    </div>
                </div>
    
                <section className="pt-8 pb-10">
                    <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
    
                        <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_8px_25px_var(--shadow)]">
                            <div
                                className="overflow-hidden rounded-[2rem]"
                                style={{
                                    backgroundColor: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    boxShadow: "0 8px 25px var(--shadow)",
                                }}
                            >
                                <ProductGallery
                                    images={product.images || [product.image]}
                                    name={product.name}
                                />
                            </div>
                        </div>
    
                        <div>
                            {product.badge && (
                                <span className="mb-4 inline-block rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                                    {product.badge}
                                </span>
                            )}
    
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                                {product.tag}
                            </p>
    
                            <h1 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
                                {product.name}
                            </h1>
    
                            <div className="mt-1 flex items-center gap-2 text-[var(--text-secondary)]">
                                <FiStar className="fill-yellow-400 text-yellow-400" />
                                <span>
                                    {product.rating} ({product.reviews} reviews)
                                </span>
                            </div>
    
                            <p className="mt-4 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
                                {product.short_description}
                            </p>

                            <div className="mt-6">
                                <div className="flex flex-wrap items-end gap-3">
                                    <p className="text-3xl font-bold text-[var(--primary)]">
                                        ₹{sellingPrice}
                                    </p>
    
                                    {product.discount > 0 && (
                                        <p className="text-lg line-through text-[var(--text-secondary)]">
                                            ₹{product.price}
                                        </p>
                                    )}
    
                                    {product.discount > 0 && (
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                            {product.discount}% OFF
                                        </span>
                                    )}
                                </div>
                            </div>
    
                        <div className="mt-2 flex flex-col gap-0">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${product.stock_quantity > 0
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                        }`}
                                ></span>

                                <span
                                    className={`text-sm font-medium ${product.stock_quantity > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {product.stock_quantity > 0
                                        ? "In Stock"
                                        : "Out of Stock"}
                                </span>
                            </div>

                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--text-secondary)",
                                }}
                            >
                                    {product.stock_quantity
                                        ? `Estimated delivery: ${product.delivery} business days`
                                        : "This product is currently unavailable"}
                                </p>
                            </div>
    
    
                            <div className="mt-8">
                                <h3 className="mb-4 text-xl font-bold text-[var(--text)]">
                                    Key Benefits
                                </h3>
    
                                <div className="space-y-3">
                                    {product.benefits.map((benefit) => (
                                        <div
                                            key={benefit}
                                            className="flex items-center gap-3"
                                        >
                                            <FiCheckCircle
                                                className="text-[var(--primary)]"
                                                size={18}
                                            />
    
                                            <span className="text-[var(--text-secondary)]">
                                                {benefit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
    
                            <div
                                className="mt-8 rounded-3xl p-5"
                                style={{
                                    backgroundColor: "var(--surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <div className="space-y-3">
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        ✓ 100% Natural Ingredients
                                    </p>
    
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        ✓ Ayurvedic Formulation
                                    </p>
    
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        ✓ Secure Packaging
                                    </p>
    
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        ✓ India-wide Delivery
                                    </p>
                                </div>
                            </div>
    
                            <div className="mt-8 flex items-center gap-4">
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    Quantity
                                </span>
    
                                <div
                                    className="flex items-center overflow-hidden rounded-full"
                                    style={{
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--surface)",
                                    }}
                                >
                                    <button
                                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                        className="px-4 py-2 text-lg font-bold transition-colors hover:bg-[var(--surface-2)]"
                                    >
                                        −
                                    </button>
    
                                    <span
                                        className="min-w-[50px] text-center font-semibold"
                                        style={{ color: "var(--text)" }}
                                    >
                                        {quantity}
                                    </span>
    
                                    <button
                                        onClick={() => setQuantity((prev) => prev + 1)}
                                        className="px-4 py-2 text-lg font-bold transition-colors hover:bg-[var(--surface-2)]"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
    
                            <button
                                onClick={() => addToCart(product, quantity)}
                                disabled={!product.stock_quantity}
                                className={`mt-8 flex items-center gap-3 rounded-full px-8 py-4 font-semibold text-white transition-all duration-300
                                            ${product.stock_quantity ? "bg-[var(--primary)] hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                                        : "cursor-not-allowed bg-gray-400"}`}>
                                <FiShoppingBag />
                                {product.stock_quantity ? "Add to Cart" : "Out of Stock"}
                            </button>
                        </div>
    
                    </div>
                </section>
    
                <section className="border-t border-[var(--border)] py-10">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
    
                        <div className="grid gap-10 lg:grid-cols-2">
    
                            <div>
                                <h2 className="mb-5 text-2xl font-bold text-[var(--text)]">
                                    Ingredients
                                </h2>
    
                                <ul className="space-y-3">
                                    {product.ingredients.map((ingredient) => (
                                        <li
                                            key={ingredient}
                                            className="text-[var(--text-secondary)]"
                                        >
                                            • {ingredient}
                                        </li>
                                    ))}
                                </ul>
                            </div>
    
                            <div>
                                <h2 className="mb-5 text-2xl font-bold text-[var(--text)]">
                                    Usage Instructions
                                </h2>
    
                                <p className="leading-8 text-[var(--text-secondary)]">
                                    {product.usage}
                                </p>
                            </div>
    
                        </div>
    
                    </div>
                </section>
    
                <RatingsReviews
                    rating={product.rating}
                    reviewsCount={product.reviews}
                />
    
                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
    
                        <div className="mb-10">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                                You May Also Like
                            </p>
    
                            <h2 className="text-3xl font-bold text-[var(--text)]">
                                Related Products
                            </h2>
                        </div>
    
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                            {relatedProducts
                                .filter((item) => item.id !== product.id)
                                .slice(0, 4)
                                .map((item) => (
                                    <ProductCard
                                        key={item.id}
                                        slug={item.slug}
                                        discount={product.discount}
                                        image={item.image}
                                        name={item.name}
                                        price={item.price}
                                        rating={item.rating}
                                        reviews={item.reviews}
                                        tag={item.tag}
                                        badge={item.badge}
                                    />
                                ))}
                        </div>
    
                    </div>
                </section>
            </main>
    );
}