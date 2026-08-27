import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
    FiSun,
    FiShield,
    FiCheckCircle,
    FiHeart,
    FiAward,
    FiUsers,
    FiPackage,
    FiArrowRight,
    FiFeather,
    FiLayers,
    FiSearch,
} from "react-icons/fi";

export const metadata = {
    title: "About Us | Vanodhan Herbs - Pure Herbal & Ayurvedic Botanical Wellness",
    description: "Discover Vanodhan Herbs heritage. We synthesize centuries-old Ayurvedic traditions with modern botanical purity testing to bring 100% natural, chemical-free herbal formulations to your home.",
};

const coreValues = [
    {
        icon: FiFeather,
        title: "100% Pure & Organic",
        description: "Harvested directly from certified sustainable farms without chemical pesticides or artificial additives.",
    },
    {
        icon: FiShield,
        title: "Third-Party Lab Tested",
        description: "Every herbal batch undergoes rigorous purity testing for active botanical potency and heavy-metal safety.",
    },
    {
        icon: FiHeart,
        title: "Ethical & Fair Trade Sourcing",
        description: "Empowering local herbal farmers with fair-trade pricing and sustainable botanical cultivation practices.",
    },
    {
        icon: FiLayers,
        title: "Eco-Conscious Packaging",
        description: "Committed to recyclable, food-grade packaging that protects fresh herb potency while safeguarding the earth.",
    },
];

const herbalSteps = [
    {
        number: "01",
        title: "Wild & Organic Harvest",
        description: "Hand-picking seasonal herbs at peak bio-active potency from pristine natural habitats.",
        icon: FiSun,
    },
    {
        number: "02",
        title: "Traditional Processing",
        description: "Cold-shredding & gentle shade-drying to preserve delicate nutrients, essential oils, and enzymes.",
        icon: FiLayers,
    },
    {
        number: "03",
        title: "Strict Quality Analysis",
        description: "Comprehensive lab verification checking for purity, zero synthetic fillers, and micro-contaminants.",
        icon: FiSearch,
    },
    {
        number: "04",
        title: "Airtight Fresh Sealed",
        description: "Freshly packaged in eco-safe jars to ensure long shelf life and therapeutic-grade potency.",
        icon: FiPackage,
    },
];

const stats = [
    { value: "50,000+", label: "Happy Customers Nationwide" },
    { value: "100%", label: "Pure & Organic Ingredients" },
    { value: "15+ Years", label: "Ayurvedic Botanical Expertise" },
    { value: "4.9 / 5.0", label: "Average Customer Rating" },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28 lg:pt-48">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-light)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] shadow-sm">
                            🌿 Our Heritage & Mission
                        </span>

                        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl leading-tight">
                            Rooted in Nature, Driven by <span className="text-[var(--primary)]">Pure Ayurvedic Purity</span>
                        </h1>

                        <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed">
                            Vanodhan Herbs was founded on a simple pledge: to bring back authentic, unadulterated botanical wellness remedies straight from nature to your daily life.
                        </p>
                    </div>

                    {/* Stats Counter */}
                    <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8">
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_8px_25px_var(--shadow)] transition-all duration-300 hover:-translate-y-1"
                            >
                                <p className="text-3xl font-extrabold text-[var(--primary)] sm:text-4xl">
                                    {stat.value}
                                </p>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story & Heritage Section */}
            <section className="py-20 bg-[var(--surface)]/50 border-y border-[var(--border)]">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                                The Vanodhan Story
                            </span>

                            <h2 className="mt-3 text-3xl font-extrabold text-[var(--text)] sm:text-4xl leading-tight">
                                Synthesizing Ancient Herbal Wisdom with Modern Quality Standards
                            </h2>

                            <p className="mt-6 text-base text-[var(--text-secondary)] leading-relaxed">
                                In an era of mass-processed synthetic supplements, Vanodhan Herbs stands for authentic simplicity. We source wild-crafted, organically grown herbs from pristine agricultural belts in Wardha and across India.
                            </p>

                            <p className="mt-4 text-base text-[var(--text-secondary)] leading-relaxed">
                                Every powder, churna, and botanical formulation in our collection is processed using gentle cold-milling and traditional sun-drying methods, safeguarding vital phytochemicals, natural color, and therapeutic aroma.
                            </p>

                            <div className="mt-8 space-y-3">
                                {[
                                    "No synthetic fillers, chemical binders, or artificial fragrances",
                                    "Traditional Ayurvedic formulation compliance",
                                    "Direct farm partnerships supporting ethical growers",
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <FiCheckCircle className="shrink-0 text-[var(--primary)]" size={20} />
                                        <span className="text-sm font-semibold text-[var(--text)]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-12 shadow-[0_15px_45px_var(--shadow)]">
                            <div className="absolute inset-0 bg-[var(--primary)] opacity-10" />
                            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />
                            <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />

                            <div className="relative z-10 space-y-6">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-lg">
                                    <FiAward size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text)]">
                                    Our Uncompromising Quality Promise
                                </h3>
                                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                                    &ldquo;We never compromise on purity. If a botanical harvest does not satisfy our stringent potency and cleanliness standards, it never enters our inventory.&rdquo;
                                </p>
                                <div className="pt-4 border-t border-[var(--border)]">
                                    <p className="text-sm font-bold text-[var(--text)]">Vanodhan Herbal Research Team</p>
                                    <p className="text-xs text-[var(--primary)] font-semibold">Wardha, Maharashtra, India</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 bg-[var(--bg)]">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                            What Guides Us
                        </span>
                        <h2 className="mt-3 text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
                            Our Core Botanical Pillars
                        </h2>
                        <p className="mt-4 text-base text-[var(--text-secondary)]">
                            These core values guide every harvest, formulation, and package we deliver to your doorstep.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {coreValues.map((value, idx) => {
                            const IconComponent = value.icon;
                            return (
                                <div
                                    key={idx}
                                    className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_8px_25px_var(--shadow)] transition-all duration-300 hover:-translate-y-2 hover:border-[var(--primary)]"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md transition-transform group-hover:scale-110">
                                        <IconComponent size={24} />
                                    </div>
                                    <h3 className="mt-6 text-xl font-bold text-[var(--text)]">{value.title}</h3>
                                    <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* The 4-Step Herbal Journey */}
            <section className="py-20 bg-[var(--surface)]/50 border-t border-[var(--border)]">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                            From Farm to Home
                        </span>
                        <h2 className="mt-3 text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
                            Our 4-Step Process for Herbal Purity
                        </h2>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {herbalSteps.map((step, index) => {
                            const IconComp = step.icon;
                            return (
                                <div
                                    key={index}
                                    className="relative rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-8 shadow-sm transition-all duration-300 hover:shadow-md"
                                >
                                    <span className="text-4xl font-extrabold text-[var(--primary)]/30 font-mono">
                                        {step.number}
                                    </span>
                                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                                        <IconComp size={22} />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-[var(--text)]">{step.title}</h3>
                                    <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-20 bg-[var(--bg)]">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 sm:p-16 text-center shadow-[0_15px_45px_var(--shadow)]">
                        <div className="absolute inset-0 bg-[var(--primary)] opacity-10" />
                        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />
                        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl text-[var(--text)] leading-tight">
                                Experience the Power of Pure Herbal Remedies
                            </h2>
                            <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
                                Browse our full collection of authentic Ayurvedic powders, churnas, and botanical blends crafted for vibrant health.
                            </p>

                            <div className="mt-10 flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-3 rounded-full bg-[var(--primary)] px-8 py-4 font-bold text-white shadow-lg transition hover:bg-[var(--primary-hover)] hover:-translate-y-1"
                                >
                                    Explore Herbal Shop
                                    <FiArrowRight size={18} />
                                </Link>

                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-3 rounded-full border border-[var(--primary)] bg-transparent px-8 py-4 font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
