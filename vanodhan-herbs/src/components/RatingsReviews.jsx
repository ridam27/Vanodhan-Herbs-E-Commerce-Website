"use client";

import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";
import { canReviewProduct } from "@/lib/reviewPermissions";

export default function RatingsReviews({
    productId,
    reviews: initialReviews = [],
}) {
    const { user } = useAuth();

    const [reviews, setReviews] = useState(initialReviews);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [canReview, setCanReview] = useState(false);

    const averageRating =
        reviews.length > 0
            ? (
                reviews.reduce((total, review) => total + review.rating, 0) /
                reviews.length
            ).toFixed(1)
            : "0.0";

    useEffect(() => {
        const checkPermission = async () => {
            if (!user || !productId) {
                setCanReview(false);
                return;
            }

            const allowed = await canReviewProduct(user.id, productId);
            setCanReview(allowed);
        };

        checkPermission();
    }, [user, productId]);

    const submitReview = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("Please login to write a review.");
            return;
        }

        if (reviewText.trim().length < 5) {
            setMessage("Review must be at least 5 characters.");
            return;
        }

        setLoading(true);
        setMessage("");

        const reviewerName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Verified Customer";

        const { data, error } = await supabase
            .from("reviews")
            .upsert(
                {
                    user_id: user.id,
                    product_id: productId,
                    rating,
                    review: reviewText.trim(),
                    reviewer_name: reviewerName,
                },
                {
                    onConflict: "user_id,product_id",
                }
            )
            .select()
            .single();

        setLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        setReviews((prev) => {
            const exists = prev.some((item) => item.id === data.id);

            if (exists) {
                return prev.map((item) =>
                    item.id === data.id ? data : item
                );
            }

            return [data, ...prev];
        });

        setReviewText("");
        setRating(5);
        setMessage("Review submitted successfully.");
    };

    return (
        <section className="border-t border-[var(--border)] py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                        Customer Feedback
                    </p>

                    <h2 className="text-3xl font-bold text-[var(--text)]">
                        Ratings & Reviews
                    </h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.5fr]">
                    <div className="space-y-5">
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                            <p className="text-5xl font-bold text-[var(--text)]">
                                {averageRating}
                            </p>

                            <div className="mt-3 flex gap-1 text-yellow-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                        key={star}
                                        className={
                                            star <= Math.round(averageRating)
                                                ? "fill-yellow-400"
                                                : ""
                                        }
                                        size={20}
                                    />
                                ))}
                            </div>

                            <p className="mt-4 text-sm text-[var(--text-secondary)]">
                                Based on {reviews.length} customer reviews
                            </p>
                        </div>

                        {canReview ? (
                            <form
                                onSubmit={submitReview}
                                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]"
                            >
                                <h3 className="mb-4 font-bold text-[var(--text)]">
                                    Write a Review
                                </h3>

                                <div className="mb-4 flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="text-yellow-400"
                                        >
                                            <FiStar
                                                size={22}
                                                className={
                                                    star <= rating
                                                        ? "fill-yellow-400"
                                                        : ""
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Share your experience..."
                                    rows={4}
                                    className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                                />

                                {message && (
                                    <p className="mt-3 text-sm text-[var(--primary)]">
                                        {message}
                                    </p>
                                )}

                                <button
                                    disabled={loading}
                                    className="mt-4 rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white"
                                >
                                    {loading ? "Submitting..." : "Submit Review"}
                                </button>
                            </form>
                        ) : (
                            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                                <h3 className="mb-2 font-bold text-[var(--text)]">
                                    Reviews Restricted
                                </h3>

                                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                    Only customers who purchased this product can write a review.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    No reviews yet.
                                </p>
                            </div>
                        ) : (
                                reviews.slice(0, 3).map((review, index) => (
                                    <div
                                        key={review.id || `${review.user_id}-${index}`}
                                        className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_25px_var(--shadow)]"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        review.reviewer_avatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            review.reviewer_name || "Customer"
                                                        )}`
                                                    }
                                                    alt={review.reviewer_name}
                                                    className="h-11 w-11 rounded-full border border-[var(--border)] object-cover"
                                                />

                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-[var(--text)]">
                                                            {review.reviewer_name || "Verified Customer"}
                                                        </h3>

                                                        <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                            Verified Purchase
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                                        Purchased on{" "}
                                                        {review.purchased_on
                                                            ? new Date(
                                                                review.purchased_on
                                                            ).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            : "Verified Order"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 gap-1">
                                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                                    <FiStar
                                                        key={starIndex}
                                                        size={20}
                                                        className={
                                                            starIndex < review.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-sm leading-7 text-[var(--text-secondary)]">
                                            {review.review}
                                        </p>
                                    </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}