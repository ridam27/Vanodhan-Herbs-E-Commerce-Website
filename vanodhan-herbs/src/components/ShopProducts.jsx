"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import {
    FiSearch,
    FiX,
    FiSliders,
    FiGrid,
    FiShield,
    FiFeather,
    FiHeart,
    FiWind,
    FiActivity,
    FiPlus,
    FiBox,
    FiChevronDown,
} from "react-icons/fi";

export default function ShopProducts({ products }) {
    const [searchQuery, setSearchQuery] = useState("");

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    const categories = [
        "All",
        ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];

    const sortLabels = {
        default: "Sort by Default",
        "price-low": "Price: Low to High",
        "price-high": "Price: High to Low",
        discount: "Highest Discount",
        rating: "Top Rated",
    };

    const filteredProducts = products
        .filter((product) => {
            const query = searchQuery.toLowerCase();

            const matchesSearch =
                product.name?.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query) ||
                product.short_description?.toLowerCase().includes(query) ||
                product.tag?.toLowerCase().includes(query);

            const matchesCategory =
                selectedCategory === "All" ||
                product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === "price-low") {
                return a.price - b.price;
            }

            if (sortBy === "price-high") {
                return b.price - a.price;
            }

            if (sortBy === "discount") {
                return b.discount - a.discount;
            }

            if (sortBy === "rating") {
                return b.rating - a.rating;
            }

            return 0;
        });

    return (
        <>
                    <div className="mb-10 space-y-4">
                        {/* Mobile Search + Filter Button */}
                        <div className="flex gap-2 md:hidden">
                            <div className="group relative flex-1">
                                <FiSearch
                                    size={17}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--primary)]"
                                />

                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-10 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                                />

                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                                    >
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(true)}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-md"
                            >
                                <FiSliders size={18} />
                            </button>
                        </div>

                        {/* Desktop Search + Filters */}
                        <div className="hidden md:block">
                            <div className="rounded-4xl mb-3 border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_12px_35px_var(--shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_18px_45px_var(--shadow)] focus-within:-translate-y-0.5 focus-within:border-[var(--primary)] focus-within:shadow-[0_18px_45px_var(--shadow)]">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <FiSearch
                                            size={20}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Search for Ashwagandha, oils, churna..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full rounded-full bg-transparent py-3 pl-12 pr-10 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
                                        />

                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery("")}
                                                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="hidden rounded-full bg-[var(--primary)] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--primary-hover)] sm:block"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Filter Row */}
                            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="grid gap-3 sm:grid-cols-2 lg:w-[48%]">
                                    {/* Category Filter */}
                                    <div className="relative">
                                        <FiGrid
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                                        />

                                        <FilterDropdown 
                                            icon={FiGrid}
                                            value={selectedCategory}
                                            onChange={setSelectedCategory}
                                            options={categories.map((category) => ({
                                                label: category,
                                                value: category,
                                            }))}
                                        />
                                    </div>

                                    {/* Sort Filter */}
                                    <div className="relative">
                                        <FiSliders
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                                        />

                                        <FilterDropdown
                                            icon={FiSliders}
                                            value={sortBy}
                                            displayValue={sortLabels[sortBy]}
                                            onChange={setSortBy}
                                            options={[
                                                { label: "Sort by Default", value: "default" },
                                                { label: "Price: Low to High", value: "price-low" },
                                                { label: "Price: High to Low", value: "price-high" },
                                                { label: "Highest Discount", value: "discount" },
                                                { label: "Top Rated", value: "rating" },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
                                    <FiBox className="text-[var(--primary)]" />
                                    {filteredProducts.length} Products Found
                                </div>
                            </div>

                            <div className="relative">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="sticky left-2 z-10 shrink-0 bg-[var(--bg)] pr-4">
                                        <span className="relative block text-xs font-semibold text-[var(--text-secondary)] sm:text-sm">
                                            Popular Searches:
                                        </span>

                                        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 translate-x-full" />
                                    </div>

                                    <div className="scrollbar-hide flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition sm:px-5 sm:py-2 sm:text-sm ${searchQuery === ""
                                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                                }`}
                                        >
                                            All
                                        </button>

                                        {[
                                            { label: "Immunity", icon: FiShield },
                                            { label: "Hair", icon: FiFeather },
                                            { label: "Skin", icon: FiHeart },
                                            { label: "Digestive", icon: FiActivity },
                                            { label: "Respiratory", icon: FiWind },
                                            { label: "Wellness", icon: FiPlus },
                                        ].map(({ label, icon: Icon }) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() =>
                                                    setSearchQuery(
                                                        searchQuery === label ? "" : label
                                                    )
                                                }
                                                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2 sm:text-sm ${searchQuery === label
                                                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                                    }`}
                                            >
                                                <Icon size={13} className="sm:h-[15px] sm:w-[15px]" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Mobile Chips */}
                        <div className="relative max-w-full overflow-hidden md:hidden">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="sticky left-2 z-10 shrink-0 bg-[var(--bg)] pr-4">
                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                        Popular:
                                    </span>

                                    <div className="pointer-events-none absolute right-0 top-0 h-full w-8 translate-x-full bg-gradient-to-r from-[var(--bg)] to-transparent" />
                                </div>

                                <div className="scrollbar-hide flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
                                    {[
                                        { label: "Immunity", icon: FiShield },
                                        { label: "Hair", icon: FiFeather },
                                        { label: "Skin", icon: FiHeart },
                                        { label: "Digestive", icon: FiActivity },
                                        { label: "Respiratory", icon: FiWind },
                                        { label: "Wellness", icon: FiPlus },
                                    ].map(({ label, icon: Icon }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() =>
                                                setSearchQuery(searchQuery === label ? "" : label)
                                            }
                                            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${searchQuery === label
                                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                                                }`}
                                        >
                                            <Icon size={12} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

            {isFilterOpen && (
                <div className="fixed inset-0 z-[80] md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsFilterOpen(false)}
                    />

                    <div className="absolute bottom-0 left-0 w-full rounded-t-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[var(--text)]">
                                Filters
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(false)}
                                className="rounded-full bg-[var(--surface-2)] p-2 text-[var(--text)]"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Category Chips */}
                            <div>
                                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                                    Category
                                </h4>

                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setSelectedCategory(category)}
                                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === category
                                                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                                    : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)]"
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Chips */}
                            <div className="border-t border-[var(--border)] pt-6">
                                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                                    Sort By
                                </h4>

                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: "Default", value: "default" },
                                        { label: "Price Low → High", value: "price-low" },
                                        { label: "Price High → Low", value: "price-high" },
                                        { label: "Highest Discount", value: "discount" },
                                        { label: "Top Rated", value: "rating" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setSortBy(option.value)}
                                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${sortBy === option.value
                                                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                                    : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)]"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(false)}
                                className="mt-4 w-full rounded-full bg-[var(--primary)] px-5 py-4 font-semibold text-white shadow-lg"
                            >
                                Display {filteredProducts.length} Products
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                    <h3 className="text-xl font-bold text-[var(--text)]">
                        No products found
                    </h3>

                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Try searching for another product or category.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            slug={product.slug}
                            image={product.image}
                            name={product.name}
                            price={product.price}
                            discount={product.discount}
                            rating={product.rating}
                            reviews={product.reviews}
                            tag={product.tag}
                            badge={product.badge}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function FilterDropdown({
    icon: Icon,
    value,
    displayValue,
    options,
    onChange,
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            {open && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setOpen(false)}
                />
            )}

            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative z-40 flex w-full items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition-all duration-300 hover:border-[var(--primary)] focus:border-[var(--primary)]"
            >
                <span className="flex items-center gap-3">
                    <Icon size={16} className="text-[var(--text-secondary)]" />
                    {displayValue || value}
                </span>

                <FiChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                />
            </button>

            {open && (
                <div className="absolute left-0 top-14 z-50 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_18px_45px_var(--shadow)]">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${value === option.value
                                    ? "bg-[var(--primary)] text-white"
                                    : "text-[var(--text)] hover:bg-[var(--surface-2)]"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}