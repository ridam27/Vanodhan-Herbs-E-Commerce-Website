"use client";

import { useState } from "react";
import { FiShare2, FiCopy } from "react-icons/fi";

export default function ProductShare({ product }) {
    const [copied, setCopied] = useState(false);

    const productUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/shop/${product.slug}`
            : "";

    const shareText = `Check out ${product.name} from Vanodhan Herbs`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: product.name,
                text: shareText,
                url: productUrl,
            });

            return;
        }

        await navigator.clipboard.writeText(productUrl);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-4 font-semibold text-[var(--text)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
            <FiShare2 size={18} />

            <span className="hidden min-[768px]:inline">
                Share
            </span>
        </button>
    );
}