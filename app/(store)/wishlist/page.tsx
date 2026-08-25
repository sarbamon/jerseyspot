"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { useEffect } from "react";

export default function WishlistPage() {
  const {
    wishlist,
    toggleWishlist,
    isInitialized,
    isAuthenticated,
    showLoginModal,
  } = useStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      showLoginModal();
    }
  }, [isInitialized, isAuthenticated, showLoginModal]);

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center gap-3">
          <Heart size={25} />

          <h1 className="font-serif text-4xl font-bold">
            Wishlist
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              Your wishlist is empty.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block bg-black px-8 py-4 text-sm font-bold tracking-wider text-[#f4c84a]"
            >
              EXPLORE JERSEYS
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <Link href={`/shop/${product.slug}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <button
                    onClick={() =>
                      toggleWishlist(product)
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white"
                    aria-label="Remove from wishlist"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="pt-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    {product.team}
                  </p>

                  <Link
                    href={`/shop/${product.slug}`}
                    className="mt-1 block font-serif font-bold"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-2 font-bold">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}