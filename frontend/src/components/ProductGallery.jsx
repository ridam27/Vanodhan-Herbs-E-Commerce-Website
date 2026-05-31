"use client";

import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ProductGallery({ images = [], name }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedImage = images[selectedIndex] || images[0];

    const goToPreviousImage = () => {
        setSelectedIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const goToNextImage = () => {
        setSelectedIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    let touchStartX = 0;

    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const difference = touchStartX - touchEndX;

        if (difference > 50) {
            goToNextImage();
        }

        if (difference < -50) {
            goToPreviousImage();
        }
    };

    return (
        <div className="self-start">
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative overflow-hidden rounded-[2rem]"
                style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 25px var(--shadow)",
                }}
            >
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPreviousImage}
                            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 sm:left-4 sm:h-11 sm:w-11"
                        >
                            <FiChevronLeft size={22} />
                        </button>

                        <button
                            onClick={goToNextImage}
                            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 sm:right-4 sm:h-11 sm:w-11"
                        >
                            <FiChevronRight size={22} />
                        </button>
                    </>
                )}

                <img
                    src={selectedImage}
                    alt={name}
                    className="block w-full object-contain"
                />
            </div>

            {images.length > 1 && (
                <div className="mt-4 mb-4 flex justify-center gap-2 sm:gap-3">
                    {images.map((image, index) => (
                        <button
                            key={`${image}-${index}`}
                            onClick={() => setSelectedIndex(index)}
                            className="overflow-hidden rounded-xl border p-1 transition-all duration-300 hover:-translate-y-1"
                            style={{
                                width: "56px",
                                height: "56px",
                                backgroundColor: "var(--surface)",
                                borderColor:
                                    selectedIndex === index
                                        ? "var(--primary)"
                                        : "var(--border)",
                            }}
                        >
                            <img
                                src={image}
                                alt={`${name} ${index + 1}`}
                                className="h-full w-full rounded-lg object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}