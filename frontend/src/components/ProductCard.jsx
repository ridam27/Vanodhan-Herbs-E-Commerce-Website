import { FiShoppingCart } from "react-icons/fi";

export default function ProductCard({
    image,
    name,
    price,
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
            <div className="overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-72"
                />
            </div>

            {/* Content */}
            <div className="p-5">
                <h3
                    className="mb-2 text-lg font-semibold sm:text-xl"
                    style={{
                        color: "var(--text)",
                    }}
                >
                    {name}
                </h3>

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
                        <FiShoppingCart />
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}