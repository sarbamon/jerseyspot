"use client";

import { Heart, Share2, X } from "lucide-react";
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

  const [selectedSize, setSelectedSize] = useState(() => {
    if (!product.sizes || product.sizes.length === 0) return "";
    const first = product.sizes[0] as any;
    return typeof first === "object" ? first.size : first;
  });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [pinStatus, setPinStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setPinStatus("loading");
    setPinMessage("");
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        setPinStatus("success");
        setPinMessage(`Delivery available to ${data[0].PostOffice[0].District}`);
      } else {
        setPinStatus("error");
        setPinMessage("Invalid pincode or not serviceable.");
      }
    } catch (err) {
      setPinStatus("error");
      setPinMessage("Error checking pincode.");
    }
  };

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

          <button onClick={() => setShowSizeGuide(true)} className="text-xs underline">
            Size Guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s: any) => {
            const sizeName = typeof s === "object" ? s.size : s;
            const sizeStock = typeof s === "object" ? s.stock : 10;
            const isOutOfStock = sizeStock <= 0;

            return (
              <button
                key={sizeName}
                type="button"
                disabled={isOutOfStock}
                onClick={() => setSelectedSize(sizeName)}
                className={`border px-6 py-3 text-sm font-semibold transition ${
                  selectedSize === sizeName
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-black"
                } ${isOutOfStock ? "opacity-30 cursor-not-allowed bg-gray-100" : ""}`}
              >
                {sizeName}
              </button>
            );
          })}
        </div>
        
        {(() => {
          const currentSizeObj = product.sizes.find((s: any) => (typeof s === "object" ? s.size : s) === selectedSize) as any;
          const currentStock = currentSizeObj && typeof currentSizeObj === "object" ? currentSizeObj.stock : 10;
          
          if (currentStock <= 0) {
            return <div className="mt-2 text-xs font-bold text-red-600">Out of stock in this size</div>;
          } else if (currentStock < 5) {
            return <div className="mt-2 text-xs font-bold text-orange-600">Only {currentStock} left!</div>;
          }
          return null;
        })()}
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
        disabled={product.stock <= 0 || (() => {
          const sObj = product.sizes.find((s: any) => (typeof s === 'object' ? s.size : s) === selectedSize) as any;
          return sObj && typeof sObj === 'object' && sObj.stock <= 0;
        })()}
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
        disabled={product.stock <= 0 || (() => {
          const sObj = product.sizes.find((s: any) => (typeof s === 'object' ? s.size : s) === selectedSize) as any;
          return sObj && typeof sObj === 'object' && sObj.stock <= 0;
        })()}
        className="mt-3 w-full border border-black px-8 py-4 text-sm font-bold tracking-[0.15em] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
      >
        BUY IT NOW
      </button>

      {/* PINCODE CHECKER */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-700">Check Delivery Availability</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            placeholder="Enter Pincode"
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
          <button
            onClick={checkPincode}
            disabled={pincode.length !== 6 || pinStatus === 'loading'}
            className="bg-black px-6 py-3 text-sm font-bold text-[#f4c84a] transition hover:bg-gray-900 disabled:opacity-50"
          >
            {pinStatus === 'loading' ? '...' : 'CHECK'}
          </button>
        </div>
        {pinMessage && (
          <p className={`mt-2 text-xs font-bold ${pinStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {pinMessage}
          </p>
        )}
      </div>

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg bg-white p-6 shadow-xl">
            <button onClick={() => setShowSizeGuide(false)} className="absolute right-4 top-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            <h3 className="mb-4 font-serif text-2xl font-bold">Size Guide</h3>
            <div className="overflow-hidden border border-gray-200">
               <img src="/images/size-guide.jpg" alt="Size Guide" className="w-full" onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 document.getElementById('size-table-fallback')?.classList.remove('hidden');
               }} />
               <div id="size-table-fallback" className="hidden w-full overflow-x-auto text-black">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-100">
                     <tr><th className="p-3">Size</th><th className="p-3">Chest (inches)</th><th className="p-3">Length (inches)</th></tr>
                   </thead>
                   <tbody>
                     <tr className="border-t">
                       <td className="p-3 font-bold">S</td><td className="p-3">38"</td><td className="p-3">27"</td>
                     </tr>
                     <tr className="border-t">
                       <td className="p-3 font-bold">M</td><td className="p-3">40"</td><td className="p-3">28"</td>
                     </tr>
                     <tr className="border-t">
                       <td className="p-3 font-bold">L</td><td className="p-3">42"</td><td className="p-3">29"</td>
                     </tr>
                     <tr className="border-t">
                       <td className="p-3 font-bold">XL</td><td className="p-3">44"</td><td className="p-3">30"</td>
                     </tr>
                     <tr className="border-t">
                       <td className="p-3 font-bold">XXL</td><td className="p-3">46"</td><td className="p-3">31"</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}