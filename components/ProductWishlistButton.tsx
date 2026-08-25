"use client";

import { Heart } from "lucide-react";
import { useStore, StoreProduct } from "@/components/StoreProvider";

export default function ProductWishlistButton({ product }: { product: StoreProduct }) {
  const { isWishlisted, toggleWishlist, isAuthenticated, showLoginModal } = useStore();
  const wishlisted = isWishlisted(product._id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }
    toggleWishlist(product);
  };

  return (
    <button
      onClick={handleClick}
      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110 sm:h-9 sm:w-9"
      aria-label="Toggle wishlist"
    >
      <Heart
        size={16}
        className={wishlisted ? "text-red-500" : "text-gray-400"}
        fill={wishlisted ? "currentColor" : "none"}
        strokeWidth={wishlisted ? 0 : 2}
      />
    </button>
  );
}
