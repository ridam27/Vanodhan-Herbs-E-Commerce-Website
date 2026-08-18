"use client";

import Link from "next/link";

export default function Hero() {
    return (
        <section
            className="w-full pt-36 pb-16 transition-all duration-300 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24"
            style={{
                backgroundColor: "var(--bg)",
            }}
        >
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">

                {/* Left Content */}
                <div className="text-center lg:text-left">
                    <p
                        className="mb-4 text-xs font-bold uppercase tracking-[0.3em] sm:text-sm"
                        style={{
                            color: "var(--primary)",
                        }}
                    >
                        Rooted in Nature, Committed to Wellness
                    </p>

                    <h1
                        className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:mx-0"
                        style={{
                            color: "var(--text)",
                        }}
                    >
                        Pure Herbal Wellness for Everyday Life
                    </h1>

                    <p
                        className="mx-auto mt-6 max-w-2xl text-base leading-8 sm:text-lg lg:mx-0"
                        style={{
                            color: "var(--text-secondary)",
                        }}
                    >
                        Discover authentic Herbal and natural dietary products crafted
                        to support your health, wellness, and daily lifestyle.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">

                        <Link
                            href="/shop"
                            className="w-full rounded-full bg-[var(--primary)] px-8 py-4 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--primary-hover)] sm:w-auto"
                        >
                            Shop Now
                        </Link>

                        <Link
                            href="#best-sellers"
                            className="w-full rounded-full border border-[var(--primary)] px-8 py-4 text-center font-semibold text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)] hover:text-white sm:w-auto"
                        >
                            Explore Products
                        </Link>

                    </div>
                </div>

                {/* Right Image */}
                <div className="relative">

                    <div
                        className="absolute -inset-4 rounded-[2rem] blur-2xl"
                        style={{
                            backgroundColor: "color-mix(in srgb, var(--primary) 25%, transparent)",
                        }}
                    />

                    <div
                        className="relative overflow-hidden rounded-[2rem] p-3"
                        style={{
                            backgroundColor: "var(--surface)",
                            border: "1px solid var(--border)",
                            boxShadow: "0 20px 60px var(--shadow)",
                        }}
                    >
                        <img
                            src="https://plus.unsplash.com/premium_photo-1661574859504-d706763e4f3e?q=80&w=687&auto=format&fit=crop"
                            alt="Herbal Products"
                            className="h-[320px] w-full rounded-[1.5rem] object-cover sm:h-[420px] lg:h-[500px]"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}