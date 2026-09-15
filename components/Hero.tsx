"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  // Build slide array from props or defaults
  const slideImages =
    images && images.length > 0
      ? images
      : image
      ? [image]
      : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 3 seconds (3000ms)
  useEffect(() => {
    if (slideImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 3000);

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
      <div className="relative aspect-[16/9] w-full sm:aspect-[1920/850] sm:min-h-[500px]">
        {slideImages.map((src, index) => (
          <div
            key={src + index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={src}
              alt={title || `Jersey Spot Hero ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}

        {/* CONTROLS: PREV / NEXT ARROWS */}
        {slideImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Previous Slide"
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next Slide"
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* SLIDE INDICATORS (DOTS) */}
        {slideImages.length > 1 && (
          <div className="absolute bottom-[7%] left-[8%] z-20 flex items-center gap-2 sm:bottom-[9%] lg:bottom-[10%]">
            {slideImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-[#f4c84a]"
                    : "w-2 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}

        {/* SHOP NOW BUTTON */}
        <div className="absolute bottom-[7%] right-[8%] z-20 sm:bottom-[9%] lg:bottom-[10%]">
          <a
            href="/shop"
            className="inline-flex min-h-[40px] items-center justify-center bg-[#f4c84a] px-5 py-2 font-serif text-xs font-bold text-black transition hover:bg-[#ffd96a] sm:min-h-[48px] sm:px-8 sm:py-3 sm:text-base lg:px-10 lg:py-4 lg:text-lg shadow-lg"
          >
            SHOP NOW
          </a>
        </div>
      </div>
    </section>
  );
}