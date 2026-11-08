"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash, Tag, Check, RefreshCw, Pencil, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteProductButton from "./DeleteProductButton";
import RestoreProductButton from "./RestoreProductButton";
import { bulkDeleteProducts, bulkUpdateStock, bulkUpdateCategory, bulkUpdateProducts } from "@/lib/api";

function formatSizesToString(sizes: any[]): string {
  if (!sizes || !Array.isArray(sizes) || sizes.length === 0) return "";
  return sizes.map((s) => `${s.size.toLowerCase()}${s.stock}`).join(" ");
}

function parseSizesInput(str: string): { size: string; stock: number }[] {
  if (!str || typeof str !== "string") return [];
  const parts = str.split(/[,|;\s]+/).map((s) => s.trim()).filter(Boolean);
  const result: { size: string; stock: number }[] = [];
  for (const part of parts) {
    const concatMatch = part.match(/^([a-zA-Z]+)(\d+)$/);
    const delimitedMatch = part.match(/^([a-zA-Z0-9]+?)\s*[:=\-]\s*(\d+)$/);
    if (concatMatch) {
      result.push({ size: concatMatch[1].toUpperCase(), stock: parseInt(concatMatch[2], 10) });
    } else if (delimitedMatch) {
      result.push({ size: delimitedMatch[1].toUpperCase(), stock: parseInt(delimitedMatch[2], 10) });
    }
  }
  return result;
}

export default function AdminProductTable({
  products,
  isDeletedTab,
}: {
  products: any[];
  isDeletedTab: boolean;
}) {
  const router = useRouter();
  const [localProducts, setLocalProducts] = useState<any[]>(products);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Bulk Edit Mode (Only active when user clicks "BULK EDIT")
  const [isBulkEditMode, setIsBulkEditMode] = useState<boolean>(false);
  const [edits, setEdits] = useState<{
    [id: string]: { name?: string; category?: string; sizesStr?: string };
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Batch Toolbar States
  const [batchCategory, setBatchCategory] = useState<string>("player-version");
  const [batchSizesStr, setBatchSizesStr] = useState<string>("");

  // Sync when prop products change
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<string>("default"); // default, low-high, high-low
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<string>("all"); // all, in-stock, out-of-stock
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Extract unique categories from products list
  const uniqueCategories = Array.from(
    new Set(localProducts.map((p) => p.category).filter(Boolean))
  );

  // Filter & Sort Logic
  const filteredProducts = localProducts
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

  // Field Edit in Bulk Edit Mode
  const handleFieldEdit = (id: string, field: "name" | "category" | "sizesStr", value: any) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Apply Batch Category to all selected rows
  const handleApplyBatchCategory = () => {
    if (selectedIds.length === 0) return;
    setEdits((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = { ...next[id], category: batchCategory };
      });
      return next;
    });
  };

  // Apply Batch Stock (e.g. "m5 l5 xl5") to all selected rows
  const handleApplyBatchStock = () => {
    if (selectedIds.length === 0 || !batchSizesStr.trim()) return;
    setEdits((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = { ...next[id], sizesStr: batchSizesStr.trim() };
      });
      return next;
    });
  };

  // Cancel Bulk Edit Mode
  const handleCancelBulkEdit = () => {
    setEdits({});
    setIsBulkEditMode(false);
  };

  // Save All Changes from Bulk Edit Mode
  const handleSaveBulkEdits = async () => {
    const editKeys = Object.keys(edits);
    if (editKeys.length === 0) {
      setIsBulkEditMode(false);
      return;
    }

    const updates = editKeys.map((id) => {
      const updatePayload: any = { _id: id };
      if (edits[id].name !== undefined) updatePayload.name = edits[id].name;
      if (edits[id].category !== undefined) updatePayload.category = edits[id].category;
      if (edits[id].sizesStr !== undefined) {
        updatePayload.sizesStr = edits[id].sizesStr;
        const parsed = parseSizesInput(edits[id].sizesStr || "");
        updatePayload.sizes = parsed;
        updatePayload.stock = parsed.reduce((sum, s) => sum + s.stock, 0);
      }
      return updatePayload;
    });

    setIsSaving(true);
    try {
      await bulkUpdateProducts(updates);

      // Update local products state
      setLocalProducts((prev) =>
        prev.map((p) => {
          if (edits[p._id]) {
            const updated = { ...p };
            if (edits[p._id].name !== undefined) updated.name = edits[p._id].name;
            if (edits[p._id].category !== undefined) updated.category = edits[p._id].category;
            if (edits[p._id].sizesStr !== undefined) {
              const parsed = parseSizesInput(edits[p._id].sizesStr || "");
              updated.sizes = parsed;
              updated.stock = parsed.reduce((sum, s) => sum + s.stock, 0);
            }
            return updated;
          }
          return p;
        })
      );

      setStatusMessage({
        text: `Successfully updated ${updates.length} products!`,
        type: "success",
      });
      setEdits({});
      setIsBulkEditMode(false);
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save bulk edits:", error);
      setStatusMessage({
        text: error.message || "Failed to save product updates.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    setIsDeleting(true);
    try {
      await bulkDeleteProducts(selectedIds);
      setLocalProducts((prev) => prev.filter((p) => !selectedIds.includes(p._id)));
      setSelectedIds([]);
      setStatusMessage({ text: "Products successfully deleted.", type: "success" });
      router.refresh();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
      setStatusMessage({ text: "Failed to delete products.", type: "error" });
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
      setLocalProducts((prev) =>
        prev.map((p) =>
          selectedIds.includes(p._id)
            ? {
                ...p,
                stock: newStock,
                sizes: (p.sizes || []).map((s: any) => ({ ...s, stock: newStock })),
              }
            : p
        )
      );
      setSelectedIds([]);
      setStatusMessage({ text: `Stock updated for ${selectedIds.length} products.`, type: "success" });
      router.refresh();
    } catch (error) {
      console.error("Failed to update stock:", error);
      setStatusMessage({ text: "Failed to update stock for selected products.", type: "error" });
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const editedCount = Object.keys(edits).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Status Message */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between border-b px-6 py-3 text-xs font-bold ${
            statusMessage.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-black font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Toolbar: Filters + Bulk Edit Toggle */}
      <div className="border-b border-gray-200 bg-gray-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Live Search */}
            <div className="min-w-[200px] flex-1">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by name, team, or category..."
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:border-black focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="min-w-[150px]">
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
                <option value="clearance">CLEARANCE</option>
                {uniqueCategories
                  .filter(
                    (c) =>
                      !["player-version", "fan-version", "sets", "retro", "clearance"].includes(
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
            <div className="w-24">
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

          {/* Right: Bulk Edit Toggle Button */}
          {!isDeletedTab && (
            <div>
              {!isBulkEditMode ? (
                <button
                  type="button"
                  onClick={() => setIsBulkEditMode(true)}
                  className="flex items-center gap-2 rounded border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-800"
                >
                  <Pencil size={14} />
                  BULK EDIT
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveBulkEdits}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-800 disabled:opacity-50"
                  >
                    <Save size={14} />
                    {isSaving ? "SAVING..." : `SAVE CHANGES ${editedCount > 0 ? `(${editedCount})` : ""}`}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelBulkEdit}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <X size={14} />
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Summary */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>
            Showing <strong className="text-black">{filteredProducts.length}</strong> of{" "}
            <strong className="text-black">{localProducts.length}</strong> products
          </span>
          {isBulkEditMode && (
            <span className="rounded bg-black px-2.5 py-1 text-[11px] font-bold text-[#f4c84a] uppercase tracking-wider">
              BULK EDIT MODE ACTIVE — Edit Name, Category, or Stock (e.g. m5 l5 xl5)
            </span>
          )}
        </div>
      </div>

      {/* Bulk Edit Batch Action Bar (Appears when Bulk Edit Mode is ON) */}
      {isBulkEditMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-100 border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Batch Quick Apply ({selectedIds.length} selected):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Batch Category */}
            <div className="flex items-center gap-1.5 rounded border border-gray-300 bg-white p-1">
              <Tag size={13} className="ml-1 text-gray-500 shrink-0" />
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                className="bg-transparent text-xs font-bold uppercase tracking-wider text-gray-800 focus:outline-none py-1 px-1 cursor-pointer"
              >
                <option value="player-version">Player Version</option>
                <option value="fan-version">Fan Version</option>
                <option value="sets">Sets / Kit</option>
                <option value="retro">Retro</option>
                <option value="clearance">Clearance</option>
                {uniqueCategories
                  .filter(
                    (c) =>
                      !["player-version", "fan-version", "sets", "retro", "clearance"].includes(
                        c.toLowerCase()
                      )
                  )
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase().replace("-", " ")}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleApplyBatchCategory}
                disabled={selectedIds.length === 0}
                className="rounded border border-gray-300 bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-800 hover:bg-gray-200 disabled:opacity-40"
              >
                Set Category
              </button>
            </div>

            {/* Batch Stock by Sizes (e.g. "m5 l5 xl5") */}
            <div className="flex items-center gap-1.5 rounded border border-gray-300 bg-white p-1">
              <input
                type="text"
                placeholder="e.g. m5 l5 xl5"
                value={batchSizesStr}
                onChange={(e) => setBatchSizesStr(e.target.value)}
                className="w-32 bg-transparent text-xs font-mono font-bold text-gray-800 focus:outline-none py-1 px-2"
              />
              <button
                type="button"
                onClick={handleApplyBatchStock}
                disabled={selectedIds.length === 0 || !batchSizesStr.trim()}
                className="rounded border border-gray-300 bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-800 hover:bg-gray-200 disabled:opacity-40"
              >
                Set Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Normal Selection Actions Bar (When not in bulk edit mode, but rows selected) */}
      {!isDeletedTab && !isBulkEditMode && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-100 px-6 py-3 border-b border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
            {selectedIds.length} SELECTED
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStock(0)}
              disabled={isUpdatingStock || isDeleting}
              className="flex items-center gap-1.5 rounded border border-amber-600 bg-amber-500 px-3 py-1.5 text-xs font-bold tracking-wider text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {isUpdatingStock ? "Updating..." : "Out of Stock"}
            </button>
            <button
              onClick={() => handleBulkStock(10)}
              disabled={isUpdatingStock || isDeleting}
              className="flex items-center gap-1.5 rounded border border-green-600 bg-green-600 px-3 py-1.5 text-xs font-bold tracking-wider text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {isUpdatingStock ? "Updating..." : "In Stock"}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting || isUpdatingStock}
              className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-xs font-bold tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <Trash size={14} />
              {isDeleting ? "Deleting..." : "Delete"}
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
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                    checked={
                      selectedIds.length > 0 && selectedIds.length === filteredProducts.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th className="px-6 py-4 min-w-[280px]">Product Name</th>
              <th className="px-6 py-4 min-w-[180px]">Category</th>
              <th className="px-6 py-4 min-w-[100px]">Price</th>
              <th className="px-6 py-4 min-w-[220px]">Stock (Sizes)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={isDeletedTab ? 5 : 6}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No products found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product: any) => {
                const isRowEdited = !!edits[product._id];
                const currentName = edits[product._id]?.name ?? product.name;
                const currentCategory = edits[product._id]?.category ?? product.category ?? "player-version";
                
                // Size stock as string, e.g. "m5 l5 xl5"
                const defaultSizesStr = formatSizesToString(product.sizes);
                const currentSizesStr = edits[product._id]?.sizesStr !== undefined 
                  ? edits[product._id].sizesStr 
                  : defaultSizesStr;
                const parsedSizes = parseSizesInput(currentSizesStr || "");
                const parsedTotal = parsedSizes.reduce((sum, s) => sum + s.stock, 0);

                return (
                  <tr
                    key={product._id}
                    className={`transition-colors ${
                      isRowEdited
                        ? "bg-gray-50 border-l-2 border-l-black"
                        : selectedIds.includes(product._id)
                        ? "bg-gray-50"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    {!isDeletedTab && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => toggleSelect(product._id)}
                        />
                      </td>
                    )}

                    {/* PRODUCT NAME COLUMN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100 border border-gray-200">
                          <Image
                            src={product.image || "/placeholder.png"}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {isBulkEditMode ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={currentName}
                                onChange={(e) =>
                                  handleFieldEdit(product._id, "name", e.target.value)
                                }
                                placeholder="Jersey Name"
                                className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-black focus:border-black focus:outline-none"
                              />
                              {isRowEdited && (
                                <span className="inline-block rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-[#f4c84a] uppercase tracking-wider">
                                  Edited
                                </span>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-black leading-snug">{product.name}</div>
                              {product.team && (
                                <div className="text-xs text-gray-500">{product.team}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY COLUMN */}
                    <td className="px-6 py-4">
                      {isBulkEditMode ? (
                        <select
                          value={currentCategory}
                          onChange={(e) =>
                            handleFieldEdit(product._id, "category", e.target.value)
                          }
                          className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-800 focus:border-black focus:outline-none cursor-pointer"
                        >
                          <option value="player-version">Player Version</option>
                          <option value="fan-version">Fan Version</option>
                          <option value="sets">Sets / Kit</option>
                          <option value="retro">Retro</option>
                          <option value="clearance">Clearance</option>
                          {uniqueCategories
                            .filter(
                              (c) =>
                                ![
                                  "player-version",
                                  "fan-version",
                                  "sets",
                                  "retro",
                                  "clearance",
                                ].includes(c.toLowerCase())
                            )
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat.toUpperCase().replace("-", " ")}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="inline-block rounded bg-gray-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gray-800">
                          {product.category ? product.category.replace("-", " ") : "N/A"}
                        </span>
                      )}
                    </td>

                    {/* PRICE COLUMN */}
                    <td className="px-6 py-4 font-bold text-black">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>

                    {/* STOCK (SIZES) COLUMN */}
                    <td className="px-6 py-4">
                      {isBulkEditMode ? (
                        <div className="space-y-1 max-w-[260px]">
                          <input
                            type="text"
                            value={currentSizesStr}
                            onChange={(e) =>
                              handleFieldEdit(product._id, "sizesStr", e.target.value)
                            }
                            placeholder="e.g. m5 l5 xl5"
                            className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-black focus:border-black focus:outline-none"
                          />
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold px-0.5">
                            <span>Total: <strong className="text-black">{parsedTotal}</strong> units</span>
                            <span className="text-gray-400">e.g. m5 l5 xl5</span>
                          </div>
                        </div>
                      ) : isDeletedTab ? (
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

                    {/* ACTIONS COLUMN */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {isDeletedTab ? (
                          <RestoreProductButton productId={product._id} />
                        ) : (
                          <>
                            <Link
                              href={`/admin/products/${product.slug}/edit`}
                              className="text-gray-400 hover:text-black transition-colors"
                              title="Full Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            <DeleteProductButton productId={product._id} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
