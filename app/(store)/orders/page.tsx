"use client";

import { useState, useEffect } from "react";
import { getMyOrders, getAds } from "@/lib/api";
import Link from "next/link";
import { Package } from "lucide-react";
import { useStore } from "@/components/StoreProvider";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { isInitialized, isAuthenticated, logout, showLoginModal, user } = useStore();

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
        getAds(true, "orders_top")
      ]);
      
      if (ordersData.orders) setOrders(ordersData.orders);
      if (adsData.ads && adsData.ads.length > 0) setAd(adsData.ads[0]);
      
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
    // Basic search
    if (searchTerm && !order._id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
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
        <div className="flex items-center gap-4 text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
      </div>

      <div className="mx-auto max-w-2xl pb-20">
        {/* Promotional Banner */}
        {ad && (
          <div className="p-4">
            <Link href={ad.link || "#"} className="block relative h-[120px] w-full overflow-hidden rounded-xl bg-black">
              <img 
                src={ad.imageUrl} 
                alt={ad.name} 
                className="h-full w-full object-cover"
              />
            </Link>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative flex items-center w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text"
              placeholder="Search your order here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
            <div className="ml-auto flex items-center gap-1 border-l pl-2 text-gray-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <span className="text-xs font-medium">Filters</span>
            </div>
          </div>
        </div>

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
              const isDelivered = order.deliveryStatus === "Delivered" || order.isDelivered;
              const statusColor = isDelivered ? "text-green-600" : order.isPaid ? "text-green-600" : "text-red-500";
              const statusText = isDelivered 
                ? `Delivered on ${new Date(order.deliveredAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
                : order.deliveryStatus === "Out for Delivery" 
                  ? "Arriving today (12:00 AM - 11:59 PM)"
                  : order.isPaid 
                    ? `Delivery expected by ${new Date(new Date(order.createdAt).getTime() + 5*24*60*60*1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : "Order Not Placed";

              const subText = order.isPaid 
                ? (order.deliveryStatus || "Your order is being processed")
                : "Payment not successful. Please contact your bank for any money deducted.";

              return (
                <Link 
                  href={`/orders/${order._id}`} 
                  key={order._id} 
                  className="flex items-center gap-4 border-b border-gray-200 bg-white p-4 active:bg-gray-50"
                >
                  {/* Image */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 p-2">
                    <img 
                      src={mainItem.image || "/placeholder.png"} 
                      alt={mainItem.name} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-center">
                    <div className={`text-sm font-semibold ${statusColor}`}>
                      {statusText}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                      {subText}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-gray-400">
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
