"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { useAddress } from "@/providers/AddressProvider";
import { useEffect, useState } from "react";
import { FiMapPin, FiPlus, FiShoppingBag, FiTrash2, FiEdit2, } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

export default function CheckoutPage() {
    const { user, authLoading } = useAuth();
    const { cartItems, cartTotal, getSellingPrice, } = useCart();
    const { addresses, addressLoading, addAddress, updateAddress, deleteAddress } = useAddress();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState("");

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderMessage, setOrderMessage] = useState("");
    const [orderSuccess, setOrderSuccess] = useState(false);

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

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;

        try {
            setCouponLoading(true);
            setCouponMessage("");

            const {
                data: { session },
            } = await supabase.auth.getSession();

            const response = await fetch("/api/validate-coupon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    couponCode,
                }),
            });

            const result = await response.json();

            if (!result.valid) {
                setAppliedCoupon(null);
                setCouponDiscount(0);
                setCouponMessage(result.message);
                localStorage.removeItem("vanodhan-coupon");
                return;
            }

            setAppliedCoupon(result.coupon);
            setCouponDiscount(result.couponDiscount);
            setCouponMessage(result.message);
            localStorage.setItem("vanodhan-coupon", result.coupon.code);
        } catch (error) {
            setCouponMessage("Unable to validate coupon.");
        } finally {
            setCouponLoading(false);
        }
    };

    const placeOrder = async () => {
        if (!selectedAddress) return;

        try {
            setOrderLoading(true);
            setOrderMessage("");

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                setOrderMessage("Please login to place order.");
                return;
            }

            const response = await fetch("/api/place-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    addressId: selectedAddress.id,
                    couponCode: appliedCoupon?.code || null,
                    paymentMethod: "cod",
                }),
            });

            const result = await response.json();

            if (!result.success) {
                setOrderMessage(result.message);
                return;
            }

            localStorage.removeItem("vanodhan-coupon");

            setOrderSuccess(true);

            setTimeout(() => {
                window.location.href = "/orders";
            }, 3000);
        } catch (error) {
            setOrderMessage("Unable to place order.");
        } finally {
            setOrderLoading(false);
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddressId(address.id);
        setShowAddressForm(true);

        setForm({
            full_name: address.full_name,
            phone: address.phone,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || "",
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country || "India",
            is_default: address.is_default || false,
        });
    };

    const resetAddressForm = () => {
        setEditingAddressId(null);

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
    };

    const deliveryCharge = cartTotal >= 499 ? 0 : 50;
    const finalTotal = cartTotal + deliveryCharge - couponDiscount;

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

    useEffect(() => {
        const savedCoupon =
            localStorage.getItem("vanodhan-coupon");

        if (savedCoupon) {
            setCouponCode(savedCoupon);
        }
    }, []);

    useEffect(() => {
        if (
            couponCode &&
            cartItems.length > 0 &&
            !appliedCoupon
        ) {
            applyCoupon();
        }
    }, [cartItems.length]);

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

        const result = editingAddressId
            ? await updateAddress(editingAddressId, form)
            : await addAddress(form);

        if (!result.error) {
            setShowAddressForm(false);
            resetAddressForm();
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
                                        onClick={() => {
                                            if (showAddressForm) {
                                                setShowAddressForm(false);
                                                resetAddressForm();
                                            } else {
                                                resetAddressForm();
                                                setShowAddressForm(true);
                                            }
                                        }}
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
                                            <div
                                                key={address.id}
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
                                                    <span className="absolute right-3 top-3 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-md sm:right-4 sm:top-4 sm:px-3 sm:text-[10px]">
                                                        Selected
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAddress(address)}
                                                    className="w-full text-left"
                                                >
                                                    <div className="flex gap-3 pr-20">
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

                                                <button
                                                    type="button"
                                                    onClick={() => handleEditAddress(address)}
                                                    className="absolute bottom-3 right-14 flex h-9 w-9 items-center justify-center rounded-full text-[var(--primary)] transition hover:bg-[var(--surface-2)]"
                                                >
                                                    <FiEdit2 />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (selectedAddress?.id === address.id) {
                                                            setSelectedAddress(null);
                                                        }

                                                        await deleteAddress(address.id);
                                                    }}
                                                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
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
                                            {editingAddressId ? "Update Address" : "Save Address"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        

                        <div className="h-fit space-y-5 lg:sticky lg:top-32">
                            {/* Coupon Box */}
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_25px_var(--shadow)]">
                                <h3 className="mb-4 text-lg font-bold text-[var(--text)]">
                                    Apply Coupon
                                </h3>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Coupon code"
                                        className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
                                    />

                                    <button
                                        type="button"
                                        onClick={applyCoupon}
                                        disabled={couponLoading}
                                        className="shrink-0 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {couponLoading ? "..." : "Apply"}
                                    </button>
                                </div>

                                {couponMessage && (
                                    <p
                                        className={`mt-3 text-sm font-medium ${appliedCoupon ? "text-green-600" : "text-red-500"
                                            }`}
                                    >
                                        {couponMessage}
                                    </p>
                                )}

                                {appliedCoupon && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAppliedCoupon(null);
                                            setCouponDiscount(0);
                                            setCouponCode("");
                                            setCouponMessage("");

                                            localStorage.removeItem("vanodhan-coupon");
                                        }}
                                        className="mt-2 text-sm font-semibold text-red-500 transition hover:text-red-600"
                                    >
                                        Remove Coupon
                                    </button>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                <h2 className="text-2xl font-bold text-[var(--text)]">
                                    Order Summary
                                </h2>

                                <div className="mt-6 space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between gap-4 text-sm">
                                            <span className="text-[var(--text-secondary)]">
                                                {item.name} × {item.quantity}
                                            </span>

                                            <span className="font-medium text-[var(--text)]">
                                                ₹{getSellingPrice(item) * item.quantity}
                                            </span>
                                        </div>
                                    ))}

                                    {totalSavings > 0 && (
                                        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                            You saved ₹{totalSavings}
                                        </div>
                                    )}

                                    <div className="border-t border-[var(--border)] pt-4">
                                        <div className="flex justify-between text-[var(--text-secondary)]">
                                            <span>Subtotal</span>
                                            <span>₹{cartTotal}</span>
                                        </div>

                                        <div className="mt-3 flex justify-between text-[var(--text-secondary)]">
                                            <span>Delivery</span>
                                            <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                                        </div>

                                        {couponDiscount > 0 && (
                                            <div className="mt-3 flex justify-between text-green-600">
                                                <span>Coupon Discount</span>
                                                <span>-₹{couponDiscount}</span>
                                            </div>
                                        )}

                                        <div className="mt-4 flex justify-between text-xl font-bold text-[var(--text)]">
                                            <span>Total</span>
                                            <span>₹{finalTotal}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={placeOrder}
                                    disabled={!selectedAddress || orderLoading || orderSuccess}
                                    className="mt-6 hidden w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-6 py-4 font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
                                >
                                    <FiShoppingBag />
                                    {orderLoading ? "Placing Order..." : orderSuccess ? "Order Placed" : "Place Order"}
                                </button>

                                {orderSuccess ? (
                                    <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center">
                                        <p className="font-semibold text-green-700">
                                            Your order has been placed successfully.
                                        </p>

                                        <p className="mt-1 text-sm text-green-600">
                                            Redirecting to Orders page in 3 seconds...
                                        </p>
                                    </div>
                                ) : (
                                    orderMessage && (
                                        <p className="mt-3 text-center text-sm text-red-500">
                                            {orderMessage}
                                        </p>
                                    )
                                )}

                                {!selectedAddress && (
                                    <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">
                                        Select an address to place order.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-8px_25px_var(--shadow)] lg:hidden">
                <button
                    onClick={placeOrder}
                    disabled={!selectedAddress || orderLoading || orderSuccess}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-6 py-4 font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FiShoppingBag />
                    {orderLoading ? "Placing Order..." : orderSuccess ? "Order Placed" : "Place Order"}
                </button>
                {orderSuccess ? (
                    <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center">
                        <p className="font-semibold text-green-700">
                            Your order has been placed successfully.
                        </p>

                        <p className="mt-1 text-sm text-green-600">
                            Redirecting to Orders page in 3 seconds...
                        </p>
                    </div>
                ) : (
                    orderMessage && (
                        <p className="mt-3 text-center text-sm text-red-500">
                            {orderMessage}
                        </p>
                    )
                )}
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