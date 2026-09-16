"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroProps {
  image?: string;
  images?: string[];
  title?: string;
  subtitle?: string;
}

const defaultSlides = [
  "/images/hero1.jpg",
  "/images/hero.jpg",
  "/images/banners/customized.jpg",
  "/images/banners/promo.jpg",
];

export default function Hero({ image, images, title }: HeroProps) {
  // Filter provided images from settings
  const customSlides = (
    images && images.length > 0
      ? images
      : image
      ? [image]
      : []
  ).filter((src) => typeof src === "string" && src.trim() !== "");

  // Use custom settings images if available; fallback to default slides if settings are empty
  const slideImages = customSlides.length > 0 ? customSlides : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds (5000ms)
  useEffect(() => {
    if (slideImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slideImages.length]);

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slideImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
  };

  return (
    <section className="group relative w-full overflow-hidden bg-black">
      <div className="relative aspect-[1920/850] w-full min-h-[160px] sm:min-h-[450px]">
        {slideImages.map((src, index) => (
          <div
            key={src + index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Link href="/shop" className="relative block h-full w-full">
              <Image
                src={src}
                alt={title || `Jersey Spot Hero ${index + 1}`}
                fill
                priority={index === 0}
                quality={100}
                unoptimized
                sizes="100vw"
                className="object-cover object-center"
              />
            </Link>
          </div>
        ))}

        {/* CONTROLS: PREV / NEXT ARROWS */}
        {slideImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Previous Slide"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70 sm:left-4 sm:p-2"
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next Slide"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70 sm:right-4 sm:p-2"
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* SLIDE INDICATORS (DOTS) */}
        {slideImages.length > 1 && (
          <div className="absolute bottom-[4%] left-[5%] z-20 flex items-center gap-1.5 sm:bottom-[9%] sm:left-[8%] sm:gap-2 lg:bottom-[10%]">
            {slideImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                  idx === currentIndex
                    ? "w-5 bg-[#f4c84a] sm:w-8"
                    : "w-1.5 bg-white/50 hover:bg-white sm:w-2"
                }`}
              />
            ))}
          </div>
        )}

        {/* SHOP NOW BUTTON */}
        <div className="absolute bottom-[4%] right-[5%] z-20 sm:bottom-[9%] sm:right-[8%] lg:bottom-[10%]">
          <Link
            href="/shop"
            className="inline-flex min-h-[30px] items-center justify-center bg-[#f4c84a] px-3 py-1 font-serif text-[10px] font-bold text-black transition hover:bg-[#ffd96a] sm:min-h-[48px] sm:px-8 sm:py-3 sm:text-base lg:px-10 lg:py-4 lg:text-lg shadow-lg rounded-sm sm:rounded-none"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </section>
  );
}