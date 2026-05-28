import { FiShoppingBag, FiUser } from "react-icons/fi";

export default function Navbar() {
    return (
        <div className="fixed top-5 left-0 z-50 w-full px-6">
            <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-green-100 bg-white/85 px-6 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">

                {/* Logo */}
                <div className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="Vanodhan Herbs"
                        className="h-14 w-auto object-contain"
                    />
                </div>

                {/* Menu */}
                <div className="hidden items-center gap-8 md:flex">
                    {["Home", "Shop", "About", "Contact"].map((item) => (
                        <button
                            key={item}
                            className="relative text-sm font-medium text-gray-700 transition-all duration-300 hover:text-green-700 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-green-700 after:transition-all after:duration-300 hover:after:w-full"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="rounded-full p-3 text-gray-700 transition-all duration-300 hover:bg-green-50 hover:text-green-700">
                        <FiUser size={19} />
                    </button>

                    <button className="flex items-center gap-2 rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-lg">
                        <FiShoppingBag size={18} />
                        Cart
                    </button>
                </div>
            </nav>
        </div>
    );
}