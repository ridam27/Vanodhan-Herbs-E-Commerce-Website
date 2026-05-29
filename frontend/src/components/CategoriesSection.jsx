import { GiPowder, GiMedicines, GiOilDrum, GiHerbsBundle } from "react-icons/gi";

const categories = [
    {
        title: "Herbal Powders",
        description: "Natural powders for daily wellness and health support.",
        icon: GiPowder,
    },
    {
        title: "Churna",
        description: "Traditional Ayurvedic blends for digestion and balance.",
        icon: GiMedicines,
    },
    {
        title: "Herbal Oils",
        description: "Ayurvedic oils for hair, skin, and body care.",
        icon: GiOilDrum,
    },
    {
        title: "Wellness Products",
        description: "Daily-use products crafted with natural ingredients.",
        icon: GiHerbsBundle,
    },
];

export default function CategoriesSection() {
    return (
        <section className="bg-[var(--surface)] py-16 transition-colors duration-300 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                        Shop by Category
                    </p>

                    <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
                        Explore Natural Wellness Categories
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                        Find Ayurvedic products designed for everyday wellness, care, and healthy living.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <div
                                key={category.title}
                                className="group rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--surface-2)] hover:shadow-[0_12px_35px_var(--shadow)]"
                            >
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-lg transition-all duration-300 group-hover:scale-105">
                                    <Icon size={30} />
                                </div>

                                <h3 className="mb-3 text-xl font-bold text-[var(--text)]">
                                    {category.title}
                                </h3>

                                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                                    {category.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}