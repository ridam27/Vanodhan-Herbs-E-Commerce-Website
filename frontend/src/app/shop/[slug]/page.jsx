import { getProductBySlug, getProducts } from "@/lib/products";
import ProductDetailsClient from "./ProductDetailsClient";

export default async function ProductDetailsPage({ params }) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);
    const relatedProducts = await getProducts();

    return (
        <ProductDetailsClient
            product={product}
            relatedProducts={relatedProducts}
        />
    );
}