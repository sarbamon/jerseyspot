"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  Plus,
  ExternalLink,
  Eye,
  RefreshCw,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { getProducts, getOrders, getUsers } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [aov, setAov] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState({
    pending: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [dailySales, setDailySales] = useState<{ day: string; date: string; amount: number; count: number }[]>([]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [productsData, ordersData, usersData] = await Promise.all([
        getProducts().catch(() => ({ products: [] })),
        getOrders(true).catch(() => ({ orders: [] })),
        getUsers().catch(() => ({ users: [] })),
      ]);

      const products = productsData?.products || [];
      const orders = ordersData?.orders || [];
      const users = usersData?.users || [];

      // 1. Products & Low Stock
      setTotalProductsCount(products.length);
      const lowStock = products.filter((p: any) => {
        const hasLowSize = p.sizes?.some((s: any) => typeof s.stock === "number" && s.stock <= 3);
        const totalStock = typeof p.stock === "number" ? p.stock : p.sizes?.reduce((sum: number, s: any) => sum + (s.stock || 0), 0);
        return hasLowSize || (typeof totalStock === "number" && totalStock <= 3);
      });
      setLowStockProducts(lowStock);

      // 2. Customers
      setCustomersCount(users.length);

      // 3. Orders & Revenue (Filter Paid Orders)
      const paidOrders = orders.filter((o: any) => o.isPaid);
      let revenue = 0;
      let activeCount = 0;

      let pendingCount = 0;
      let shippingCount = 0;
      let deliveredCount = 0;
      let cancelledCount = 0;

      // Track item sales frequency
      const productSalesMap: { [id: string]: { name: string; image: string; qty: number; revenue: number } } = {};

      paidOrders.forEach((o: any) => {
        revenue += o.totalPrice || 0;
        const status = o.deliveryStatus || "Order Received";
        const isDelivered = status === "Delivered" || o.isDelivered;
        const isCancelled = status === "Cancelled" || o.isCancelled;

        if (isCancelled) {
          cancelledCount++;
        } else if (isDelivered) {
          deliveredCount++;
        } else if (
          status === "In Transit" ||
          status === "Near You" ||
          status === "Out for Delivery" ||
          status === "Order Picked Up by Delivery Partner" ||
          status === "Order Confirmed & Ready to Ship"
        ) {
          shippingCount++;
          activeCount++;
        } else {
          pendingCount++;
          activeCount++;
        }

        // Product velocity
        o.orderItems?.forEach((item: any) => {
          const pId = item.product?._id || item.product || item.name;
          if (!productSalesMap[pId]) {
            productSalesMap[pId] = {
              name: item.name,
              image: item.image,
              qty: 0,
              revenue: 0,
            };
          }
          productSalesMap[pId].qty += Number(item.quantity || 1);
          productSalesMap[pId].revenue += Number(item.price || 0) * Number(item.quantity || 1);
        });
      });

      const topList = Object.values(productSalesMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 4);
      setTopProducts(topList);

      setTotalRevenue(revenue);
      setActiveOrdersCount(activeCount);
      setAov(paidOrders.length > 0 ? Math.round(revenue / paidOrders.length) : 0);
      setStatusBreakdown({
        pending: pendingCount,
        shipping: shippingCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      });

      // Show recent orders (most recent first)
      setRecentOrders(orders.slice(0, 6));

      // 4. Last 7 Days Daily Revenue Trend
      const days = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = d.toISOString().split("T")[0];

        const dayRevenue = paidOrders
          .filter((o: any) => {
            const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
            return orderDate === dateStr;
          })
          .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);

        const dayOrdersCount = paidOrders.filter((o: any) => {
          const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
          return orderDate === dateStr;
        }).length;

        days.push({ day: dayStr, date: dateStr, amount: dayRevenue, count: dayOrdersCount });
      }
      setDailySales(days);
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxDailyRevenue = Math.max(...dailySales.map((d) => d.amount), 1);
  const totalPaidOrders = statusBreakdown.pending + statusBreakdown.shipping + statusBreakdown.delivered;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. EXECUTIVE WELCOME HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Store Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Store
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Real-time performance, revenue analytics, and fulfillment overview.
          </p>
        </div>

        {/* Quick action bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Syncing..." : "Sync"}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-black"
          >
            <ExternalLink size={14} />
            <span>Storefront</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f4c84a] shadow-sm transition hover:bg-gray-900"
          >
            <Plus size={15} />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
            <p className="text-xs font-medium text-gray-500">Loading store analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* 2. PRIMARY KPI STATS GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-gray-500">Total Revenue</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <IndianRupee size={20} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-flex items-center font-semibold text-emerald-600">
                    <TrendingUp size={13} className="mr-0.5" />
                    Verified
                  </span>
                  <span>from {totalPaidOrders} paid orders</span>
                </div>
              </div>
            </div>

            {/* Active Orders */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-gray-500">Active Orders</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  {activeOrdersCount}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-flex items-center font-semibold text-blue-600">
                    <Clock size={13} className="mr-0.5" />
                    Fulfillment
                  </span>
                  <span>{statusBreakdown.pending} pending, {statusBreakdown.shipping} in transit</span>
                </div>
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-gray-500">Avg. Order Value</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  ₹{aov.toLocaleString("en-IN")}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="font-semibold text-purple-600">Basket Size</span>
                  <span>per successful transaction</span>
                </div>
              </div>
            </div>

            {/* Total Products & Inventory Health */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-gray-500">Products Catalog</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Package size={20} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  {totalProductsCount}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  {lowStockProducts.length > 0 ? (
                    <span className="inline-flex items-center font-semibold text-amber-600">
                      <AlertTriangle size={13} className="mr-0.5" />
                      {lowStockProducts.length} low in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center font-semibold text-emerald-600">
                      <CheckCircle2 size={13} className="mr-0.5" />
                      Healthy inventory
                    </span>
                  )}
                  <span className="text-gray-400">• {customersCount} customers</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. VISUAL ANALYTICS: 7-DAY REVENUE CHART & FULFILLMENT BREAKDOWN */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue Trend Chart (Pure SVG / Tailwind, zero extra bundle weight) */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4 mb-5">
                <div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-gray-900">
                    Revenue Trend (Last 7 Days)
                  </h2>
                  <p className="text-xs text-gray-500">Daily sales performance and transaction volume</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                  7-Day Total: ₹{dailySales.reduce((a, b) => a + b.amount, 0).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6 px-2">
                {dailySales.map((dayItem, idx) => {
                  const barHeightPercent = Math.max(10, Math.round((dayItem.amount / maxDailyRevenue) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 text-center">
                        <span className="bg-black text-[#f4c84a] text-[10px] font-bold py-1 px-2 rounded shadow-md whitespace-nowrap">
                          ₹{dayItem.amount.toLocaleString("en-IN")} ({dayItem.count})
                        </span>
                      </div>
                      
                      {/* The visual Bar */}
                      <div className="w-full max-w-[40px] bg-gray-100 rounded-t-lg overflow-hidden flex items-end h-full">
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            dayItem.amount > 0 ? "bg-black group-hover:bg-[#f4c84a]" : "bg-gray-200"
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <span className="mt-2 text-xs font-bold text-gray-600 group-hover:text-black">
                        {dayItem.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Fulfillment Status Widget */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-gray-900">
                  Fulfillment Status
                </h2>
                <p className="text-xs text-gray-500 mb-5">Order pipeline breakdown</p>

                <div className="space-y-4">
                  {/* Pending / Order Received */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                      <span className="font-medium text-gray-700">Pending / To Ship</span>
                    </div>
                    <span className="font-bold text-gray-900">{statusBreakdown.pending}</span>
                  </div>

                  {/* Shipping / In Transit */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                      <span className="font-medium text-gray-700">In Transit / Out</span>
                    </div>
                    <span className="font-bold text-gray-900">{statusBreakdown.shipping}</span>
                  </div>

                  {/* Delivered */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                      <span className="font-medium text-gray-700">Delivered</span>
                    </div>
                    <span className="font-bold text-gray-900">{statusBreakdown.delivered}</span>
                  </div>

                  {/* Cancelled */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400"></span>
                      <span className="font-medium text-gray-700">Cancelled</span>
                    </div>
                    <span className="font-bold text-gray-900">{statusBreakdown.cancelled}</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-6 h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
                  {totalPaidOrders > 0 ? (
                    <>
                      <div
                        style={{ width: `${(statusBreakdown.delivered / totalPaidOrders) * 100}%` }}
                        className="bg-emerald-500"
                        title={`Delivered: ${statusBreakdown.delivered}`}
                      />
                      <div
                        style={{ width: `${(statusBreakdown.shipping / totalPaidOrders) * 100}%` }}
                        className="bg-blue-500"
                        title={`In Transit: ${statusBreakdown.shipping}`}
                      />
                      <div
                        style={{ width: `${(statusBreakdown.pending / totalPaidOrders) * 100}%` }}
                        className="bg-amber-400"
                        title={`Pending: ${statusBreakdown.pending}`}
                      />
                    </>
                  ) : (
                    <div className="w-full bg-gray-200" />
                  )}
                </div>
              </div>

              <Link
                href="/admin/orders"
                className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs font-bold text-gray-800 transition hover:bg-black hover:text-white"
              >
                <span>Manage Order Shipments</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* 4. LOWER SECTION: RECENT ORDERS & TOP PRODUCTS / INVENTORY ALERT */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Orders List (Spans 2 columns) */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-gray-900">
                    Recent Orders
                  </h2>
                  <p className="text-xs text-gray-500">Latest customer orders</p>
                </div>
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5">Order</th>
                      <th className="px-6 py-3.5">Customer</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order: any) => {
                        const isDelivered = order.deliveryStatus === "Delivered" || order.isDelivered;
                        const isCancelled = order.deliveryStatus === "Cancelled" || order.isCancelled;
                        const isFailed = !order.isPaid && !isCancelled;

                        return (
                          <tr key={order._id} className="transition-colors hover:bg-gray-50/80">
                            <td className="px-6 py-3.5">
                              <span className="font-mono font-bold text-gray-900">
                                {order.customOrderId || order._id?.slice(-8)}
                              </span>
                              {order.orderItems?.length > 0 && (
                                <div className="text-[10px] text-gray-400 line-clamp-1">
                                  {order.orderItems[0].name}
                                  {order.orderItems.length > 1 ? ` (+${order.orderItems.length - 1} more)` : ""}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="font-semibold text-gray-900">
                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                              </div>
                              <div className="text-[10px] text-gray-400">{order.shippingAddress?.phoneNumber}</div>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  isFailed
                                    ? "bg-red-100 text-red-700"
                                    : isCancelled
                                    ? "bg-gray-100 text-gray-600"
                                    : isDelivered
                                    ? "bg-emerald-100 text-emerald-800"
                                    : (order.deliveryStatus === "Order Confirmed & Ready to Ship" || order.deliveryStatus === "Order Confirmed & Placed")
                                    ? "bg-purple-100 text-purple-800"
                                    : (order.deliveryStatus === "In Transit" || order.deliveryStatus === "Out for Delivery")
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {isFailed ? "Unpaid" : isCancelled ? "Cancelled" : order.deliveryStatus || "Placed"}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right font-bold text-gray-900 whitespace-nowrap">
                              ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products / Low Stock Warnings */}
            <div className="space-y-6">
              {/* Best Selling Jerseys */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="font-serif text-sm font-bold text-gray-900">Best Selling Jerseys</h3>
                  <Link href="/admin/products" className="text-[11px] font-bold text-blue-600 hover:underline">
                    View Catalog
                  </Link>
                </div>

                <div className="space-y-3">
                  {topProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No sales recorded yet.</p>
                  ) : (
                    topProducts.map((prod, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 p-0.5">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[9px] text-gray-400">
                              Jersey
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate" title={prod.name}>
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {prod.qty} sold • ₹{prod.revenue.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockProducts.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-amber-900">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Low Stock Alerts ({lowStockProducts.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-amber-700 mb-3">
                    These items are running out of sizes or inventory soon.
                  </p>
                  <div className="space-y-1.5">
                    {lowStockProducts.slice(0, 3).map((lp: any) => (
                      <Link
                        key={lp._id}
                        href={`/admin/products/${lp.slug}/edit`}
                        className="block rounded-lg bg-white border border-amber-200/80 px-3 py-1.5 text-xs text-gray-900 hover:border-black transition"
                      >
                        <span className="font-semibold line-clamp-1">{lp.name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/admin/products/bulk"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:underline"
                  >
                    <span>Bulk Update Inventory</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
