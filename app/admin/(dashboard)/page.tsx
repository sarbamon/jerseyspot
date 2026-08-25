import { Package, ShoppingCart, IndianRupee, Users } from "lucide-react";
import { getProducts } from "@/lib/api";

export default async function AdminDashboardPage() {
  const data = await getProducts();
  const products = data.products;

  const stats = [
    { name: "Total Revenue", value: "₹45,231", icon: IndianRupee, trend: "+12%" },
    { name: "Active Orders", value: "14", icon: ShoppingCart, trend: "+3" },
    { name: "Total Products", value: products.length.toString(), icon: Package, trend: "0" },
    { name: "Customers", value: "102", icon: Users, trend: "+8%" },
  ];

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-wide text-black">
        Dashboard
      </h1>

      {/* STATS CARDS */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith("+");
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
                <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.trend}
                </span>
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
              {[
                { id: "#ORD-001", customer: "John Doe", date: "Aug 24, 2026", status: "Processing", amount: "₹1,999" },
                { id: "#ORD-002", customer: "Jane Smith", date: "Aug 23, 2026", status: "Shipped", amount: "₹4,500" },
                { id: "#ORD-003", customer: "Alex Johnson", date: "Aug 22, 2026", status: "Delivered", amount: "₹999" },
                { id: "#ORD-004", customer: "Emily Davis", date: "Aug 21, 2026", status: "Delivered", amount: "₹2,499" },
              ].map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-black">{order.id}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-black">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
