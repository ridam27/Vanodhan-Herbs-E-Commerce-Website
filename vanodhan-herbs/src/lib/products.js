import { supabase } from "@/lib/supabaseClient";

export async function getProducts() {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching products:", error.message);
        return [];
    }

    return data;
}

export async function getAllProductSlugs() {
    const { data, error } = await supabase
        .from("products")
        .select("slug")
        .eq("is_active", true);

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

export async function getProductBySlug(slug) {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

    if (error) {
        console.error("Error fetching product:", error.message);
        return null;
    }

    return data;
}