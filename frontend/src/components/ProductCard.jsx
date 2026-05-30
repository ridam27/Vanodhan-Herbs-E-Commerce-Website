import { FiStar, FiArrowRight } from "react-icons/fi";

export default function ProductCard({
    image,
    name,
    price,
    rating = 4.8,
    reviews = 42,
    tag = "Wellness Support",
    badge,
}) {
    return (
        <div
            className="group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 25px var(--shadow)",
            }}
        >
            {/* Image */}
            <div className="relative overflow-hidden">
                {badge && (
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                        {badge}
                    </div>
                )}

                <img
                    src={image}
                    alt={name}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-72"
                />
            </div>

            {/* Content */}
            <div className="p-5">
                <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--primary)" }}
                >
                    {tag}
                </p>

                <h3
                    className="mb-3 text-lg font-bold sm:text-xl"
                    style={{ color: "var(--text)" }}
                >
                    {name}
                </h3>

                <div
                    className="mb-4 flex items-center gap-2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <FiStar
                        className="fill-yellow-400 text-yellow-400"
                        size={16}
                    />
                    <span>
                        {rating} ({reviews})
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <p
                        className="text-xl font-bold sm:text-2xl"
                        style={{
                            color: "var(--primary)",
                        }}
                    >
                        ₹{price}
                    </p>

                    <button
                        className="
              group/btn
              flex items-center gap-2
              rounded-full
              px-4 py-2
              text-sm font-medium
              text-white
              transition-all duration-300
              hover:shadow-lg
              bg-[var(--primary)]
              hover:bg-[var(--primary-hover)]
            "
                    >
                        Details
                        <FiArrowRight
                            className="
            transition-transform
            duration-300    
            group-hover/btn:translate-x-1.5
            "
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}