import { supabase } from "@/lib/supabaseClient";

export async function getProductReviews(productId) {
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error.message);
        return [];
    }

    return data || [];
}