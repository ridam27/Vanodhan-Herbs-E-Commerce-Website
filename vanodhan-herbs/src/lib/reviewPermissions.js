import { supabase } from "@/lib/supabaseClient";

export async function canReviewProduct(userId, productId) {
    if (!userId || !productId) return false;

    const { data, error } = await supabase
        .from("order_items")
        .select(`
            id,
            orders!inner (
                user_id,
                status
            )
        `)
        .eq("product_id", productId)
        .eq("orders.user_id", userId)
        .neq("orders.status", "cancelled")
        .limit(1);

    if (error) {
        console.error("Review permission error:", error.message);
        return false;
    }

    return data && data.length > 0;
}