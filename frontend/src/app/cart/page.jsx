"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/providers/CartProvider";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, getSellingPrice, } = useCart();

    const totalMRP = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const totalSavings = totalMRP - cartTotal;

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            <section className="pt-36 pb-16 sm:pt-40 lg:pt-44">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                            Shopping Cart
                        </p>

                        <h1 className="text-4xl font-bold text-[var(--text)]">
                            Your Cart
                        </h1>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-[0_8px_25px_var(--shadow)]">
                            <h2 className="text-2xl font-bold text-[var(--text)]">
                                Your cart is empty
                            </h2>

                            <p className="mt-3 text-[var(--text-secondary)]">
                                Add some Ayurvedic products to continue shopping.
                            </p>

                            <Link
                                href="/shop"
                                className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.7fr_0.8fr]">
                            {/* Order Summary */}
                            <div className="order-1 h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_25px_var(--shadow)] lg:sticky lg:top-32 lg:order-2 lg:p-6">
                                <h2 className="text-2xl font-bold text-[var(--text)]">
                                    Order Summary
                                </h2>

                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Total MRP</span>
                                        <span>₹{totalMRP}</span>
                                    </div>

                                    <div className="flex justify-between text-green-600">
                                        <span>You Saved</span>
                                        <span>-₹{totalSavings}</span>
                                    </div>

                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Shipping</span>
                                        <span>At checkout</span>
                                    </div>

                                    <div className="border-t border-[var(--border)] pt-4">
                                        <div className="flex justify-between text-xl font-bold text-[var(--text)]">
                                            <span>Total</span>
                                            <span>₹{cartTotal}</span>
                                        </div>
                                    </div>
                                </div>

                                    <Link
                                        href="/checkout"
                                        className="mt-6 block w-full rounded-full bg-[var(--primary)] px-6 py-4 text-center font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                                    >
                                        Proceed to Checkout
                                    </Link>

                                <Link
                                    href="/shop"
                                    className="mt-4 block text-center text-sm font-medium text-[var(--primary)]"
                                >
                                    Continue Shopping
                                </Link>
                            </div>

                            {/* Product List */}
                            <div className="order-2 space-y-3 lg:order-1 lg:max-h-[650px] lg:overflow-y-auto lg:pr-3 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
                                {cartItems.map((item) => {
                                    const itemSaving =
                                        (item.price - getSellingPrice(item)) * item.quantity;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex gap-3 border-b border-[var(--border)] bg-[var(--surface)] py-4 sm:gap-4 sm:rounded-3xl sm:border sm:p-4 sm:shadow-[0_8px_25px_var(--shadow)]"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28"
                                            />

                                            <div className="flex flex-1 flex-col justify-between">
                                                <div>
                                                    <h3 className="line-clamp-2 text-base font-bold text-[var(--text)] sm:text-lg">
                                                        {item.name}
                                                    </h3>

                                                    <div className="mt-2 flex flex-wrap items-end gap-2">
                                                        <p className="text-lg font-bold text-[var(--primary)]">
                                                            ₹{getSellingPrice(item)}
                                                        </p>

                                                        {item.price > getSellingPrice(item) && (
                                                            <p className="pb-0.5 text-sm line-through text-[var(--text-secondary)]">
                                                                ₹{item.price}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {itemSaving > 0 && (
                                                        <p className="mt-1 text-xs font-semibold text-green-600">
                                                            You saved ₹{itemSaving}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center overflow-hidden rounded-full border border-[var(--border)]">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(item.id, item.quantity - 1)
                                                            }
                                                            className="p-2 transition hover:bg-[var(--surface-2)]"
                                                        >
                                                            <FiMinus size={14} />
                                                        </button>

                                                        <span className="min-w-[36px] text-center text-sm font-semibold">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(item.id, item.quantity + 1)
                                                            }
                                                            className="p-2 transition hover:bg-[var(--surface-2)]"
                                                        >
                                                            <FiPlus size={14} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-600 sm:h-auto sm:w-auto sm:gap-1 sm:rounded-none sm:hover:bg-transparent"
                                                    >
                                                        <FiTrash2 />
                                                        <span className="hidden sm:inline">Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}