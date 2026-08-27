"use client";

import { useState } from "react";
import { FiSend, FiCheckCircle, FiUser, FiMail, FiPhone, FiTag, FiMessageSquare } from "react-icons/fi";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        inquiryType: "General Inquiry",
        subject: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate network API request delay
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                inquiryType: "General Inquiry",
                subject: "",
                message: "",
            });
        }, 1200);
    };

    return (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-[0_10px_30px_var(--shadow)]">
            {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-6">
                        <FiCheckCircle size={44} />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text)]">
                        Thank You for Reaching Out!
                    </h3>
                    <p className="mt-3 max-w-md text-base text-[var(--text-secondary)] leading-relaxed">
                        Your message has been successfully received by our herbal specialists. We will reply to your email within 24 business hours.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3.5 font-semibold text-white transition hover:bg-[var(--primary-hover)] shadow-md"
                    >
                        Send Another Message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>

                        {/* Inquiry Category */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                                Inquiry Category <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <select
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 pl-11 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] appearance-none cursor-pointer"
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Order Status & Shipping">Order Status & Shipping</option>
                                    <option value="Herbal Usage Advice">Herbal Product & Usage Advice</option>
                                    <option value="Wholesale & Bulk Orders">Wholesale & Bulk Orders</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="How can we assist you?"
                            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3.5 px-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                            Your Message <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="message"
                                required
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Describe your question, concern, or product requirement..."
                                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--primary)] py-4 px-8 font-semibold text-white transition-all hover:bg-[var(--primary-hover)] disabled:opacity-70 shadow-lg hover:shadow-xl"
                    >
                        {isSubmitting ? (
                            <span>Sending message...</span>
                        ) : (
                            <>
                                <FiSend size={18} />
                                <span>Send Message</span>
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
