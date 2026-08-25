"use client";

import { Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  StoreProduct,
  useStore,
} from "./StoreProvider";

export default function ProductActions({
  product,
}: {
  product: StoreProduct & {
    stock: number;
  };
}) {
  const router = useRouter();

  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    isAuthenticated,
    showLoginModal,
  } = useStore();

  const [selectedSize, setSelectedSize] =
    useState(product.sizes[0] || "");

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart(product, selectedSize);

    router.push("/cart");
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart(product, selectedSize);

    router.push("/checkout");
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }
    toggleWishlist(product);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Jersey Spot!`,
          url: url,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      {/* SIZE */}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold">
            SELECT SIZE
          </span>

          <button className="text-xs underline">
            Size Guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`border px-6 py-3 text-sm font-semibold transition ${
                selectedSize === size
                  ? "border-black bg-black text-white"
                  : "border-gray-300 hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* STOCK */}

      <div className="mt-6 text-sm">
        {product.stock > 0 ? (
          <span className="text-green-700">
            In stock
          </span>
        ) : (
          <span className="text-red-600">
            Out of stock
          </span>
        )}
      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="flex-1 bg-black px-6 py-4 text-sm font-bold tracking-[0.15em] text-[#f4c84a] transition hover:bg-[#f4c84a] hover:text-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          ADD TO CART
        </button>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className={`flex h-[52px] w-[52px] items-center justify-center border transition ${
            wishlisted
              ? "border-black bg-black text-[#f4c84a]"
              : "border-black text-black hover:bg-black hover:text-[#f4c84a]"
          }`}
        >
          <Heart
            size={21}
            strokeWidth={1.5}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share product"
          className="flex h-[52px] w-[52px] items-center justify-center border border-black text-black transition hover:bg-black hover:text-[#f4c84a]"
        >
          <Share2 size={21} strokeWidth={1.5} />
        </button>
      </div>

      {/* BUY NOW */}

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={product.stock <= 0}
        className="mt-3 w-full border border-black px-8 py-4 text-sm font-bold tracking-[0.15em] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
      >
        BUY IT NOW
      </button>
    </>
  );
}