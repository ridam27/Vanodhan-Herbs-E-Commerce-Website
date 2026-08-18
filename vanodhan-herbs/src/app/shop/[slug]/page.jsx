import { getProductBySlug, getProducts } from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";
import ProductDetailsClient from "./ProductDetailsClient";

export default async function ProductDetailsPage({ params }) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);
    const relatedProducts = await getProducts();

    const reviews = product
        ? await getProductReviews(product.id)
        : [];

    return (
        <ProductDetailsClient
            product={product}
            relatedProducts={relatedProducts}
            reviews={reviews}
        />
    );
}