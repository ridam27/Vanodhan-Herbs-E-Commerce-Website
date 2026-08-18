"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";

const AddressContext = createContext(null);

export function AddressProvider({ children }) {
    const { user, isLoggedIn, authLoading } = useAuth();

    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(true);

    const loadAddresses = async () => {
        if (!user) {
            setAddresses([]);
            setAddressLoading(false);
            return;
        }

        setAddressLoading(true);

        const { data, error } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading addresses:", error.message);
            setAddressLoading(false);
            return;
        }

        setAddresses(data || []);
        setAddressLoading(false);
    };


    useEffect(() => {
        if (authLoading) return;

        if (isLoggedIn && user) {
            loadAddresses();
        } else {
            setAddresses([]);
            setAddressLoading(false);
        }
    }, [authLoading, isLoggedIn, user]);

    const addAddress = async (address) => {
        if (!user) return { error: "User not logged in" };

        if (address.is_default) {
            const { error: updateError } = await supabase
                .from("addresses")
                .update({ is_default: false })
                .eq("user_id", user.id);

            if (updateError) {
                console.error("Error clearing default addresses:", updateError.message);
                return { error: updateError.message };
            }
        }

        const { error } = await supabase.from("addresses").insert({
            user_id: user.id,
            ...address,
        });

        if (error) {
            console.error("Error adding address:", error.message);
            return { error: error.message };
        }

        await loadAddresses();
        return { error: null };
    };

    const updateAddress = async (addressId, updatedAddress) => {
        if (!user) return { error: "User not logged in" };

        if (updatedAddress.is_default) {
            const { error: updateError } = await supabase
                .from("addresses")
                .update({ is_default: false })
                .eq("user_id", user.id);

            if (updateError) {
                return { error: updateError.message };
            }
        }

        const { error } = await supabase
            .from("addresses")
            .update(updatedAddress)
            .eq("user_id", user.id)
            .eq("id", addressId);

        if (error) {
            console.error("Error updating address:", error.message);
            return { error: error.message };
        }

        await loadAddresses();
        return { error: null };
    };

    const deleteAddress = async (addressId) => {
        if (!user) return;

        const { error } = await supabase
            .from("addresses")
            .delete()
            .eq("user_id", user.id)
            .eq("id", addressId);

        if (error) {
            console.error("Error deleting address:", error.message);
            return;
        }

        await loadAddresses();
    };

    return (
        <AddressContext.Provider
            value={{
                addresses,
                addressLoading,
                loadAddresses,
                addAddress,
                updateAddress,
                deleteAddress,
            }}
        >
            {children}
        </AddressContext.Provider>
    );
}

export function useAddress() {
    const context = useContext(AddressContext);

    if (!context) {
        throw new Error("useAddress must be used inside AddressProvider");
    }

    return context;
}