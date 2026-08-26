"use client";

import { useStore } from "@/components/StoreProvider";
import Link from "next/link";
import { Package, Heart, Ticket, Headset, Zap } from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api";

export default function AccountDashboard() {
  const { user, isAuthenticated, isInitialized, showLoginModal, logout } = useStore();
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    async function loadRecs() {
      try {
        const data = await getProducts("?limit=4");
        if (data && data.products) setRecommended(data.products.slice(0, 4));
      } catch (err) {}
    }
    loadRecs();
  }, []);

  if (isInitialized && !isAuthenticated) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-5 text-black">
        <h1 className="mb-4 font-serif text-3xl font-bold">My Account</h1>
        <p className="text-gray-500 mb-6">Please log in to view your account.</p>
        <button onClick={showLoginModal} className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-900">
          LOGIN
        </button>
      </main>
    );
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* HERO SECTION */}
      <div className="bg-white border-b border-gray-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between w-full">
            <h1 className="font-serif text-2xl font-black text-black">
              Hello, {user.name}
            </h1>
            
            <button onClick={() => { logout(); window.location.href="/"; }} className="text-xs font-bold text-red-600 uppercase tracking-wider hover:text-red-700">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* QUICK LINKS GRID */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/orders" className="flex flex-col items-center justify-center gap-3 border border-gray-200 bg-white p-6 shadow-sm hover:border-black transition text-black">
            <Package size={28} strokeWidth={1.5} />
            <span className="font-bold text-sm tracking-wide">Orders</span>
          </Link>
          
          <Link href="/wishlist" className="flex flex-col items-center justify-center gap-3 border border-gray-200 bg-white p-6 shadow-sm hover:border-black transition text-black">
            <Heart size={28} strokeWidth={1.5} />
            <span className="font-bold text-sm tracking-wide">Wishlist</span>
          </Link>
          
          <Link href="/coupons" className="flex flex-col items-center justify-center gap-3 border border-gray-200 bg-white p-6 shadow-sm hover:border-black transition text-black">
            <Ticket size={28} strokeWidth={1.5} />
            <span className="font-bold text-sm tracking-wide">Coupons</span>
          </Link>
          
          <Link href="/contact" className="flex flex-col items-center justify-center gap-3 border border-gray-200 bg-white p-6 shadow-sm hover:border-black transition text-black">
            <Headset size={28} strokeWidth={1.5} />
            <span className="font-bold text-sm tracking-wide">Help Center</span>
          </Link>
        </div>
      </div>

      {/* RECOMMENDED Section */}
      {recommended.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12">
          <h3 className="mb-4 text-sm font-bold text-gray-700">Recommended Jerseys</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recommended.map((product) => (
              <Link key={product._id} href={`/shop/${product.slug}`} className="group block border border-gray-200 bg-white p-4 hover:border-black transition">
                <div className="relative aspect-[3/4] mb-3 bg-gray-100 overflow-hidden">
                  <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <h4 className="text-xs font-bold line-clamp-1">{product.name}</h4>
                <p className="text-xs text-gray-500 mt-1">₹{product.price.toLocaleString("en-IN")}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SPONSORED BANNER */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sponsored-section:has(ins[data-ad-status="unfilled"]) {
          display: none !important;
        }
      `}} />
      <div className="sponsored-section mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <h3 className="mb-4 text-sm font-bold text-gray-700">Sponsored</h3>
        <div className="w-full min-h-[250px] bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
          <Script 
            id="adsbygoogle-init"
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4279196903220340"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          {/* AdSense Ad Unit */}
          <ins className="adsbygoogle"
               style={{ display: 'block', minWidth: '300px', minHeight: '250px' }}
               data-ad-client="ca-pub-4279196903220340"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <Script id="adsbygoogle-push" strategy="lazyOnload">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
        </div>
      </div>
    </main>
  );
}
