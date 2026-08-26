"use client";

import { useState, useEffect } from "react";
import { getMyOrders } from "@/lib/api";
import Link from "next/link";
import { Package } from "lucide-react";
import { useStore } from "@/components/StoreProvider";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isInitialized, isAuthenticated, logout, showLoginModal, user } = useStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setError("Please login to view your orders.");
      setLoading(false);
      showLoginModal();
      return;
    }
    
    if (isInitialized && isAuthenticated) {
      fetchOrders();
    }
  }, [isInitialized, isAuthenticated, showLoginModal]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders(true);
      if (data.orders) {
        setOrders(data.orders);
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="font-serif text-3xl font-black tracking-widest text-black">
            MY ORDERS {user ? `- ${user.name}` : ""}
          </h1>
          <button
            onClick={() => logout()}
            className="mt-4 sm:mt-0 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-black"
          >
            Sign Out
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Package size={48} className="mb-4 text-gray-400" />
            <h2 className="mb-2 text-xl font-bold">No orders found</h2>
            <p className="mb-6 text-gray-500">You haven't placed any orders yet.</p>
            <Link href="/shop" className="bg-black px-8 py-3 font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-800">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order._id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col justify-between border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-500">ORDER ID</p>
                    <p className="font-mono text-sm font-bold text-black">{order._id}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:text-right">
                    <p className="text-xs font-bold text-gray-500">ORDER DATE</p>
                    <p className="text-sm font-bold text-black">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Status */}
                  <div>
                    <p className="mb-1 text-xs font-bold text-gray-500">PAYMENT</p>
                    {order.isPaid ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-green-800">
                        Paid
                      </span>
                    ) : (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold text-gray-500">DELIVERY STATUS</p>
                    {order.deliveryStatus === "Delivered" ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-green-800">
                        {order.deliveryStatus}
                      </span>
                    ) : order.deliveryStatus === "Out for Delivery" || order.deliveryStatus === "Near You" ? (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
                        {order.deliveryStatus || "Processing"}
                      </span>
                    ) : order.deliveryStatus === "In Transit" ? (
                      <span className="rounded bg-purple-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-purple-800">
                        {order.deliveryStatus}
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-800">
                        {order.deliveryStatus || "Processing"}
                      </span>
                    )}
                  </div>

                  {/* Total */}
                  <div>
                    <p className="mb-1 text-xs font-bold text-gray-500">TOTAL</p>
                    <p className="font-bold text-black">₹{order.totalPrice.toLocaleString("en-IN")}</p>
                  </div>

                  {/* Shipping */}
                  <div>
                    <p className="mb-1 text-xs font-bold text-gray-500">SHIPPED TO</p>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="mb-3 text-sm font-bold text-gray-500">ITEMS</h3>
                  <div className="space-y-3">
                    {order.orderItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">{item.quantity}x</span>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <div className="font-bold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
