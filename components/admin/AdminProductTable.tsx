"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteProductButton from "./DeleteProductButton";
import RestoreProductButton from "./RestoreProductButton";
import { bulkDeleteProducts } from "@/lib/api";

export default function AdminProductTable({
  products,
  isDeletedTab,
}: {
  products: any[];
  isDeletedTab: boolean;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    setIsDeleting(true);
    try {
      await bulkDeleteProducts(selectedIds);
      setSelectedIds([]); // Clear selection after success
      router.refresh();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
      alert("Failed to delete products.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Bulk Actions Bar */}
      {!isDeletedTab && selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 px-6 py-3 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">
            {selectedIds.length} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            <Trash size={16} />
            {isDeleting ? "DELETING..." : "DELETE SELECTED"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              {!isDeletedTab && (
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    checked={selectedIds.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={isDeletedTab ? 5 : 6} className="px-6 py-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr
                  key={product._id}
                  className={`transition-colors hover:bg-gray-50 ${
                    selectedIds.includes(product._id) ? "bg-gray-50" : ""
                  }`}
                >
                  {!isDeletedTab && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        checked={selectedIds.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={product.image || "/placeholder.png"}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-black">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.team}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 uppercase tracking-wider text-xs font-bold">
                    {product.category ? product.category.replace("-", " ") : "N/A"}
                  </td>
                  <td className="px-6 py-4 font-bold text-black">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    {isDeletedTab ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-800">
                        Deleted
                      </span>
                    ) : product.stock <= 0 ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-800">
                        Out of Stock
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {product.sizes && product.sizes.length > 0 ? (
                          product.sizes.map((s: any) => (
                            <span 
                              key={s.size} 
                              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                s.stock > 0 
                                  ? "bg-green-100 text-green-800 border border-green-200" 
                                  : "bg-red-50 text-red-400 border border-red-100"
                              }`}
                            >
                              {s.size}: {s.stock}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-800">
                            In Stock ({product.stock})
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {isDeletedTab ? (
                        <RestoreProductButton productId={product._id} />
                      ) : (
                        <>
                          <Link
                            href={`/admin/products/${product.slug}/edit`}
                            className="text-gray-400 hover:text-black"
                          >
                            <Edit size={18} />
                          </Link>
                          <DeleteProductButton productId={product._id} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
