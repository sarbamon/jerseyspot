"use client";

import { useState, useEffect } from "react";
import { getMyOrderById, getAds } from "@/lib/api";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [ad, setAd] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDelivery, setOpenDelivery] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const { isInitialized, isAuthenticated, showLoginModal } = useStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setError("Please login to view your order.");
      setLoading(false);
      showLoginModal();
      return;
    }

    if (isInitialized && isAuthenticated && orderId) {
      fetchData();
    }
  }, [isInitialized, isAuthenticated, orderId, showLoginModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderData, adsData] = await Promise.all([
        getMyOrderById(orderId, true),
        getAds(true, "orders_bottom")
      ]);

      if (orderData.order) {
        setOrder(orderData.order);
        if (orderData.order.shipmentId) {
          import('@/lib/api').then(m => m.getOrderTracking(orderId))
            .then(res => {
              if (res.tracking) setTrackingData(res.tracking);
            })
            .catch(err => console.error("Tracking fetch error:", err));
        }
      }
      if (adsData.ads && adsData.ads.length > 0) setAd(adsData.ads[0]);

    } catch (err: any) {
      console.error("Failed to fetch order:", err);
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 text-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50 text-black">
        <div className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex-1">Order Details</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-gray-500 mb-6">{error || "Order not found"}</p>
          <Link href="/orders" className="rounded bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-gray-900">
            BACK TO ORDERS
          </Link>
        </div>
      </main>
    );
  }

  const mainItem = order.orderItems[0] || {};

  // Status logic
  const isCancelled = order.isCancelled || order.deliveryStatus === "Cancelled";
  const isDelivered = order.deliveryStatus === "Delivered" || order.isDelivered;
  const isShipped = isDelivered || order.deliveryStatus === "In Transit" || order.deliveryStatus === "Out for Delivery" || order.deliveryStatus === "Near You";
  const isConfirmed = isShipped || order.deliveryStatus === "Processing" || order.deliveryStatus === "Placed" || order.isPaid;

  const currentStep = isDelivered ? 3 : isShipped ? 2 : isConfirmed ? 1 : 0;

  return (
    <main className="min-h-screen bg-gray-100 pb-20 text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1">Order Details</h1>
      </div>

      <div className="mx-auto max-w-2xl mt-2 space-y-2">
        {/* Item Summary */}
        <div className="bg-white p-4 flex gap-4">
          <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-gray-100">
            <img src={mainItem.image || "/placeholder.png"} alt={mainItem.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{mainItem.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Size: {mainItem.size} • Qty: {mainItem.quantity}</p>
          </div>
        </div>

        {/* Order ID */}
        <div className="bg-white px-4 py-3 flex items-center justify-between text-sm text-gray-500">
          <span>Order #{order._id}</span>
          <button className="text-blue-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
        </div>

        {/* Tracking Card */}
        <div className="bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              {isCancelled ? "Cancelled" : isDelivered ? "Delivered" : isShipped ? "Shipped" : "Placed"}
            </h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="m18 15-6-6-6 6" /></svg>
          </div>

          <div className="text-sm text-gray-600 mb-6 flex items-center justify-between">
            {isCancelled ? (
              <span className="text-red-600 font-bold">
                {order.cancelledBy === 'Admin' ? "Cancelled by Agents" : "Cancelled"}
              </span>
            ) : (
              <span>{order.deliveryStatus || "Placed"}</span>
            )}
            {!isCancelled && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">On Time</span>}
          </div>

          {/* Progress Bar */}
          {!isCancelled && (
            <div className="relative mb-8 px-2">
            <div className="absolute top-3 left-[22px] right-[22px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-0"></div>
              <div className="absolute top-0 left-0 h-1 bg-green-600 z-0 transition-all duration-500" style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : currentStep === 3 ? '100%' : '0%' }}></div>
            </div>
            
            <div className="relative z-10 flex justify-between">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 border-2 border-white'}`}>
                  {currentStep >= 1 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span className="text-[10px] mt-2 text-gray-500 text-center w-20">Order Placed<br/>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300'}`}>
                  {currentStep >= 2 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span className="text-[10px] mt-2 text-gray-500 text-center w-20">Shipped</span>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300'}`}>
                  {currentStep >= 3 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span className="text-[10px] mt-2 text-gray-500 text-center w-20">Delivery<br/>{currentStep >= 3 && order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Pending"}</span>
              </div>
            </div>
          </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p>
              {trackingData && trackingData.details && trackingData.details.length > 0 ? (
                <>
                  <span className="block font-bold mb-1">Live Updates:</span>
                  <span className="block mb-2">Courier: {trackingData.courierName} {trackingData.status ? `(${trackingData.status})` : ""}</span>
                  {trackingData.details.slice(0, 1).map((event: any, idx: number) => (
                    <span key={idx} className="block mb-1">
                      <span className="font-semibold">{new Date(event.datetime).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>: {event.notes} ({event.location})
                    </span>
                  ))}
                </>
              ) : (
                "Delivery Executive details will be available once the order is out for delivery."
              )}
            </p>
          </div>
          
          {trackingData && trackingData.details && trackingData.details.length > 0 && showAllUpdates ? (
            <div className="mt-4 border-t border-gray-100 pt-4 text-left">
              <h3 className="font-bold text-sm mb-4">Full Tracking History</h3>
              <div className="relative border-l-2 border-gray-200 ml-3 pl-4 space-y-6 mb-4">
                {trackingData.details.map((event: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-black border-2 border-white"></div>
                    <p className="text-xs font-bold text-gray-500">{new Date(event.datetime).toLocaleString()}</p>
                    <p className="text-sm font-bold text-black">{event.location}</p>
                    <p className="text-sm text-gray-600">{event.notes}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button onClick={() => setShowAllUpdates(false)} className="text-blue-600 font-semibold text-sm">Hide updates</button>
              </div>
            </div>
          ) : trackingData && trackingData.details && trackingData.details.length > 0 ? (
            <div className="mt-4 border-t border-gray-100 pt-4 text-center">
              <button onClick={() => setShowAllUpdates(true)} className="text-blue-600 font-semibold text-sm">See all updates</button>
            </div>
          ) : null}
        </div>        {/* Bottom Banner */}
        {ad && (
          <div className="p-4 bg-white">
            <Link href={ad.link || "#"} className="block relative h-[160px] w-full overflow-hidden rounded-xl bg-black">
              <img
                src={ad.imageUrl}
                alt={ad.name}
                className="h-full w-full object-cover"
              />
            </Link>
          </div>
        )}

        {/* Accordions */}
        <div className="bg-white px-4 py-2 space-y-4 pb-8 text-left">
          <div className="border-b border-gray-100 pb-4">
            <button
              onClick={() => setOpenDelivery(!openDelivery)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <h3 className="font-bold text-sm text-gray-900">Delivery details</h3>
                <p className="text-xs text-gray-500">Delivering to {order.shippingAddress?.firstName} at {order.shippingAddress?.city}</p>
              </div>
              <div className="h-8 w-8 rounded bg-gray-100 flex shrink-0 items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${openDelivery ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </button>
            {openDelivery && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <p className="font-semibold text-black">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                <p className="mt-1">
                  {order.shippingAddress?.houseOrBuilding 
                    ? `${order.shippingAddress?.houseOrBuilding}, ${order.shippingAddress?.roadAreaColony}${order.shippingAddress?.landmark ? `, ${order.shippingAddress?.landmark}` : ""}` 
                    : order.shippingAddress?.streetAddress}
                </p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                <p className="mt-1">Phone: {order.shippingAddress?.phoneNumber}</p>
                <p>Email: {order.shippingAddress?.email}</p>
              </div>
            )}
          </div>

          <div className="pb-4">
            <button
              onClick={() => setOpenPrice(!openPrice)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <h3 className="font-bold text-sm text-gray-900">Price details</h3>
                <p className="text-xs text-gray-500">Paid ₹{order.totalPrice?.toLocaleString("en-IN")} by {order.paymentMethod}</p>
              </div>
              <div className="h-8 w-8 rounded bg-gray-100 flex shrink-0 items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${openPrice ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </button>
            {openPrice && (
              <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Total</span>
                  <span className="font-medium">₹{order.itemsPrice?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₹{order.shippingPrice?.toLocaleString("en-IN")}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.couponCode})</span>
                    <span className="font-medium">- ₹{order.discountAmount?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-black">
                  <span>Total Paid</span>
                  <span>₹{order.totalPrice?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
