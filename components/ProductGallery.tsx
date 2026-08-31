"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ProductGallery({ images, name, discount }: { images: string[], name: string, discount: number }) {
  const validImages = images && images.length > 0 ? images : ["/images/products/placeholder.jpg"];
  const [mainIdx, setMainIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const mainImage = validImages[mainIdx];

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightbox(true);
  };

  const closeLightbox = () => setLightbox(false);

  const prev = useCallback(() => {
    setLightboxIdx((i) => (i - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  const next = useCallback(() => {
    setLightboxIdx((i) => (i + 1) % validImages.length);
  }, [validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <>
      {/* ── GALLERY ── */}
      <div className="flex flex-col gap-4">

        {/* Main image — click to open lightbox */}
        <button
          type="button"
          onClick={() => openLightbox(mainIdx)}
          className="group relative aspect-[3/4] w-full overflow-hidden bg-gray-100 cursor-zoom-in"
          aria-label="Open full-screen image"
        >
          <Image
            src={mainImage}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Zoom hint */}
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn size={11} /> VIEW
          </span>

          {discount > 0 && (
            <span className="absolute left-4 top-4 bg-black px-3 py-2 text-xs font-bold tracking-wider text-[#f4c84a]">
              {discount}% OFF
            </span>
          )}
        </button>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIdx(idx)}
                className={`relative aspect-[3/4] overflow-hidden bg-gray-100 transition-all ${mainIdx === idx ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"}`}
              >
                <Image
                  src={img}
                  alt={`${name} thumbnail ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 25vw, 12vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {/* Counter */}
          {validImages.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded bg-black/50 px-3 py-1 text-xs font-bold text-white">
              {lightboxIdx + 1} / {validImages.length}
            </span>
          )}

          {/* Prev */}
          {validImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Image — stop propagation so clicking it doesn't close */}
          <div
            className="relative max-h-[90vh] max-w-[90vw] h-[90vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={validImages[lightboxIdx]}
              alt={`${name} ${lightboxIdx + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Next */}
          {validImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {validImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                  className={`relative h-12 w-12 overflow-hidden rounded transition-all ${lightboxIdx === idx ? "ring-2 ring-white" : "opacity-50 hover:opacity-100"}`}
                >
                  <Image src={img} alt={`thumb ${idx + 1}`} fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
