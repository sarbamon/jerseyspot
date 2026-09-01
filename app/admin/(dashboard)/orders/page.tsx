"use client";

import { useState, useEffect } from "react";
import { getOrders, updateDeliveryStatus, deleteOrder, getSiteConfig, getOrderTracking, bookShipment, cancelOrder } from "@/lib/api";
import { Trash2, Search, CheckSquare } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<{ [orderId: string]: string }>({});
  
  const [trackingModalOrder, setTrackingModalOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await getSiteConfig(true);
      if (data.config && data.config.pickupPoints) {
        setPickupPoints(data.config.pickupPoints);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openTrackingModal = async (orderId: string) => {
    setTrackingModalOrder(orderId);
    setTrackingLoading(true);
    setTrackingData(null);
    try {
      const res = await getOrderTracking(orderId);
      if (res.tracking) {
        setTrackingData(res.tracking);
      } else {
        alert("Could not fetch tracking");
      }
    } catch (e: any) {
      alert(e.message || "Failed to fetch tracking");
    } finally {
      setTrackingLoading(false);
    }
  };

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
      let otp = undefined;
      if (newStatus === "Delivered") {
        otp = window.prompt("Enter the 4-digit Delivery OTP provided by the user:");
        if (otp === null) return; // Cancelled
      }

      await updateDeliveryStatus(orderId, newStatus, otp);
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
    } catch (error: any) {
      console.error("Failed to update status:", error);
      alert(error.message || "Failed to update delivery status");
      // Re-fetch to reset the select dropdown if it failed
      fetchOrders();
    }
  };

  const handleBookShipment = async (orderId: string) => {
    try {
      const pId = selectedPickup[orderId] || (pickupPoints.length > 0 ? pickupPoints[0].icarryId : "");
      if (!pId) {
        alert("Please configure pickup points in Settings first.");
        return;
      }
      
      await bookShipment(orderId, pId);
      alert('Shipment booked successfully!');
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to book shipment');
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

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order? Stock will be restored.")) return;
    
    try {
      await cancelOrder(orderId);
      alert("Order cancelled successfully");
      fetchOrders();
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      alert(error.message || "Failed to cancel order");
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
    if (bulkStatus === "Delivered") {
      alert("Cannot bulk update to 'Delivered' because each order requires a unique Delivery OTP. Please update them individually.");
      return;
    }
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
              <option value="Cancelled">Cancelled</option>
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
                  <th className="px-6 py-4">Products</th>
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
                      <td className="px-6 py-4 text-xs text-gray-700">
                        {order.orderItems?.map((item: any, idx: number) => (
                          <div key={idx} className="mb-1">
                            <span className="font-semibold text-black">{item.name}</span>
                            <br />
                            <span className="text-[10px] text-gray-500">Size: {item.size} • Qty: {item.quantity}</span>
                          </div>
                        ))}
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
                            <button
                              onClick={() => openTrackingModal(order._id)}
                              className="mt-2 text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              VIEW TRACKING
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-400">Not Booked</span>
                            {pickupPoints.length > 0 && (
                              <select 
                                className="w-full text-[10px] p-1 border border-gray-300 rounded outline-none bg-white"
                                value={selectedPickup[order._id] || pickupPoints[0].icarryId}
                                onChange={(e) => setSelectedPickup(prev => ({...prev, [order._id]: e.target.value}))}
                              >
                                {pickupPoints.map((pt: any) => (
                                  <option key={pt.icarryId} value={pt.icarryId}>{pt.name}</option>
                                ))}
                              </select>
                            )}
                            <button
                              onClick={() => handleBookShipment(order._id)}
                              className="w-fit rounded border border-black px-2 py-1 text-[10px] font-bold tracking-wider text-black transition-colors hover:bg-black hover:text-[#f4c84a]"
                            >
                              BOOK VIA iCARRY
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
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {!order.isCancelled && order.deliveryStatus !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-[10px] font-bold uppercase tracking-wider text-orange-600 hover:text-orange-800 transition-colors"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors ml-2"
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

      {/* Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold">Live Tracking</h2>
              <button onClick={() => setTrackingModalOrder(null)} className="text-gray-500 hover:text-black">
                <CheckSquare size={20} className="hidden" /> {/* just importing X from lucide, but CheckSquare is there so we'll just use text for now */}
                Close
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {trackingLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black"></div>
                </div>
              ) : trackingData ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm font-bold text-black">Status: <span className="text-blue-600">{trackingData.status || "Processing"}</span></p>
                    <p className="text-xs text-gray-500">Courier: {trackingData.courierName}</p>
                    {trackingData.location && <p className="text-xs text-gray-500">Current Location: {trackingData.location}</p>}
                  </div>

                  <div className="relative border-l-2 border-gray-200 ml-3 pl-4 space-y-6">
                    {trackingData.details && trackingData.details.map((event: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-black border-2 border-white"></div>
                        <p className="text-xs font-bold text-gray-500">{new Date(event.datetime).toLocaleString()}</p>
                        <p className="text-sm font-bold text-black">{event.location}</p>
                        <p className="text-sm text-gray-600">{event.notes}</p>
                      </div>
                    ))}
                    {(!trackingData.details || trackingData.details.length === 0) && (
                      <p className="text-sm text-gray-500">No detailed tracking events yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tracking data available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
