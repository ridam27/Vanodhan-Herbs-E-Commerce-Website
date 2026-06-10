"use client";

import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState, useRef } from "react";

import {
    FiMenu,
    FiX,
    FiMoon,
    FiSun,
    FiShoppingBag,
    FiUser,
    FiLogIn,
    FiPackage,
    FiLogOut
} from "react-icons/fi";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const { cartCount, isCartLoaded } = useCart();
    const userMenuRef = useRef(null);

    const { isLoggedIn, logout, authLoading } = useAuth();
    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

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

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [isMenuOpen]);

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
                            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                            alt="Vanodhan Herbs"
                            className="h-12 w-auto object-contain md:h-14"
                        />
                    </div>

                    <div className="hidden items-center gap-8 lg:flex">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative text-sm font-medium text-[var(--text)] transition-colors duration-300 hover:text-[var(--primary)] after:absolute after:left-1/2 after:-bottom-1.5 after:h-[2px] after:w-full after:-translate-x-1/2 after:scale-x-0 after:rounded-full after:bg-[var(--primary)] after:transition-transform after:duration-300 hover:after:scale-x-100"
                            >
                                {item.name}
                            </Link>
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
                                <div ref={userMenuRef} className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="rounded-full p-3 transition-all duration-300 hover:-translate-y-0.5"
                                        style={{
                                            color: "var(--text)",
                                            backgroundColor: "var(--surface-2)",
                                        }}
                                    >
                                        <FiUser size={19} />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div
                                            className="absolute right-0 top-14 z-50 w-56 rounded-3xl border p-3 shadow-[0_12px_35px_var(--shadow)]"
                                            style={{
                                                backgroundColor: "var(--surface)",
                                                borderColor: "var(--border)",
                                            }}
                                        >
                                            <UserMenuLink href="/account" icon={<FiUser />} text="Account" />
                                            <UserMenuLink href="/orders" icon={<FiPackage />} text="Orders" />
                                            <UserMenuLink href="/cart" icon={<FiShoppingBag />} text="Cart" />

                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                                            >
                                                <FiLogOut />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href="/cart"
                                    className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                    style={{ backgroundColor: "var(--primary)" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "var(--primary)";
                                    }}
                                >
                                    <div className="relative">
                                        <FiShoppingBag size={18} />

                                        {isCartLoaded && cartCount > 0 && (
                                            <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                                {cartCount}
                                            </span>
                                        )}
                                    </div>

                                    Cart
                                </Link>
                            </>
                        ) : (
                                <Link
                                    href="/auth"
                                    className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                    style={{ backgroundColor: "var(--primary)" }}
                                >
                                    <FiLogIn size={18} />
                                    Login
                                </Link>
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
                className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                onClick={() => setIsMenuOpen(false)}
            />

            <aside
                className={`fixed right-0 top-0 z-[70] h-full w-[86%] max-w-sm transform border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl transition-transform duration-500 ease-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="mb-8 flex items-center justify-between">
                    <img
                        src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                        alt="Vanodhan Herbs"
                        className="h-12 w-auto object-contain"
                    />

                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-full bg-[var(--surface-2)] p-3 text-[var(--text)] transition-all duration-300"
                    >
                        <FiX size={22} />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-2xl px-5 py-4 text-base font-semibold text-[var(--text)] transition-all duration-300 hover:bg-[var(--surface-2)] hover:text-[var(--primary)]"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="mt-8 border-t border-[var(--border)] pt-6">
                    {isLoggedIn ? (
                        <div className="flex flex-col gap-3">
                            <MobileMenuLink
                                href="/account"
                                icon={<FiUser />}
                                text="My Account"
                                onClick={() => setIsMenuOpen(false)}
                            />

                            <MobileMenuLink
                                href="/orders"
                                icon={<FiPackage />}
                                text="My Orders"
                                onClick={() => setIsMenuOpen(false)}
                            />

                            <Link
                                href="/cart"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 rounded-2xl bg-[var(--primary)] px-5 py-4 font-semibold text-white"
                            >
                                <div className="relative">
                                    <FiShoppingBag />

                                    {isCartLoaded && cartCount > 0 && (
                                        <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                                Cart
                            </Link>

                            <button
                                onClick={() => {
                                    logout();
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-3 rounded-2xl px-5 py-4 font-semibold text-red-500 transition hover:bg-red-50"
                            >
                                <FiLogOut />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--primary)] px-5 py-4 font-semibold text-white shadow-lg transition hover:bg-[var(--primary-hover)]"
                        >
                            <FiLogIn />
                            Login / Sign Up
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}

function UserMenuLink({ href, icon, text }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]"
        >
            {icon}
            {text}
        </Link>
    );
}

function MobileMenuLink({ href, icon, text, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-5 py-4 font-semibold text-[var(--text)] transition hover:text-[var(--primary)]"
        >
            {icon}
            {text}
        </Link>
    );
}