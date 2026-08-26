"use client";

import { useStore } from "@/components/StoreProvider";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default function CouponsPage() {
  const { isAuthenticated, isInitialized, showLoginModal } = useStore();

  if (isInitialized && !isAuthenticated) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-5 text-black">
        <h1 className="mb-4 font-serif text-3xl font-bold">My Coupons</h1>
        <p className="text-gray-500 mb-6">Please log in to view your coupons.</p>
        <button onClick={showLoginModal} className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-900">
          LOGIN
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="font-serif text-3xl font-black tracking-widest text-black">
            MY COUPONS
          </h1>
          <Link
            href="/account"
            className="mt-4 sm:mt-0 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-black"
          >
            Back to Account
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Ticket size={48} className="mb-4 text-gray-400" />
          <h2 className="mb-2 text-xl font-bold">No active coupons</h2>
          <p className="mb-6 text-gray-500">Check back later for exclusive discount codes and offers.</p>
          <Link href="/shop" className="bg-black px-8 py-3 font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-800">
            START SHOPPING
          </Link>
        </div>
      </div>
    </main>
  );
}
