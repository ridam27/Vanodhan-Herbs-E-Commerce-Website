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
        title: "Ayurvedic Wellness",
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
                <div className="grid items-center gap-12 lg:grid-cols-2">

                    <div>
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                            Why Choose Us
                        </p>

                        <h2 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
                            Trusted Ayurvedic Products for Everyday Wellness
                        </h2>

                        <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
                            Vanodhan Herbs focuses on natural, reliable, and customer-friendly wellness products designed for modern lifestyles.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--surface-2)]"
                                >
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
                                        <Icon size={25} />
                                    </div>

                                    <h3 className="mb-2 text-lg font-bold text-[var(--text)]">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm leading-7 text-[var(--text-secondary)]">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
}