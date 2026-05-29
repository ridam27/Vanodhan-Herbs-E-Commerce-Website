"use client";

import { useState } from "react";
import {
    FiMenu,
    FiX,
    FiMoon,
    FiSun,
    FiShoppingBag,
    FiUser,
    FiLogIn,
} from "react-icons/fi";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const isLoggedIn = false;
    const navLinks = ["Home", "Shop", "About", "Contact"];

    const toggleTheme = () => {
        setIsDark((prev) => {
            const newTheme = !prev;

            if (newTheme) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }

            return newTheme;
        });
    };

    return (
        <>
            <div className="fixed left-0 top-5 z-50 w-full px-4 md:px-6">
                <nav
                    className="mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 backdrop-blur-xl transition-all duration-300"
                    style={{
                        backgroundColor: "var(--navbar-bg)",
                        border: "1px solid var(--navbar-border)",
                        boxShadow: "0 15px 45px var(--shadow)",
                    }}
                >
                    <div className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Vanodhan Herbs"
                            className="h-12 w-auto object-contain md:h-14"
                        />
                    </div>

                    <div className="hidden items-center gap-8 lg:flex">
                        {navLinks.map((item) => (
                            <button
                                key={item}
                                className="relative text-sm font-medium transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:transition-all after:duration-300 hover:after:w-full"
                                style={{
                                    color: "var(--text)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--primary)";
                                    e.currentTarget.style.setProperty(
                                        "--tw-after-bg",
                                        "var(--primary)"
                                    );
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--text)";
                                }}
                            >
                                <span
                                    className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full transition-all duration-300 group-hover:w-full"
                                    style={{ backgroundColor: "var(--primary)" }}
                                />
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 lg:flex">
                        <button
                            onClick={toggleTheme}
                            className="rounded-full p-3 transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                                color: "var(--text)",
                                backgroundColor: "var(--surface-2)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--primary)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--text)";
                            }}
                        >
                            {isDark ? <FiSun size={19} /> : <FiMoon size={19} />}
                        </button>

                        {isLoggedIn ? (
                            <>
                                <button
                                    className="rounded-full p-3 transition-all duration-300 hover:-translate-y-0.5"
                                    style={{
                                        color: "var(--text)",
                                        backgroundColor: "var(--surface-2)",
                                    }}
                                >
                                    <FiUser size={19} />
                                </button>

                                <button
                                    className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                    style={{ backgroundColor: "var(--primary)" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "var(--primary-hover)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "var(--primary)";
                                    }}
                                >
                                    <FiShoppingBag size={18} />
                                    Cart
                                </button>
                            </>
                        ) : (
                            <button
                                className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                style={{ backgroundColor: "var(--primary)" }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "var(--primary-hover)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "var(--primary)";
                                }}
                            >
                                <FiLogIn size={18} />
                                Login
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <button
                            onClick={toggleTheme}
                            className="rounded-full p-3 transition-all duration-300"
                            style={{
                                color: "var(--text)",
                                backgroundColor: "var(--surface-2)",
                            }}
                        >
                            {isDark ? <FiSun size={19} /> : <FiMoon size={19} />}
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="rounded-full p-3 text-white shadow-md transition-all duration-300"
                            style={{ backgroundColor: "var(--primary)" }}
                        >
                            <FiMenu size={22} />
                        </button>
                    </div>
                </nav>
            </div>

            <div
                className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                onClick={() => setIsMenuOpen(false)}
            />

            <aside
                className={`fixed right-0 top-0 z-[70] h-full w-[82%] max-w-sm transform p-6 shadow-2xl transition-transform duration-500 ease-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{
                    backgroundColor: "var(--menu-bg)",
                }}
            >
                <div className="mb-10 flex items-center justify-between">
                    <img
                        src="/logo.png"
                        alt="Vanodhan Herbs"
                        className="h-12 w-auto object-contain"
                    />

                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-full p-3 transition-all duration-300"
                        style={{
                            backgroundColor: "var(--surface-2)",
                            color: "var(--text)",
                        }}
                    >
                        <FiX size={22} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {navLinks.map((item) => (
                        <button
                            key={item}
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-2xl px-5 py-4 text-left text-lg font-semibold transition-all duration-300"
                            style={{
                                color: "var(--text)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--surface-2)";
                                e.currentTarget.style.color = "var(--primary)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "var(--text)";
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div
                    className="mt-10 border-t pt-6"
                    style={{ borderColor: "var(--border)" }}
                >
                    {isLoggedIn ? (
                        <div className="flex flex-col gap-4">
                            <button
                                className="flex items-center gap-3 rounded-2xl px-5 py-4 font-semibold"
                                style={{
                                    backgroundColor: "var(--surface-2)",
                                    color: "var(--primary)",
                                }}
                            >
                                <FiUser />
                                My Account
                            </button>

                            <button
                                className="flex items-center gap-3 rounded-2xl px-5 py-4 font-semibold text-white"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                <FiShoppingBag />
                                Cart
                            </button>
                        </div>
                    ) : (
                        <button
                            className="flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 font-semibold text-white shadow-lg transition-all duration-300"
                            style={{ backgroundColor: "var(--primary)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "var(--primary-hover)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--primary)";
                            }}
                        >
                            <FiLogIn />
                            Login / Sign Up
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}