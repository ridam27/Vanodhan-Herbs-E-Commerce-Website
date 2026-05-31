import { FiStar } from "react-icons/fi";

const reviews = [
    {
        name: "Priya S.",
        rating: 5,
        comment: "Good quality product and packaging was also nice.",
    },
    {
        name: "Rahul P.",
        rating: 4,
        comment: "Product feels natural and delivery was smooth.",
    },
    {
        name: "Anjali K.",
        rating: 5,
        comment: "Satisfied with the quality. Will order again.",
    },
];

export default function RatingsReviews({ rating, reviewsCount }) {
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
                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)]">
                        <p className="text-5xl font-bold text-[var(--text)]">
                            {rating}
                        </p>

                        <div className="mt-3 flex gap-1 text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                    key={star}
                                    className="fill-yellow-400"
                                    size={20}
                                />
                            ))}
                        </div>

                        <p className="mt-4 text-sm text-[var(--text-secondary)]">
                            Based on {reviewsCount} customer reviews
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {reviews.map((review) => (
                            <div
                                key={review.name}
                                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_25px_var(--shadow)]"
                            >
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <h3 className="font-bold text-[var(--text)]">
                                        {review.name}
                                    </h3>

                                    <div className="flex gap-1 text-yellow-400">
                                        {Array.from({ length: review.rating }).map((_, index) => (
                                            <FiStar
                                                key={index}
                                                className="fill-yellow-400"
                                                size={15}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                                    {review.comment}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}