"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { useAddress } from "@/providers/AddressProvider";
import { useEffect, useState } from "react";
import { FiMapPin, FiPlus, FiShoppingBag } from "react-icons/fi";

export default function CheckoutPage() {
    const { user, authLoading } = useAuth();
    const { cartItems, cartTotal } = useCart();
    const { addresses, addressLoading, addAddress } = useAddress();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        is_default: false,
    });

    const deliveryCharge = cartTotal >= 499 ? 0 : 50;
    const finalTotal = cartTotal + deliveryCharge;

    const totalMRP = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const totalSavings = totalMRP - cartTotal;

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            const defaultAddress =
                addresses.find((address) => address.is_default) || addresses[0];

            setSelectedAddress(defaultAddress);
        }
    }, [addresses, selectedAddress]);

    if (authLoading) return null;

    if (!user) {
        return (
            <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
                <Navbar />
                <section className="flex min-h-screen items-center justify-center px-5 pt-28 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-[var(--text)]">
                            Please Login
                        </h1>
                        <p className="mt-4 text-[var(--text-secondary)]">
                            Login to continue checkout.
                        </p>
                        <Link href="/auth" className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)]">
                            Login
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
                <Navbar />
                <section className="flex min-h-screen items-center justify-center px-5 pt-28 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-[var(--text)]">
                            Your cart is empty
                        </h1>
                        <p className="mt-4 text-[var(--text-secondary)]">
                            Add products before checkout.
                        </p>
                        <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-hover)]">
                            Shop Products
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();

        const { error } = await addAddress(form);

        if (!error) {
            setShowAddressForm(false);
            setForm({
                full_name: "",
                phone: "",
                address_line_1: "",
                address_line_2: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
                is_default: false,
            });
        }
    };

    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            <section className="pt-36 pb-28 sm:pt-40 lg:pt-44 lg:pb-16">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)] sm:text-sm">
                            Checkout
                        </p>
                        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl lg:text-4xl">
                            Complete Your Order
                        </h1>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                <div className="mb-6 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text)] sm:text-xl lg:text-2xl">
                                            Delivery Address
                                        </h2>
                                        <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">
                                            Select or add address for delivery.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowAddressForm((prev) => !prev)}
                                        className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                                    >
                                        <FiPlus />
                                        Add
                                    </button>
                                </div>

                                {addressLoading ? (
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Loading addresses...
                                    </p>
                                ) : addresses.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-[var(--border)] p-5">
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            No saved addresses yet. Add one to continue.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {addresses.map((address) => (
                                            <button
                                                key={address.id}
                                                onClick={() => setSelectedAddress(address)}
                                                className="relative rounded-2xl border p-3 text-left transition-all duration-300 hover:bg-[var(--surface-2)] sm:p-4"
                                                style={{
                                                    borderColor:
                                                        selectedAddress?.id === address.id
                                                            ? "var(--primary)"
                                                            : "var(--border)",
                                                    backgroundColor:
                                                        selectedAddress?.id === address.id
                                                            ? "color-mix(in srgb, var(--primary) 8%, var(--surface))"
                                                            : "var(--surface)",
                                                    boxShadow:
                                                        selectedAddress?.id === address.id
                                                            ? "0 8px 25px var(--shadow)"
                                                            : "none",
                                                }}
                                            >
                                                {selectedAddress?.id === address.id && (
                                                    <span className="absolute right-3 top-2 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-md sm:right-4 sm:top-3 sm:px-3 sm:text-[10px]">
                                                        Selected
                                                    </span>
                                                )}
                                                <div className="flex gap-3">
                                                    <FiMapPin className="mt-1 shrink-0 text-[var(--primary)]" size={18} />

                                                    <div>
                                                        <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm lg:text-base">
                                                            {address.full_name}
                                                        </h3>

                                                        <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)] sm:text-sm sm:leading-6">
                                                            {address.address_line_1}
                                                            {address.address_line_2 ? `, ${address.address_line_2}` : ""},{" "}
                                                            {address.city}, {address.state} - {address.pincode}
                                                        </p>

                                                        <p className="mt-1 text-[11px] text-[var(--text-secondary)] sm:text-sm">
                                                            Phone: {address.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {showAddressForm && (
                                    <form
                                        onSubmit={handleAddAddress}
                                        className="mt-6 grid gap-4"
                                    >
                                        <Input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} />
                                        <Input name="phone" placeholder="Mobile Number" value={form.phone} onChange={handleChange} />
                                        <Input name="address_line_1" placeholder="House No, Street, Area" value={form.address_line_1} onChange={handleChange} />
                                        <Input name="address_line_2" placeholder="Landmark / Optional" value={form.address_line_2} onChange={handleChange} />

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <Input name="city" placeholder="City" value={form.city} onChange={handleChange} />
                                            <Input name="state" placeholder="State" value={form.state} onChange={handleChange} />
                                            <Input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                            <input
                                                type="checkbox"
                                                name="is_default"
                                                checked={form.is_default}
                                                onChange={handleChange}
                                            />
                                            Set as default address
                                        </label>

                                        <button className="rounded-full bg-[var(--primary)] px-6 py-4 font-semibold text-white transition hover:bg-[var(--primary-hover)]">
                                            Save Address
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] lg:sticky lg:top-32">
                            <h2 className="text-2xl font-bold text-[var(--text)]">
                                Order Summary
                            </h2>

                            <div className="mt-6 space-y-4">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between gap-4 text-sm"
                                    >
                                        <span className="text-[var(--text-secondary)]">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium text-[var(--text)]">
                                            ₹{item.sellingPrice * item.quantity}
                                        </span>
                                    </div>
                                ))}

                                <div className="border-t border-[var(--border)] pt-4">
                                    {totalSavings > 0 && (
                                        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                            You saved ₹{totalSavings}
                                        </div>
                                    )}

                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal}</span>
                                    </div>

                                    <div className="mt-3 flex justify-between text-[var(--text-secondary)]">
                                        <span>Delivery</span>
                                        <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                                    </div>

                                    <div className="mt-4 flex justify-between text-xl font-bold text-[var(--text)]">
                                        <span>Total</span>
                                        <span>₹{finalTotal}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={!selectedAddress}
                                className="mt-6 hidden w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-6 py-4 font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
                            >
                                <FiShoppingBag />
                                Place Order
                            </button>

                            {!selectedAddress && (
                                <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">
                                    Select an address to place order.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-8px_25px_var(--shadow)] lg:hidden">
                <button
                    disabled={!selectedAddress}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-6 py-4 font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FiShoppingBag />
                    Place Order
                </button>
            </div>
        </main>
    );
}

function Input({ name, placeholder, value, onChange }) {
    return (
        <input
            required={name !== "address_line_2"}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
        />
    );
}