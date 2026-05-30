import { FiStar, FiArrowRight } from "react-icons/fi";

export default function ProductCard({
    image,
    name,
    price,
    rating = 4.8,
    reviews = 12,
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
            <div className="relative aspect-square overflow-hidden">
                {badge && (
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                        {badge}
                    </div>
                )}

                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-md backdrop-blur-sm md:hidden">
                    <FiStar className="fill-yellow-400 text-yellow-400" size={13} />
                    <span>{rating}</span>
                </div>

                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            <div className="p-4 sm:p-5">
                <div className="mb-2 hidden items-center justify-between gap-3 md:flex">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                        {tag}
                    </p>

                    <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                        <FiStar className="fill-yellow-400 text-yellow-400" size={15} />
                        <span>
                            {rating} ({reviews})
                        </span>
                    </div>
                </div>

                <h3 className="mb-3 line-clamp-2 text-sm font-bold text-[var(--text)] sm:text-lg lg:text-xl">
                    {name}
                </h3>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-bold text-[var(--primary)] sm:text-2xl">
                        ₹{price}
                    </p>

                    <button className="group/btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-all duration-300 hover:bg-[var(--primary-hover)] hover:shadow-lg sm:h-10 sm:w-10">
                        <FiArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}