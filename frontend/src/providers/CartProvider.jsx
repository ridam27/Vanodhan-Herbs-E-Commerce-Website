"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";
import { products } from "@/data/products";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    const { user, isLoggedIn, authLoading } = useAuth();

    const hasSyncedCart = useRef(false);

    const getSellingPrice = (product) => {
        const discount = product.discount || 0;

        return discount > 0
            ? Math.round(product.price - (product.price * discount) / 100)
            : product.price;
    };

    const loadGuestCart = () => {
        const storedCart = localStorage.getItem("vanodhan-cart");

        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        } else {
            setCartItems([]);
        }

        setIsCartLoaded(true);
    };

    const loadCloudCart = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error loading cart:", error.message);
            return;
        }

        const formattedCart = data.map((item) => ({
            id: item.product_id,
            slug: item.slug,
            name: item.name,
            image: item.image,
            tag: item.tag,
            price: item.price,
            discount: item.discount,
            sellingPrice: item.selling_price,
            quantity: item.quantity,
        }));

        setCartItems(formattedCart);
        setIsCartLoaded(true);
    };

    const mergeGuestCartToCloud = async () => {
        if (!user) return;

        const guestCart = JSON.parse(
            localStorage.getItem("vanodhan-cart") || "[]"
        );

        if (guestCart.length === 0) return;

        localStorage.removeItem("vanodhan-cart");

        const { data: cloudItems, error } = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", user.id);

        if (error) {
            console.error("Error fetching cloud cart:", error.message);
            return;
        }

        for (const guestItem of guestCart) {
            const existingCloudItem = cloudItems.find(
                (item) => item.product_id === guestItem.id
            );

            const finalQuantity = existingCloudItem
                ? existingCloudItem.quantity + guestItem.quantity
                : guestItem.quantity;

            await supabase.from("cart_items").upsert(
                {
                    user_id: user.id,
                    product_id: guestItem.id,
                    slug: guestItem.slug,
                    name: guestItem.name,
                    image: guestItem.image,
                    tag: guestItem.tag,
                    price: guestItem.price,
                    discount: guestItem.discount || 0,
                    selling_price:
                        guestItem.sellingPrice || getSellingPrice(guestItem),
                    quantity: finalQuantity,
                },
                {
                    onConflict: "user_id,product_id",
                }
            );
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
            loadGuestCart();
        };

        setupCart();
    }, [authLoading, isLoggedIn, user]);

    useEffect(() => {
        if (!isCartLoaded) return;
        if (authLoading) return;
        if (isLoggedIn) return;

        localStorage.setItem("vanodhan-cart", JSON.stringify(cartItems));
    }, [cartItems, isCartLoaded, authLoading, isLoggedIn]);

    const saveItemToCloud = async (product, quantity, sellingPrice) => {
        if (!user) return;

        const { error } = await supabase.from("cart_items").upsert(
            {
                user_id: user.id,
                product_id: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                tag: product.tag,
                price: product.price,
                discount: product.discount || 0,
                selling_price: sellingPrice,
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
        const sellingPrice = getSellingPrice(product);

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                const updatedQuantity = existingItem.quantity + quantity;

                if (isLoggedIn && user) {
                    saveItemToCloud(product, updatedQuantity, sellingPrice);
                }

                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: updatedQuantity }
                        : item
                );
            }

            if (isLoggedIn && user) {
                saveItemToCloud(product, quantity, sellingPrice);
            }

            return [
                ...prevItems,
                {
                    ...product,
                    quantity,
                    sellingPrice,
                },
            ];
        });
    };

    const updateCloudQuantity = async (productId, quantity) => {
        if (!user) return;

        const { error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("user_id", user.id)
            .eq("product_id", productId);

        if (error) {
            console.error("Error updating cart quantity:", error.message);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );

        if (isLoggedIn && user) {
            await updateCloudQuantity(productId, quantity);
        }
    };

    const removeItemFromCloud = async (productId) => {
        if (!user) return;

        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);

        if (error) {
            console.error("Error removing cart item:", error.message);
        }
    };

    const removeFromCart = async (productId) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== productId)
        );

        if (isLoggedIn && user) {
            await removeItemFromCloud(productId);
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
        (total, item) => total + item.quantity,
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.sellingPrice * item.quantity,
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