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
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "free_shipping">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountCap, setMaxDiscountCap] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [isOneTimePerUser, setIsOneTimePerUser] = useState(false);
  const [applyToShipping, setApplyToShipping] = useState(false);

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
    if (!code) return;
    if (discountType !== "free_shipping" && !discountValue) return;

    try {
      const data = await createCoupon({
        code,
        discountType,
        discountValue: discountType === "free_shipping" ? 0 : Number(discountValue),
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        isOneTimePerUser,
        applyToShipping: discountType === "free_shipping" ? true : applyToShipping,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : undefined,
      });

      if (data.success) {
        setCoupons([data.coupon, ...coupons]);
        setIsCreating(false);
        setCode("");
        setDiscountValue("");
        setMinOrderAmount("");
        setMaxDiscountCap("");
        setUsageLimit("");
        setIsOneTimePerUser(false);
        setApplyToShipping(false);
        setDiscountType("percentage");
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
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">CODE *</label>
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
              <label className="mb-1 block text-xs font-bold text-gray-600">TYPE *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="free_shipping">Free Delivery (100% off shipping)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">DISCOUNT VALUE *</label>
              <input
                type="number"
                value={discountType === "free_shipping" ? "" : discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "free_shipping" ? "Free Delivery (Auto)" : "e.g. 20"}
                disabled={discountType === "free_shipping"}
                className="w-full border p-2 text-sm focus:border-black focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                required={discountType !== "free_shipping"}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">MIN ORDER AMOUNT (₹)</label>
              <input
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="e.g. 999 (0 for none)"
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">MAX DISCOUNT CAP (₹)</label>
              <input
                type="number"
                min="0"
                value={maxDiscountCap}
                onChange={(e) => setMaxDiscountCap(e.target.value)}
                placeholder="e.g. 500 (blank for no cap)"
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600">USAGE LIMIT (Optional)</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full border p-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="oneTime"
                checked={isOneTimePerUser}
                onChange={(e) => setIsOneTimePerUser(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
              />
              <label htmlFor="oneTime" className="text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer">
                1 TIME USE PER USER
              </label>
            </div>
            {discountType !== "free_shipping" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="applyShipping"
                  checked={applyToShipping}
                  onChange={(e) => setApplyToShipping(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <label htmlFor="applyShipping" className="text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer">
                  COVERS SHIPPING CHARGE TOO
                </label>
              </div>
            )}
            <div className="md:col-span-2 lg:col-span-3 mt-2">
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
                  {coupon.discountType === "free_shipping" ? (
                    <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800 uppercase tracking-wider">
                      Free Delivery
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="font-semibold">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </span>
                      {coupon.maxDiscountCap ? (
                        <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                          Max Cap: ₹{coupon.maxDiscountCap}
                        </span>
                      ) : null}
                      {coupon.applyToShipping && (
                        <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 uppercase tracking-wider">
                          + Covers Delivery
                        </span>
                      )}
                    </div>
                  )}
                  {coupon.minOrderAmount > 0 && (
                    <div className="text-[11px] text-gray-500 font-medium mt-1">
                      Min Order: ₹{coupon.minOrderAmount}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>{coupon.usedCount} / {coupon.usageLimit || "∞"}</div>
                  {coupon.isOneTimePerUser && (
                    <div className="text-[10px] text-blue-600 font-bold uppercase mt-1">1 Per User</div>
                  )}
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
