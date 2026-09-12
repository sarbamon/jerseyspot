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
  const [adsList, setAdsList] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDelivery, setOpenDelivery] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const { isInitialized, isAuthenticated, showLoginModal } = useStore();

  const formatTrackingDate = (rawDate: any) => {
    if (!rawDate) return "";
    const str = String(rawDate).trim();
    if (!str || str.toLowerCase() === "invalid date" || str.toLowerCase() === "null" || str.toLowerCase() === "undefined") {
      return "";
    }

    // 1. Standard JS Date attempt
    let d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // 2. Try replacing space with 'T' (e.g. "2026-09-12 14:30:00")
    d = new Date(str.replace(" ", "T"));
    if (!isNaN(d.getTime())) {
      return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // 3. Try parsing DD-MM-YYYY or DD/MM/YYYY
    const parts = str.split(/[\s\-:\/]+/);
    if (parts.length >= 3) {
      let [p1, p2, p3, h = "00", m = "00"] = parts;
      if (p1.length === 2 && p3.length === 4) {
        d = new Date(`${p3}-${p2}-${p1}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`);
        if (!isNaN(d.getTime())) {
          return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      }
    }

    // Fallback: If it's a raw date/time string from courier API, display raw string instead of "Invalid Date"
    return str;
  };

  useEffect(() => {
    if (adsList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [adsList]);

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
        getAds(true)
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
      if (adsData.ads && adsData.ads.length > 0) setAdsList(adsData.ads);

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

  // Status logic & 7 Stages Progression
  const STAGES = [
    "Order Received",
    "Order Confirmed & Ready to Ship",
    "Order Picked Up by Delivery Partner",
    "In Transit",
    "Near You",
    "Out for Delivery",
    "Delivered"
  ];

  const currentStatus = order.deliveryStatus || (order.isDelivered ? "Delivered" : "Order Received");
  const isCancelled = currentStatus === "Cancelled" || order.isCancelled;
  const isDelivered = currentStatus === "Delivered" || order.isDelivered;

  let currentStageIdx = STAGES.findIndex(
    (s) => s.toLowerCase() === currentStatus.toLowerCase()
  );
  if (currentStageIdx === -1) {
    if (currentStatus === "Order Confirmed & Placed") currentStageIdx = 1;
    else if (isDelivered) currentStageIdx = 6;
    else currentStageIdx = 0;
  }

  const progressPercent = isCancelled ? 100 : (currentStageIdx / (STAGES.length - 1)) * 100;

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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-gray-900">
              {isCancelled ? "Order Cancelled" : isDelivered ? "Order Delivered" : currentStatus}
            </h2>
            {isCancelled ? (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">Cancelled</span>
            ) : isDelivered ? (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Delivered</span>
            ) : (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">{currentStatus}</span>
            )}
          </div>

          <div className="text-xs text-gray-600 mb-6 flex items-center justify-between">
            {isCancelled ? (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs font-medium space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  <span>This order was {order.cancelledBy === 'Admin' ? "cancelled by Support." : "cancelled."}</span>
                </div>
                {order.cancelReason && (
                  <p className="pl-6 text-xs text-red-700">
                    <span className="font-bold">Reason:</span> {order.cancelReason}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span>Status: <strong className="text-gray-900">{currentStatus}</strong></span>
              </div>
            )}
          </div>

          {/* Horizontal Progress Bar */}
          <div className="relative mb-6 px-1">
            <div className="absolute top-2.5 left-[12px] right-[12px]">
              <div className={`absolute top-0 left-0 w-full h-1 z-0 ${isCancelled ? 'bg-red-200' : 'bg-gray-200'}`}></div>
              <div 
                className={`absolute top-0 left-0 h-1 z-0 transition-all duration-500 ${isCancelled ? 'bg-red-600' : 'bg-green-600'}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            <div className="relative z-10 flex justify-between">
              {STAGES.map((_, idx) => {
                const isPassed = !isCancelled && idx <= currentStageIdx;
                const isCurrent = !isCancelled && idx === currentStageIdx;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                      isCancelled 
                        ? (idx === currentStageIdx || idx === STAGES.length - 1 ? 'bg-red-600 text-white font-bold' : 'bg-red-100 text-red-400')
                        : isCurrent
                          ? 'bg-green-600 text-white font-bold ring-4 ring-green-100 scale-110'
                          : isPassed
                            ? 'bg-green-600 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}>
                      {isCancelled && (idx === currentStageIdx || idx === STAGES.length - 1) ? '✕' : isPassed ? '✓' : idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Detailed Stages Stepper */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Order Status Stages</h3>
            <div className="space-y-3 pl-1">
              {STAGES.map((stageName, idx) => {
                const isPassed = !isCancelled && idx <= currentStageIdx;
                const isCurrent = !isCancelled && idx === currentStageIdx;
                
                return (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="relative flex flex-col items-center">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                        isPassed 
                          ? 'bg-green-600 text-white font-bold' 
                          : 'bg-gray-100 text-gray-400 border border-gray-300'
                      }`}>
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      {idx < STAGES.length - 1 && (
                        <div className={`w-0.5 h-4 my-0.5 ${isPassed && idx < currentStageIdx ? 'bg-green-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <span className={`font-semibold ${isCurrent ? 'text-green-700 font-bold text-sm' : isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {stageName}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isCancelled && (
                <div className="flex items-start gap-3 text-xs pt-1">
                  <div className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✕
                  </div>
                  <div className="pt-0.5">
                    <span className="font-bold text-red-600 text-sm">Cancelled</span>
                    <span className="ml-2 text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">Order Cancelled</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <div className="w-full">
              {trackingData && trackingData.details && trackingData.details.length > 0 ? (
                <>
                  <span className="block font-bold mb-1">Live Updates:</span>
                  <span className="block mb-2 text-gray-700 font-medium">Courier: {trackingData.courierName} {trackingData.status ? `(${trackingData.status})` : ""}</span>
                  {trackingData.details.slice(0, 1).map((event: any, idx: number) => {
                    const dateStr = formatTrackingDate(event.datetime || event.date || event.time || event.timestamp);
                    const notesStr = event.notes || event.status || event.activity || "";
                    const locationStr = event.location ? ` (${event.location})` : "";
                    return (
                      <span key={idx} className="block mb-1">
                        {dateStr ? <span className="font-semibold text-gray-800">{dateStr}: </span> : null}
                        <span>{notesStr}{locationStr}</span>
                      </span>
                    );
                  })}
                </>
              ) : (
                <p>Delivery Executive details will be available once your order is picked up by our delivery partner. The estimated delivery date will be updated based on the courier partner's tracking.</p>
              )}
            </div>
          </div>
          
          {trackingData && trackingData.details && trackingData.details.length > 0 && showAllUpdates ? (
            <div className="mt-4 border-t border-gray-100 pt-4 text-left">
              <h3 className="font-bold text-sm mb-4">Full Tracking History</h3>
              <div className="relative border-l-2 border-gray-200 ml-3 pl-4 space-y-6 mb-4">
                {trackingData.details.map((event: any, idx: number) => {
                  const dateStr = formatTrackingDate(event.datetime || event.date || event.time || event.timestamp);
                  const notesStr = event.notes || event.status || event.activity || "";
                  return (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-black border-2 border-white"></div>
                      {dateStr ? <p className="text-xs font-bold text-gray-500">{dateStr}</p> : null}
                      {event.location ? <p className="text-sm font-bold text-black">{event.location}</p> : null}
                      {notesStr ? <p className="text-sm text-gray-600">{notesStr}</p> : null}
                    </div>
                  );
                })}
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
        </div>        {/* Bottom Banner Slideshow */}
        {adsList.length > 0 && (
          <div className="p-4 bg-white">
            <div className="relative h-[160px] w-full overflow-hidden rounded-xl bg-black shadow-sm">
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
