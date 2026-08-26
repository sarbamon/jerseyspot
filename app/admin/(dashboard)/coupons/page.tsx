"use client";

import { useEffect, useState } from "react";
import { getCoupons, createCoupon, deleteCoupon } from "@/lib/api";
import { Trash2, Plus, Tag, X } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await getCoupons();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    try {
      const data = await createCoupon({
        code,
        discountType,
        discountValue: Number(discountValue),
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
      });

      if (data.success) {
        setCoupons([data.coupon, ...coupons]);
        setIsCreating(false);
        setCode("");
        setDiscountValue("");
        setUsageLimit("");
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete coupon");
    }
  };

  if (loading) return <div>Loading coupons...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-wide">Coupons</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-black px-4 py-2 text-sm font-bold text-[#f4c84a] transition hover:bg-gray-800"
        >
          {isCreating ? <X size={16} /> : <Plus size={16} />}
          {isCreating ? "CANCEL" : "NEW COUPON"}
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold uppercase tracking-wide">Create New Coupon</h2>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">CODE</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER20"
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">TYPE</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">VALUE</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="e.g. 20"
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">USAGE LIMIT (Optional)</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 mt-2">
              <button
                type="submit"
                className="bg-black px-6 py-2 text-sm font-bold text-[#f4c84a] transition hover:bg-gray-800"
              >
                SAVE COUPON
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-bold">Code</th>
              <th className="px-6 py-4 font-bold">Discount</th>
              <th className="px-6 py-4 font-bold">Usage</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-400" />
                    {coupon.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                </td>
                <td className="px-6 py-4">
                  {coupon.usedCount} / {coupon.usageLimit || "∞"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No coupons found. Create one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
