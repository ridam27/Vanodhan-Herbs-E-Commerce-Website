"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function FaqAccordion({ items }) {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 shadow-[0_4px_20px_var(--shadow)]"
                    >
                        <button
                            onClick={() => toggleFaq(index)}
                            className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-[var(--bg)]"
                            aria-expanded={isOpen}
                        >
                            <span className="text-lg font-bold text-[var(--text)]">
                                {item.question}
                            </span>
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] transition-transform duration-300 ${
                                    isOpen ? "rotate-180 bg-[var(--primary)] text-white" : ""
                                }`}
                            >
                                <FiChevronDown size={20} />
                            </div>
                        </button>

                        {isOpen && (
                            <div className="border-t border-[var(--border)] px-6 py-5 text-[var(--text-secondary)] leading-relaxed text-base bg-[var(--surface)]">
                                {item.answer}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
