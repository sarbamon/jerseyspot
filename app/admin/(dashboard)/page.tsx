"use client";

import { Package, ShoppingCart, IndianRupee, Users } from "lucide-react";
import { getProducts, getOrders, getUsers } from "@/lib/api";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState([
    { name: "Total Revenue", value: "₹0", icon: IndianRupee, trend: "" },
    { name: "Active Orders", value: "0", icon: ShoppingCart, trend: "" },
    { name: "Total Products", value: "0", icon: Package, trend: "" },
    { name: "Customers", value: "0", icon: Users, trend: "" },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, ordersData, usersData] = await Promise.all([
          getProducts(),
          getOrders(true).catch(() => ({ orders: [] })),
          getUsers().catch(() => ({ users: [] }))
        ]);
        
        const productsCount = productsData.products ? productsData.products.length : 0;
        
        let totalRevenue = 0;
        let activeOrdersCount = 0;
        let fetchedOrders = [];
        
        if (ordersData && ordersData.orders) {
           fetchedOrders = ordersData.orders;
           fetchedOrders.forEach((o: any) => {
             if (o.isPaid) {
               totalRevenue += o.totalPrice;
             }
             if (o.deliveryStatus !== "Delivered") {
               activeOrdersCount += 1;
             }
           });
        }
        
        let customersCount = 0;
        if (usersData && usersData.users) {
          // Exclude admin if possible, but for now just length
          customersCount = usersData.users.length;
        }

        setStats([
          { name: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, trend: "" },
          { name: "Active Orders", value: activeOrdersCount.toString(), icon: ShoppingCart, trend: "" },
          { name: "Total Products", value: productsCount.toString(), icon: Package, trend: "" },
          { name: "Customers", value: customersCount.toString(), icon: Users, trend: "" },
        ]);
        
        if (fetchedOrders.length > 0) {
           setRecentOrders(fetchedOrders.slice(0, 5));
        }
        
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-wide text-black">
        Dashboard
      </h1>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        </div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold tracking-wider text-gray-500 uppercase">{stat.name}</p>
                    <div className="rounded-md bg-gray-100 p-2 text-black">
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-4">
                    <p className="text-3xl font-bold text-black">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RECENT ORDERS TABLE */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-serif text-lg font-bold text-black">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No recent orders.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-black font-mono text-xs">{order._id}</td>
                        <td className="px-6 py-4">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                            order.deliveryStatus === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            (order.deliveryStatus === 'In Transit' || order.deliveryStatus === 'Out for Delivery' || order.deliveryStatus === 'Near You') ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.deliveryStatus || 'Processing'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-black">₹{order.totalPrice.toLocaleString("en-IN")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
