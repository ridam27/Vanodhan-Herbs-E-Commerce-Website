"use client";

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
                        Pure Ayurvedic Wellness for Everyday Life
                    </h1>

                    <p
                        className="mx-auto mt-6 max-w-2xl text-base leading-8 sm:text-lg lg:mx-0"
                        style={{
                            color: "var(--text-secondary)",
                        }}
                    >
                        Discover authentic Ayurvedic and natural dietary products crafted
                        to support your health, wellness, and daily lifestyle.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">

                        <button
                            className="w-full rounded-full px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 sm:w-auto"
                            style={{
                                backgroundColor: "var(--primary)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "var(--primary-hover)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--primary)";
                            }}
                        >
                            Shop Now
                        </button>

                        <button
                            className="w-full rounded-full border px-8 py-4 font-semibold transition-all duration-300 sm:w-auto"
                            style={{
                                borderColor: "var(--primary)",
                                color: "var(--primary)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--primary)";
                                e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "var(--primary)";
                            }}
                        >
                            Explore Products
                        </button>

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
                            alt="Ayurvedic Products"
                            className="h-[320px] w-full rounded-[1.5rem] object-cover sm:h-[420px] lg:h-[500px]"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}