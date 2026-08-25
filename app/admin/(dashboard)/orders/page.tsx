"use client";

import { useState, useEffect } from "react";
import { getOrders, updateDeliveryStatus } from "@/lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders(true);
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      // Update local state to reflect change without full refetch
      setOrders((prevOrders: any) => 
        prevOrders.map((o: any) => {
          if (o._id === orderId) {
            return {
              ...o,
              deliveryStatus: newStatus,
              isDelivered: newStatus === "Delivered"
            };
          }
          return o;
        })
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update delivery status");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-black">
          Orders
        </h1>
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        </div>
      )}
      
      {!loading && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">
                        {order._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-black">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</div>
                        <div className="text-xs text-gray-500">{order.shippingAddress?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-black">
                        ₹{order.totalPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        {order.isPaid ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.deliveryStatus || (order.isDelivered ? "Delivered" : "Processing")}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs font-bold text-gray-700 outline-none focus:border-black"
                        >
                          <option value="Processing">Processing</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Near You">Near You</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
