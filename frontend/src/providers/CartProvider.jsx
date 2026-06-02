"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";
import { getProducts } from "@/lib/products";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    const { user, isLoggedIn, authLoading } = useAuth();
    const hasSyncedCart = useRef(false);

    const getSellingPrice = (product) => {
        const price = Number(product.price || 0);
        const discount = Number(product.discount || 0);

        return discount > 0
            ? Math.round(price - (price * discount) / 100)
            : price;
    };

    const getGuestCart = () => {
        return JSON.parse(localStorage.getItem("vanodhan-cart") || "[]");
    };

    const saveGuestCart = (items) => {
        const guestCart = items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        localStorage.setItem("vanodhan-cart", JSON.stringify(guestCart));
    };

    const attachProductData = async (rawCart) => {
        const products = await getProducts();

        return rawCart
            .map((cartItem) => {
                const product = products.find(
                    (p) => Number(p.id) === Number(cartItem.product_id)
                );

                if (!product) return null;

                return {
                    ...product,
                    quantity: Number(cartItem.quantity),
                };
            })
            .filter(Boolean);
    };

    const loadGuestCart = async () => {
        const guestCart = getGuestCart();
        const formattedCart = await attachProductData(guestCart);

        setCartItems(formattedCart);
        setIsCartLoaded(true);
    };

    const loadCloudCart = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("cart_items")
            .select("product_id, quantity")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error loading cart:", error.message);
            setCartItems([]);
            setIsCartLoaded(true);
            return;
        }

        const formattedCart = await attachProductData(data || []);

        setCartItems(formattedCart);
        setIsCartLoaded(true);
    };

    const mergeGuestCartToCloud = async () => {
        if (!user) return;

        const guestCart = getGuestCart();
        if (guestCart.length === 0) return;

        localStorage.removeItem("vanodhan-cart");

        const { data: cloudItems, error } = await supabase
            .from("cart_items")
            .select("product_id, quantity")
            .eq("user_id", user.id);

        if (error) {
            console.error("Error fetching cloud cart:", error.message);
            return;
        }

        for (const guestItem of guestCart) {
            const existingItem = cloudItems?.find(
                (item) => Number(item.product_id) === Number(guestItem.product_id)
            );

            const finalQuantity = existingItem
                ? Number(existingItem.quantity) + Number(guestItem.quantity)
                : Number(guestItem.quantity);

            const { error: upsertError } = await supabase
                .from("cart_items")
                .upsert(
                    {
                        user_id: user.id,
                        product_id: guestItem.product_id,
                        quantity: finalQuantity,
                    },
                    {
                        onConflict: "user_id,product_id",
                    }
                );

            if (upsertError) {
                console.error("Error merging cart:", upsertError.message);
            }
        }
    };

    useEffect(() => {
        if (authLoading) return;

        const setupCart = async () => {
            setIsCartLoaded(false);

            if (isLoggedIn && user) {
                if (!hasSyncedCart.current) {
                    hasSyncedCart.current = true;
                    await mergeGuestCartToCloud();
                }

                await loadCloudCart();
                return;
            }

            hasSyncedCart.current = false;
            await loadGuestCart();
        };

        setupCart();
    }, [authLoading, isLoggedIn, user]);

    const saveItemToCloud = async (productId, quantity) => {
        if (!user) return;

        const { error } = await supabase.from("cart_items").upsert(
            {
                user_id: user.id,
                product_id: productId,
                quantity,
            },
            {
                onConflict: "user_id,product_id",
            }
        );

        if (error) {
            console.error("Error saving cart item:", error.message);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        const productId = Number(product.id);

        setCartItems((prevItems) => {
            const existingItem = prevItems.find(
                (item) => Number(item.id) === productId
            );

            let updatedCart;

            if (existingItem) {
                updatedCart = prevItems.map((item) =>
                    Number(item.id) === productId
                        ? {
                            ...item,
                            quantity: Number(item.quantity) + Number(quantity),
                        }
                        : item
                );
            } else {
                updatedCart = [
                    ...prevItems,
                    {
                        ...product,
                        quantity: Number(quantity),
                    },
                ];
            }

            const updatedItem = updatedCart.find(
                (item) => Number(item.id) === productId
            );

            if (isLoggedIn && user) {
                saveItemToCloud(productId, updatedItem.quantity);
            } else {
                saveGuestCart(updatedCart);
            }

            return updatedCart;
        });
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        setCartItems((prevItems) => {
            const updatedCart = prevItems.map((item) =>
                Number(item.id) === Number(productId)
                    ? { ...item, quantity: Number(quantity) }
                    : item
            );

            if (!isLoggedIn) {
                saveGuestCart(updatedCart);
            }

            return updatedCart;
        });

        if (isLoggedIn && user) {
            const { error } = await supabase
                .from("cart_items")
                .update({ quantity })
                .eq("user_id", user.id)
                .eq("product_id", productId);

            if (error) {
                console.error("Error updating quantity:", error.message);
            }
        }
    };

    const removeFromCart = async (productId) => {
        setCartItems((prevItems) => {
            const updatedCart = prevItems.filter(
                (item) => Number(item.id) !== Number(productId)
            );

            if (!isLoggedIn) {
                saveGuestCart(updatedCart);
            }

            return updatedCart;
        });

        if (isLoggedIn && user) {
            const { error } = await supabase
                .from("cart_items")
                .delete()
                .eq("user_id", user.id)
                .eq("product_id", productId);

            if (error) {
                console.error("Error removing item:", error.message);
            }
        }
    };

    const clearCart = async () => {
        setCartItems([]);
        localStorage.removeItem("vanodhan-cart");

        if (isLoggedIn && user) {
            const { error } = await supabase
                .from("cart_items")
                .delete()
                .eq("user_id", user.id);

            if (error) {
                console.error("Error clearing cart:", error.message);
            }
        }
    };

    const cartCount = cartItems.reduce(
        (total, item) => total + Number(item.quantity),
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) => total + getSellingPrice(item) * Number(item.quantity),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartLoaded,
                getSellingPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}