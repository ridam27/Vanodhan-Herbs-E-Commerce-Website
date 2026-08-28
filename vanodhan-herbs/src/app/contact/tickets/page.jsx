import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserSupportTickets from "@/components/UserSupportTickets";
import Link from "next/link";
import { FiArrowLeft, FiMessageSquare, FiHeadphones } from "react-icons/fi";

export const metadata = {
    title: "My Support Tickets | Vanodhan Herbs Customer Care",
    description: "Track your past support queries, live resolution status, and responses from our Vanodhan Herbs specialist team.",
};

export default function MySupportTicketsPage() {
    return (
        <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            <section className="pt-36 pb-16 sm:pt-44 sm:pb-20 lg:pt-48">
                <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
                    {/* Navigation Back & Header */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-sm"
                        >
                            <FiArrowLeft size={16} />
                            Back to Contact Form
                        </Link>

                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-light)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] shadow-sm">
                            <FiHeadphones /> Ticket History
                        </span>
                    </div>

                    <div className="mb-10 text-center sm:text-left">
                        <h1 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl lg:text-5xl">
                            My Support <span className="text-[var(--primary)]">Tickets & Inquiries</span>
                        </h1>
                        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                            View the live status of your submitted support queries, track progress, and read official replies from our herbal specialists.
                        </p>
                    </div>

                    {/* Dedicated Support Tickets Component */}
                    <UserSupportTickets />
                </div>
            </section>

            <Footer />
        </main>
    );
}
