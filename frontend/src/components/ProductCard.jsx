import { FiShoppingCart } from "react-icons/fi";

export default function ProductCard({
    image,
    name,
    price,
}) {
    return (
        <div className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            {/* Image */}
            <div className="overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="mb-2 tz`ext-xl font-semibold text-gray-800">
                    {name}
                </h3>

                <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-700">
                        ₹{price}
                    </p>

                    <button className="flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800">
                        <FiShoppingCart />
                        Add
                    </button>
                </div>
            </div>

        </div>
    );
}