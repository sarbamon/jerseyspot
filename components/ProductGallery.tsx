"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name, discount }: { images: string[], name: string, discount: number }) {
  // Ensure we have at least one image
  const validImages = images && images.length > 0 ? images : ["/images/products/placeholder.jpg"];
  const [mainImage, setMainImage] = useState(validImages[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {discount > 0 && (
          <span className="absolute left-4 top-4 bg-black px-3 py-2 text-xs font-bold tracking-wider text-[#f4c84a]">
            {discount}% OFF
          </span>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`relative aspect-[3/4] overflow-hidden bg-gray-100 transition-all ${mainImage === img ? 'ring-2 ring-black' : 'opacity-70 hover:opacity-100'}`}
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
  );
}
