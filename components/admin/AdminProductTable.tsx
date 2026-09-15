"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteProductButton from "./DeleteProductButton";
import RestoreProductButton from "./RestoreProductButton";
import { bulkDeleteProducts, bulkUpdateStock } from "@/lib/api";

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
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<string>("default"); // default, low-high, high-low
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<string>("all"); // all, in-stock, out-of-stock
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Extract unique categories from products list
  const uniqueCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((product) => {
      // Category Filter
      if (selectedCategory !== "all") {
        const prodCat = (product.category || "").toLowerCase();
        const targetCat = selectedCategory.toLowerCase();
        if (prodCat !== targetCat && !prodCat.includes(targetCat)) {
          return false;
        }
      }

      // Max Price Filter
      if (maxPrice && !isNaN(Number(maxPrice))) {
        if (product.price > Number(maxPrice)) return false;
      }

      // Stock Filter
      if (stockFilter === "in-stock") {
        if (product.stock <= 0) return false;
      } else if (stockFilter === "out-of-stock") {
        if (product.stock > 0) return false;
      }

      // Search Filter
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const nameMatch = (product.name || "").toLowerCase().includes(query);
        const teamMatch = (product.team || "").toLowerCase().includes(query);
        const catMatch = (product.category || "").toLowerCase().includes(query);
        if (!nameMatch && !teamMatch && !catMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (priceSort === "low-high") return a.price - b.price;
      if (priceSort === "high-low") return b.price - a.price;
      return 0;
    });

  const hasActiveFilters =
    selectedCategory !== "all" ||
    priceSort !== "default" ||
    maxPrice !== "" ||
    stockFilter !== "all" ||
    searchFilter !== "";

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceSort("default");
    setMaxPrice("");
    setStockFilter("all");
    setSearchFilter("");
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id));
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

  const handleBulkStock = async (newStock: number) => {
    if (selectedIds.length === 0) return;
    const actionLabel = newStock === 0 ? "out of stock" : `in stock (quantity: ${newStock})`;
    if (!confirm(`Are you sure you want to mark ${selectedIds.length} products as ${actionLabel}?`)) return;

    setIsUpdatingStock(true);
    try {
      await bulkUpdateStock(selectedIds, newStock);
      setSelectedIds([]); // Clear selection after success
      router.refresh();
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock for selected products.");
    } finally {
      setIsUpdatingStock(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Admin Filters Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name, team, or category..."
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:border-black focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="min-w-[160px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 focus:border-black focus:outline-none"
            >
              <option value="all">ALL CATEGORIES</option>
              <option value="player-version">PLAYER VERSION</option>
              <option value="fan-version">FAN VERSION</option>
              <option value="sets">SETS / KIT</option>
              <option value="retro">RETRO</option>
              {uniqueCategories
                .filter(
                  (c) =>
                    !["player-version", "fan-version", "sets", "retro"].includes(
                      c.toLowerCase()
                    )
                )
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase().replace("-", " ")}
                  </option>
                ))}
            </select>
          </div>

          {/* Price Sort */}
          <div>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 focus:border-black focus:outline-none"
            >
              <option value="default">SORT BY PRICE</option>
              <option value="low-high">PRICE: LOW TO HIGH</option>
              <option value="high-low">PRICE: HIGH TO LOW</option>
            </select>
          </div>

          {/* Max Price */}
          <div className="w-28">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max ₹"
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold placeholder-gray-400 focus:border-black focus:outline-none"
            />
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 focus:border-black focus:outline-none"
            >
              <option value="all">ALL STOCK</option>
              <option value="in-stock">IN STOCK</option>
              <option value="out-of-stock">OUT OF STOCK</option>
            </select>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-700 hover:bg-red-100"
            >
              RESET
            </button>
          )}
        </div>

        {/* Filter Summary */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>
            Showing <strong className="text-black">{filteredProducts.length}</strong> of{" "}
            <strong className="text-black">{products.length}</strong> products
          </span>
          {selectedCategory !== "all" && (
            <span className="rounded bg-black px-2 py-0.5 text-[10px] font-bold text-[#f4c84a] uppercase">
              Filter: {selectedCategory.replace("-", " ")}
            </span>
          )}
        </div>
      </div>
      {/* Bulk Actions Bar */}
      {!isDeletedTab && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-6 py-3 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStock(0)}
              disabled={isUpdatingStock || isDeleting}
              className="flex items-center gap-2 rounded border border-amber-600 bg-amber-500 px-4 py-2 text-xs font-bold tracking-wider text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {isUpdatingStock ? "UPDATING..." : "MARK OUT OF STOCK"}
            </button>
            <button
              onClick={() => handleBulkStock(10)}
              disabled={isUpdatingStock || isDeleting}
              className="flex items-center gap-2 rounded border border-green-600 bg-green-600 px-4 py-2 text-xs font-bold tracking-wider text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {isUpdatingStock ? "UPDATING..." : "MARK IN STOCK"}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting || isUpdatingStock}
              className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-xs font-bold tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <Trash size={15} />
              {isDeleting ? "DELETING..." : "DELETE SELECTED"}
            </button>
          </div>
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
                    checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
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
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={isDeletedTab ? 5 : 6} className="px-6 py-8 text-center text-gray-500">
                  No products found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product: any) => (
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
