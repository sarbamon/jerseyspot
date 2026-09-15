"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export default function ProductGallery({
  images,
  name,
  discount,
}: {
  images: string[];
  name: string;
  discount: number;
}) {
  const validImages = images && images.length > 0 ? images : ["/images/products/placeholder.jpg"];
  const [mainIdx, setMainIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Zoom states
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileZoom, setIsMobileZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const mainImage = validImages[mainIdx];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches || !e.touches[0]) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.touches[0].clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.touches[0].clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxZoom(1);
    setLightbox(true);
  };

  const closeLightbox = () => {
    setLightbox(false);
    setLightboxZoom(1);
  };

  const prev = useCallback(() => {
    setLightboxIdx((i) => (i - 1 + validImages.length) % validImages.length);
    setLightboxZoom(1);
  }, [validImages.length]);

  const next = useCallback(() => {
    setLightboxIdx((i) => (i + 1) % validImages.length);
    setLightboxZoom(1);
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const isZooming = isHovered || isMobileZoom;

  return (
    <>
      {/* ── GALLERY ── */}
      <div className="flex flex-col gap-4">
        {/* Main image container with modern rounded corners & Interactive Magnifier */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsMobileZoom(false);
          }}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsMobileZoom((prev) => !prev)}
          onTouchMove={handleTouchMove}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm cursor-zoom-in group select-none"
        >
          <div
            className="relative h-full w-full transition-transform duration-200 ease-out"
            style={{
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: isZooming ? "scale(2.2)" : "scale(1)",
            }}
          >
            <Image
              src={mainImage}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute left-4 top-4 z-10 rounded-xl bg-black px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#f4c84a] shadow-md">
              {discount}% OFF
            </span>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileZoom((prev) => !prev);
              }}
              className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md shadow-md hover:bg-black transition"
            >
              <ZoomIn size={14} /> {isMobileZoom ? "Reset Zoom" : "Hover / Tap Zoom"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(mainIdx);
              }}
              className="flex items-center justify-center rounded-full bg-black/70 p-2 text-white backdrop-blur-md shadow-md hover:bg-black transition"
              aria-label="Expand image"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Thumbnails with rounded-xl */}
        {validImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMainIdx(idx);
                  setIsMobileZoom(false);
                }}
                className={`relative aspect-[3/4] overflow-hidden rounded-xl border bg-gray-50 transition-all duration-300 ${
                  mainIdx === idx
                    ? "border-black ring-2 ring-black ring-offset-2 scale-[1.02]"
                    : "border-gray-200 opacity-70 hover:opacity-100 hover:scale-[1.01]"
                }`}
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

      {/* ── LIGHTBOX WITH ZOOM CONTROLS ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            {validImages.length > 1 ? (
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                {lightboxIdx + 1} / {validImages.length}
              </span>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom((z) => Math.min(z + 0.5, 3));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom((z) => Math.max(z - 0.5, 1));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Prev */}
          {validImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] h-[85vh] w-[90vw] transition-transform duration-300 ease-out select-none"
            style={{ transform: `scale(${lightboxZoom})` }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={() => setLightboxZoom((z) => (z > 1 ? 1 : 2))}
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-2xl bg-black/60 p-2 backdrop-blur-md">
              {validImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx(idx);
                    setLightboxZoom(1);
                  }}
                  className={`relative h-12 w-12 overflow-hidden rounded-xl transition-all ${
                    lightboxIdx === idx
                      ? "ring-2 ring-[#f4c84a] scale-105"
                      : "opacity-50 hover:opacity-100"
                  }`}
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
