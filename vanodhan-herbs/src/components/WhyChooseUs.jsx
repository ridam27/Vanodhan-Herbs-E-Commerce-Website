import { FiShield, FiTruck, FiHeart, FiCheckCircle } from "react-icons/fi";

const features = [
    {
        title: "Natural Ingredients",
        description: "Products crafted with carefully selected herbal and natural ingredients.",
        icon: FiHeart,
    },
    {
        title: "Quality Focused",
        description: "Prepared with attention to purity, consistency, and customer trust.",
        icon: FiShield,
    },
    {
        title: "Herbal Wellness",
        description: "Inspired by traditional wellness practices for everyday healthy living.",
        icon: FiCheckCircle,
    },
    {
        title: "India-wide Delivery",
        description: "Reliable delivery support across India with smooth order handling.",
        icon: FiTruck,
    },
];

export default function WhyChooseUs() {
    return (
        <section className="bg-[var(--bg)] py-16 transition-colors duration-300 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="grid overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] shadow-[0_15px_45px_var(--shadow)] lg:grid-cols-2">

                    {/* Left Visual Block */}
                    <div className="relative min-h-[360px] overflow-hidden p-8 sm:p-10 lg:min-h-[520px]">
                        <div className="absolute inset-0 bg-[var(--primary)] opacity-10" />
                        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />
                        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />

                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div>
                                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                                    Why Choose Us
                                </p>

                                <h2 className="max-w-xl text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                                    Trusted Herbal Products for Everyday Wellness
                                </h2>

                                <p className="mt-5 max-w-lg text-base leading-8 text-[var(--text-secondary)]">
                                    Vanodhan Herbs focuses on natural, reliable, and customer-friendly wellness products designed for modern lifestyles.
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="rounded-2xl bg-[var(--surface)] p-4 shadow-[0_8px_25px_var(--shadow)] sm:rounded-3xl sm:p-5">
                                    <p className="text-2xl font-bold text-[var(--primary)] sm:text-3xl">
                                        100%
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)] sm:text-sm">
                                        Natural Focus
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[var(--surface)] p-4 shadow-[0_8px_25px_var(--shadow)] sm:rounded-3xl sm:p-5">
                                    <p className="text-2xl font-bold text-[var(--primary)] sm:text-3xl">
                                        India
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)] sm:text-sm">
                                        Delivery Support
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Feature List */}
                    <div className="bg-[var(--surface)] p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col gap-5">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--surface-2)] hover:shadow-[0_10px_30px_var(--shadow)] sm:items-start sm:gap-4 sm:rounded-3xl sm:p-5"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl">
                                            <Icon size={22} />
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-[var(--text)] sm:text-lg">
                                                {feature.title}
                                            </h3>

                                            <p className="hidden sm:block text-sm leading-7 text-[var(--text-secondary)]">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}