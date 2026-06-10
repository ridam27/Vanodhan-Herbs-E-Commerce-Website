import { categories } from "@/data/categories";

export default function CategoriesSection() {
    return (
        <section className="bg-[var(--bg    )] py-16 transition-colors duration-300 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                        Shop by Category
                    </p>

                    <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
                        Explore Natural Wellness Categories
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                        Find Herbal products designed for everyday wellness, care, and healthy living.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <div
                                key={category.title}
                                className="
    group flex items-center gap-4
    rounded-2xl
    border border-[var(--border)]
    bg-[var(--surface)]
    p-4
    transition-all duration-300
    hover:-translate-y-1
    hover:bg-[var(--surface-2)]
    hover:shadow-[0_12px_35px_var(--shadow)]

    sm:block
    sm:rounded-3xl
    sm:bg-[var(--bg)]
    sm:p-6
  "
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-lg transition-all duration-300 group-hover:scale-105 sm:mb-6 sm:h-16 sm:w-16 sm:rounded-2xl">
                                    <Icon size={24} className="sm:h-[30px] sm:w-[30px]" />
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-[var(--text)] sm:mb-3 sm:text-xl">
                                        {category.title}
                                    </h3>

                                    <p className="hidden text-sm leading-7 text-[var(--text-secondary)] sm:block">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}