import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import FaqAccordion from "@/components/FaqAccordion";
import { FiPhone, FiMail, FiMapPin, FiClock, FiMessageCircle, FiMap, FiShield, FiHeadphones, FiList } from "react-icons/fi";

export const metadata = {
    title: "Contact Us | Vanodhan Herbs - Ayurvedic Wellness & Customer Care",
    description: "Get in touch with Vanodhan Herbs for product inquiries, herbal usage guidance, order support, and wholesale partnerships. We are here to support your natural wellness journey.",
};

const faqData = [
    {
        question: "How can I check the delivery status of my order?",
        answer: "Once your order is dispatched, you will receive an SMS and email notification with your live tracking number. You can also view live tracking updates by logging into your Vanodhan Herbs account under the 'Orders' section."
    },
    {
        question: "Are Vanodhan Herbs products 100% natural and certified?",
        answer: "Yes, all our herbal powders, churnas, and oils are 100% pure, organically harvested, and free from added synthetic preservatives, artificial colors, or heavy metals. Every batch undergoes rigorous quality testing."
    },
    {
        question: "How should I store my herbal powders and formulations?",
        answer: "Keep your herbal products in a cool, dry place away from direct sunlight. Ensure the airtight seal or jar lid is closed tightly after every use to preserve active botanical potency and fresh aroma."
    },
    {
        question: "Do you offer wholesale or bulk ordering for Ayurvedic practitioners?",
        answer: "Yes! We partner with wellness centers, Ayurvedic clinics, and retailers across India. Please select 'Wholesale & Bulk Orders' in the contact form or email us directly at vanodhanherbs@gmail.com with your requirements."
    },
    {
        question: "What is your return and refund policy?",
        answer: "If you receive a damaged, tampered, or incorrect package, please contact us within 48 hours of delivery with photos or video of the item. We will promptly process a free replacement or full refund."
    }
];

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-24 lg:pt-48">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-light)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] shadow-sm">
                            <FiHeadphones className="animate-pulse" /> Customer Care & Support
                        </span>

                        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl">
                            We&apos;re Here for Your <span className="text-[var(--primary)]">Wellness Journey</span>
                        </h1>

                        <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed">
                            Have questions about our authentic Ayurvedic formulations, order delivery, or dosage guidance? Our dedicated herbal experts are eager to help.
                        </p>

                        <div className="mt-8 flex justify-center">
                            <Link
                                href="/contact/tickets"
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)] bg-[var(--primary-light)] px-6 py-3 text-sm font-bold text-[var(--primary)] shadow-sm transition-all hover:bg-[var(--primary)] hover:text-white hover:scale-105"
                            >
                                <FiList size={18} />
                                <span>Track My Support Tickets</span>
                            </Link>
                        </div>
                    </div>

                    {/* Contact Channels Grid */}
                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Call / WhatsApp */}
                        <a
                            href="tel:+919975226220"
                            className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)]"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md transition-transform group-hover:scale-110">
                                <FiPhone size={24} />
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-[var(--text)]">Call / WhatsApp</h3>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">Instant help for order updates</p>
                            <p className="mt-4 text-base font-semibold text-[var(--primary)]">+91 99752 26220</p>
                        </a>

                        {/* Email Support */}
                        <a
                            href="mailto:vanodhanherbs@gmail.com"
                            className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)]"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md transition-transform group-hover:scale-110">
                                <FiMail size={24} />
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-[var(--text)]">Email Support</h3>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">For queries & bulk orders</p>
                            <p className="mt-4 text-sm font-semibold text-[var(--primary)] truncate">vanodhanherbs@gmail.com</p>
                        </a>

                        {/* Office & Farm Location */}
                        <div className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)]">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md transition-transform group-hover:scale-110">
                                <FiMapPin size={24} />
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-[var(--text)]">Our Location</h3>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">Headquarters & Store</p>
                            <p className="mt-4 text-xs font-medium text-[var(--text)] leading-relaxed">
                                760, Uttam Town, Inzapur, Wardha - 442001
                            </p>
                        </div>

                        {/* Working Hours */}
                        <div className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_25px_var(--shadow)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)]">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md transition-transform group-hover:scale-110">
                                <FiClock size={24} />
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-[var(--text)]">Support Hours</h3>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">Mon – Sat Working</p>
                            <p className="mt-4 text-sm font-semibold text-[var(--primary)]">9:00 AM – 7:00 PM IST</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form & Live Support Tickets Section */}
            <ContactSection />

            {/* FAQs Section */}
            <section className="py-20 bg-[var(--surface)]/50 border-y border-[var(--border)]">
                <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Got Questions?</span>
                        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
                            Frequently Asked Questions
                        </h2>
                        <p className="mt-3 text-base text-[var(--text-secondary)]">
                            Quick answers to common questions about our herbal formulations, shipping, and return policies.
                        </p>
                    </div>

                    <FaqAccordion items={faqData} />
                </div>
            </section>

            {/* Map & Location Directions Card */}
            <section className="py-20 bg-[var(--bg)]">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-12 shadow-[0_12px_35px_var(--shadow)]">
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                            <div>
                                <span className="inline-block rounded-full bg-[var(--primary-light)] px-4 py-1 text-xs font-bold text-[var(--primary)]">
                                    Visit Store & HQ
                                </span>
                                <h2 className="mt-4 text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
                                    Vanodhan Herbs Location
                                </h2>
                                <p className="mt-4 text-base text-[var(--text-secondary)] leading-relaxed">
                                    Experience authentic herbal wellness products in person. Visit our store in Wardha for fresh product batches and herbal consultations.
                                </p>
                                <p className="mt-4 text-sm font-semibold text-[var(--text)]">
                                    📍 760, Uttam Town, Inzapur, Dist. Wardha - 442001, Maharashtra, India
                                </p>

                                <a
                                    href="https://maps.app.goo.gl/KFVRXwwjCvU18DAV6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 inline-flex items-center gap-3 rounded-full bg-[var(--primary)] px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-[var(--primary-hover)] hover:shadow-xl"
                                >
                                    <FiMap size={18} />
                                    Get Directions on Google Maps
                                </a>
                            </div>

                            <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center text-center p-6 shadow-[0_15px_45px_var(--shadow)]">
                                <div className="absolute inset-0 bg-[var(--primary)] opacity-10" />
                                <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />
                                <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />

                                <div className="relative z-10 flex flex-col items-center">
                                    <FiMapPin className="text-[var(--primary)] animate-bounce mb-3" size={48} />
                                    <h3 className="text-xl font-bold text-[var(--text)]">Wardha Herbal Hub</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs">
                                        760, Uttam Town, Inzapur, Wardha, Maharashtra
                                    </p>
                                    <span className="mt-4 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-light)] px-4 py-1.5 text-xs font-semibold text-[var(--primary)]">
                                        Store Open: 9:00 AM - 7:00 PM
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
