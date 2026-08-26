"use client";

import { useState, useEffect } from "react";
import { getOrders, updateDeliveryStatus, deleteOrder } from "@/lib/api";
import { Trash2, Search, CheckSquare } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");

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

  const handleDelete = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o: any) => o._id !== orderId));
      setSelectedOrders((prev) => prev.filter(id => id !== orderId));
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order");
    }
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>, filteredOrders: any[]) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) return;

    setLoading(true);
    try {
      await Promise.all(selectedOrders.map(id => deleteOrder(id)));
      setOrders((prev) => prev.filter((o: any) => !selectedOrders.includes(o._id)));
      setSelectedOrders([]);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Some orders failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatus = async () => {
    if (selectedOrders.length === 0 || !bulkStatus) return;
    if (!window.confirm(`Change status to ${bulkStatus} for ${selectedOrders.length} orders?`)) return;

    setLoading(true);
    try {
      await Promise.all(selectedOrders.map(id => updateDeliveryStatus(id, bulkStatus)));
      setOrders((prevOrders: any) => 
        prevOrders.map((o: any) => {
          if (selectedOrders.includes(o._id)) {
            return {
              ...o,
              deliveryStatus: bulkStatus,
              isDelivered: bulkStatus === "Delivered"
            };
          }
          return o;
        })
      );
      setSelectedOrders([]);
      setBulkStatus("");
    } catch (error) {
      console.error("Bulk status change failed:", error);
      alert("Some orders failed to update.");
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredOrders = orders.filter((order: any) => {
    // 1. Tab filter
    const isDelivered = order.deliveryStatus === "Delivered" || order.isDelivered;
    if (activeTab === "active" && isDelivered) return false;
    if (activeTab === "history" && !isDelivered) return false;

    // 2. Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const idMatch = order._id.toLowerCase().includes(query);
      const nameMatch = `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.toLowerCase().includes(query);
      const dateMatch = new Date(order.createdAt).toLocaleDateString().includes(query);
      
      if (!idMatch && !nameMatch && !dateMatch) return false;
    }

    return true;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-black">
          Orders
        </h1>
      </div>

      {/* Controls row */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab("active"); setSelectedOrders([]); }}
            className={`px-4 py-2 font-bold uppercase tracking-wider text-xs transition-colors ${
              activeTab === "active" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => { setActiveTab("history"); setSelectedOrders([]); }}
            className={`px-4 py-2 font-bold uppercase tracking-wider text-xs transition-colors ${
              activeTab === "history" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            History (Delivered)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="Search ID, Name, or Date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-black"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-3 rounded border border-gray-200">
          <span className="text-sm font-bold text-black">{selectedOrders.length} selected</span>
          
          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-black"
            >
              <option value="">Change Status...</option>
              <option value="Processing">Processing</option>
              <option value="In Transit">In Transit</option>
              <option value="Near You">Near You</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
            <button
              onClick={handleBulkStatus}
              disabled={!bulkStatus}
              className="rounded bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Apply
            </button>
          </div>

          <button
            onClick={handleBulkDelete}
            className="rounded border border-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 sm:ml-auto"
          >
            Delete Selected
          </button>
        </div>
      )}

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
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onChange={(e) => handleSelectAll(e, filteredOrders)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                  </th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Tracking</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order: any) => (
                    <tr key={order._id} className={`transition-colors hover:bg-gray-50 ${selectedOrders.includes(order._id) ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOne(order._id)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                      </td>
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
                        {order.trackingNumber ? (
                          <div>
                            <div className="font-mono text-xs font-bold text-black">{order.trackingNumber}</div>
                            <div className="text-[10px] uppercase text-gray-500">{order.courierName || "N/A"}</div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-400">Not Booked</span>
                            <button
                              onClick={async () => {
                                try {
                                  await import('@/lib/api').then(m => m.bookShipment(order._id));
                                  alert('Shipment booked successfully!');
                                  fetchOrders();
                                } catch (err: any) {
                                  alert(err.message || 'Failed to book shipment');
                                }
                              }}
                              className="w-fit rounded border border-black px-2 py-1 text-[10px] font-bold tracking-wider text-black transition-colors hover:bg-black hover:text-[#f4c84a]"
                            >
                              BOOK DELIVERY
                            </button>
                          </div>
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
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
