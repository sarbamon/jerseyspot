"use client";

import { useState, useEffect } from "react";
import { getMyOrders, getAds } from "@/lib/api";
import Link from "next/link";
import { Package } from "lucide-react";
import { useStore } from "@/components/StoreProvider";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { isInitialized, isAuthenticated, showLoginModal } = useStore();

  useEffect(() => {
    if (adsList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [adsList]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setError("Please login to view your orders.");
      setLoading(false);
      showLoginModal();
      return;
    }
    
    if (isInitialized && isAuthenticated) {
      fetchData();
    }
  }, [isInitialized, isAuthenticated, showLoginModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, adsData] = await Promise.all([
        getMyOrders(true),
        getAds(true)
      ]);
      
      if (ordersData.orders) setOrders(ordersData.orders);
      if (adsData.ads && adsData.ads.length > 0) {
        setAdsList(adsData.ads);
      }
      
    } catch (err: any) {
      console.error("Failed to fetch user orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white px-5 text-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </main>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-5 text-black">
        <h1 className="mb-4 font-serif text-3xl font-bold">My Orders</h1>
        <p className="text-gray-500 mb-6">{error || "Please log in"}</p>
        <Link href="/shop" className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-900">
          CONTINUE SHOPPING
        </Link>
      </main>
    );
  }

  const filteredOrders = orders.filter((order: any) => {
    // Search by Order ID or Product Name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const idMatch = order._id.toLowerCase().includes(term);
      const nameMatch = order.orderItems?.some((item: any) => item.name?.toLowerCase().includes(term));
      if (!idMatch && !nameMatch) return false;
    }
    const isDelivered = order.deliveryStatus === "Delivered" || order.isDelivered;
    if (activeTab === "active" && isDelivered) return false;
    if (activeTab === "history" && !isDelivered) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm flex items-center gap-4">
        <Link href="/account" className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 flex-1">My Orders</h1>
      </div>

      <div className="mx-auto max-w-2xl pb-20 pt-4">
        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative flex items-center w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text"
              placeholder="Search your order or product here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Promotional Banner Slideshow (below search) */}
        {adsList.length > 0 && (
          <div className="px-4 mb-4">
            <div className="relative h-[120px] w-full overflow-hidden rounded-xl bg-black group shadow-sm">
              {/* Ad Label in Top Right Corner */}
              <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 shadow-sm pointer-events-none uppercase tracking-wider">
                Ad
              </div>

              {/* Slides */}
              {adsList.map((adItem: any, idx: number) => (
                <Link 
                  href={adItem.link || "#"} 
                  key={adItem._id || idx} 
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentAdIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'}`}
                >
                  <img 
                    src={adItem.imageUrl} 
                    alt={adItem.name || "Ad"} 
                    className="h-full w-full object-cover"
                  />
                </Link>
              ))}

              {/* Navigation Indicators */}
              {adsList.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                  {adsList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAdIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentAdIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex gap-2 px-4 mb-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("all")}
            className={`shrink-0 rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-black text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab("active")}
            className={`shrink-0 rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-black text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`shrink-0 rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-black text-white' : 'border border-gray-300 bg-white text-gray-700'}`}
          >
            Delivered
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Package size={48} className="mb-4 text-gray-300" />
            <h2 className="mb-2 text-lg font-bold text-gray-900">No orders found</h2>
            <p className="text-sm text-gray-500">You don't have any matching orders.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredOrders.map((order: any) => {
              const mainItem = order.orderItems[0] || {};
              const isCancelled = order.deliveryStatus === "Cancelled" || order.isCancelled;
              const isDelivered = order.deliveryStatus === "Delivered" || order.isDelivered;
              const badgeStyle = isCancelled 
                ? "bg-red-50 text-red-600 border border-red-200" 
                : isDelivered 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : order.isPaid 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "bg-gray-50 text-gray-700 border border-gray-200";

              const statusText = isCancelled 
                ? "Cancelled" 
                : order.deliveryStatus || (isDelivered ? "Delivered" : order.isPaid ? "Order Received" : "Payment Pending");

              return (
                <Link 
                  href={`/orders/${order._id}`} 
                  key={order._id} 
                  className="flex items-center gap-4 border-b border-gray-200 bg-white p-4 active:bg-gray-50 transition-colors"
                >
                  {/* Image */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 p-2">
                    <img 
                      src={mainItem.image || "/placeholder.png"} 
                      alt={mainItem.name || "Product"} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-center min-w-0 pr-2">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {mainItem.name || "Jersey Order"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Size: {mainItem.size || "S"} • Qty: {mainItem.quantity || 1}
                      {order.orderItems?.length > 1 ? ` (+${order.orderItems.length - 1} more)` : ''}
                    </p>
                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle}`}>
                        {statusText}
                      </span>
                      {isCancelled && order.cancelReason && (
                        <span className="text-[10px] text-red-600 font-medium line-clamp-1">
                          Reason: {order.cancelReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-gray-400 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
