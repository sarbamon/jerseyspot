"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { useEffect } from "react";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isInitialized,
    isAuthenticated,
    showLoginModal,
  } = useStore();

  // No forced login on cart page; users can view cart as guests.

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-white px-5 py-20 text-center text-black">
        <h1 className="font-serif text-4xl font-bold">
          Your Cart
        </h1>

        <p className="mt-4 text-gray-500">
          Your cart is empty.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block bg-black px-8 py-4 text-sm font-bold tracking-wider text-[#f4c84a]"
        >
          CONTINUE SHOPPING
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">

        <h1 className="font-serif text-4xl font-bold">
          Your Cart
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_350px]">

          {/* ITEMS */}

          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={`${item._id}-${item.size}`}
                className="flex gap-4 border-b pb-6"
              >
                <div className="relative h-32 w-24 shrink-0 bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-serif font-bold hover:underline"
                  >
                    {item.name}
                  </Link>

                  <p className="mt-1 text-sm text-gray-500">
                    Size: {item.size}
                  </p>

                  <p className="mt-2 font-bold">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-auto flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      className="h-8 w-8 border"
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          item.size,
                          item.quantity + 1
                        )
                      }
                      className="h-8 w-8 border"
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeFromCart(
                          item._id,
                          item.size
                        )
                      }
                      className="ml-auto"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}

          <div className="h-fit border p-6">
            <h2 className="font-serif text-xl font-bold">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between">
              <span>Subtotal</span>

              <span className="font-bold">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>

            <Link
              href="/checkout"
              className="mt-6 block bg-black px-6 py-4 text-center text-sm font-bold tracking-wider text-[#f4c84a]"
            >
              PROCEED TO CHECKOUT
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}