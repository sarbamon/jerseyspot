"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, Copy, Image as ImageIcon, CheckCircle, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProduct, uploadImages, getSiteConfig } from "@/lib/api";

interface BulkRow {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  sizesStr: string;
  imageFiles: File[];
  imageUrls: string[];
  uploadedUrls?: string[];
}

export default function BulkProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<{ name: string; value: string }[]>([
    { name: "Player Version", value: "player-version" },
    { name: "Fan Version", value: "fan-version" },
    { name: "Retro", value: "retro" },
    { name: "Sets", value: "sets" },
  ]);

  // Preset States
  const [presetCategory, setPresetCategory] = useState("player-version");
  const [presetPrice, setPresetPrice] = useState("1499");
  const [presetRegPrice, setPresetRegPrice] = useState("1999");
  const [presetSizesStr, setPresetSizesStr] = useState("S10, M15, L20, XL10");

  const createEmptyRow = (
    cat = presetCategory,
    price = presetPrice,
    regPrice = presetRegPrice,
    sizes = presetSizesStr
  ): BulkRow => ({
    id: Math.random().toString(36).substring(2, 9),
    name: "",
    category: cat,
    price: price,
    originalPrice: regPrice,
    sizesStr: sizes,
    imageFiles: [],
    imageUrls: [],
  });

  const [rows, setRows] = useState<BulkRow[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const configData = await getSiteConfig(true);
        if (configData.config && configData.config.categories) {
          const dynamicCats = configData.config.categories.map((c: any) => ({
            name: c.name,
            value: c.href.split("=")[1] || c.name.toLowerCase().replace(/\s+/g, "-"),
          }));
          if (dynamicCats.length > 0) {
            setCategories(dynamicCats);
            const firstCat = dynamicCats[0].value;
            setPresetCategory(firstCat);
            setRows([
              createEmptyRow(firstCat),
              createEmptyRow(firstCat),
              createEmptyRow(firstCat),
            ]);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      }
      setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
    }
    loadData();
  }, []);

  const handleAddRow = (count = 1) => {
    const defaultCat = categories[0]?.value || presetCategory;
    const newRows = Array.from({ length: count }, () =>
      createEmptyRow(defaultCat, presetPrice, presetRegPrice, presetSizesStr)
    );
    setRows((prev) => [...prev, ...newRows]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      alert("At least one row must remain.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDuplicateRow = (index: number) => {
    const target = rows[index];
    const cloned: BulkRow = {
      ...target,
      id: Math.random().toString(36).substring(2, 9),
      name: target.name ? `${target.name} (Copy)` : "",
      imageFiles: [...target.imageFiles],
      imageUrls: [...target.imageUrls],
    };
    const nextRows = [...rows];
    nextRows.splice(index + 1, 0, cloned);
    setRows(nextRows);
  };

  const handleRowChange = (id: string, field: keyof BulkRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleImagesSelect = (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));

    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            imageFiles: [...r.imageFiles, ...newFiles],
            imageUrls: [...r.imageUrls, ...newUrls],
          };
        }
        return r;
      })
    );
  };

  const handleRemoveImage = (id: string, imgIdx: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextFiles = [...r.imageFiles];
          const nextUrls = [...r.imageUrls];
          nextFiles.splice(imgIdx, 1);
          nextUrls.splice(imgIdx, 1);
          return {
            ...r,
            imageFiles: nextFiles,
            imageUrls: nextUrls,
          };
        }
        return r;
      })
    );
  };

  // Quick Preset Appliers
  const handleApplyCategoryToAll = (categoryValue: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, category: categoryValue })));
  };

  const handleApplyPriceToAll = (priceVal: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, price: priceVal })));
  };

  const handleApplyRegPriceToAll = (regPriceVal: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, originalPrice: regPriceVal })));
  };

  const handleApplySizesToAll = (sizesStr: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, sizesStr })));
  };

  const handleApplyAllPresets = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        category: presetCategory,
        price: presetPrice,
        originalPrice: presetRegPrice,
        sizesStr: presetSizesStr,
      }))
    );
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate filled rows
    const validRows = rows.filter((r) => r.name.trim() && r.price);
    if (validRows.length === 0) {
      setError("Please fill in at least one product with a Name and Price.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload images for rows that have image files
      const updatedRows = [...validRows];

      for (let i = 0; i < updatedRows.length; i++) {
        const row = updatedRows[i];
        if (row.imageFiles && row.imageFiles.length > 0) {
          try {
            const uploadRes = await uploadImages(row.imageFiles);
            if (uploadRes && uploadRes.urls && uploadRes.urls.length > 0) {
              row.uploadedUrls = uploadRes.urls;
            }
          } catch (err) {
            console.error(`Image upload failed for row ${i + 1}:`, err);
          }
        }
      }

      // 2. Format product payloads
      const productsPayload = updatedRows.map((row) => {
        // Parse sizes (e.g. "S10, M15, L20, XL10")
        const sizesArr: { size: string; stock: number }[] = [];
        let totalStock = 0;

        if (row.sizesStr) {
          const parts = row.sizesStr.split(/[,|;]+/).map((s) => s.trim());
          for (const part of parts) {
            if (!part) continue;
            let size = "";
            let stock = 0;
            const delimitedMatch = part.match(/^([a-zA-Z0-9\s]+?)\s*[:=\-\s]\s*(\d+)$/);
            const concatMatch = part.match(/^(\d*[a-zA-Z]+)(\d+)$/);

            if (delimitedMatch) {
              size = delimitedMatch[1].trim().toUpperCase();
              stock = parseInt(delimitedMatch[2], 10);
            } else if (concatMatch) {
              size = concatMatch[1].trim().toUpperCase();
              stock = parseInt(concatMatch[2], 10);
            } else if (/^[a-zA-Z0-9\s]+$/.test(part)) {
              size = part.toUpperCase();
              stock = 10;
            }

            if (size && !isNaN(stock)) {
              sizesArr.push({ size, stock });
              totalStock += stock;
            }
          }
        }

        // Combine uploaded URLs with non-blob URLs
        const existingNonBlobUrls = row.imageUrls.filter((u) => !u.startsWith("blob:"));
        const allUrls = [...(row.uploadedUrls || []), ...existingNonBlobUrls];
        const fallbackImage = "/images/products/placeholder.jpg";
        const mainImage = allUrls.length > 0 ? allUrls[0] : fallbackImage;
        const finalImages = allUrls.length > 0 ? allUrls : [fallbackImage];

        return {
          name: row.name.trim(),
          category: row.category,
          price: parseFloat(row.price),
          originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
          sizes: sizesArr,
          stock: totalStock,
          image: mainImage,
          images: finalImages,
          isActive: true,
        };
      });

      // 3. Batch create products
      await createProduct(productsPayload);

      setSuccess(`Successfully created ${productsPayload.length} product(s)! Redirecting...`);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err: any) {
      console.error("Bulk save error:", err);
      setError(err.message || "Failed to create products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl pb-20">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-black transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-wide text-black sm:text-3xl">
              Bulk Add Products
            </h1>
            <p className="text-xs text-gray-500">
              Fill in multiple products at once in a spreadsheet-like form for fast bulk creation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleAddRow(1)}
            className="flex items-center gap-1.5 rounded border border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-50"
          >
            <Plus size={16} /> Add Row
          </button>

          <button
            type="button"
            onClick={() => handleAddRow(5)}
            className="flex items-center gap-1.5 rounded border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-200"
          >
            <Plus size={16} /> Add 5 Rows
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* GLOBAL QUICK BATCH PRESETS */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            ⚡ Quick Batch Presets (Apply to all rows & auto-fill new rows)
          </p>
          <button
            type="button"
            onClick={handleApplyAllPresets}
            className="rounded bg-black px-3 py-1.5 text-xs font-bold text-[#f4c84a] hover:bg-gray-800 transition-colors"
          >
            APPLY ALL PRESETS TO ALL ROWS
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Preset */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Set All Category</label>
            <div className="flex gap-1.5">
              <select
                className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold focus:border-black focus:outline-none"
                value={presetCategory}
                onChange={(e) => setPresetCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleApplyCategoryToAll(presetCategory)}
                className="shrink-0 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100"
                title="Apply to all rows"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Default Price Preset */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Default Price (₹)</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                placeholder="1499"
                value={presetPrice}
                onChange={(e) => setPresetPrice(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold focus:border-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => handleApplyPriceToAll(presetPrice)}
                className="shrink-0 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100"
                title="Apply to all rows"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Default Reg. Price Preset */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Default Reg. Price (₹)</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                placeholder="1999"
                value={presetRegPrice}
                onChange={(e) => setPresetRegPrice(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold focus:border-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => handleApplyRegPriceToAll(presetRegPrice)}
                className="shrink-0 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100"
                title="Apply to all rows"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Default Sizes & Stock Preset */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Default Sizes & Stock</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="S10, M15, L20, XL10"
                value={presetSizesStr}
                onChange={(e) => setPresetSizesStr(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-mono focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleApplySizesToAll(presetSizesStr)}
                className="shrink-0 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100"
                title="Apply to all rows"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BULK FORM TABLE */}
      <form onSubmit={handleSubmitAll}>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-900 text-[11px] uppercase tracking-wider text-white">
              <tr>
                <th className="py-3.5 px-3 text-center w-12">#</th>
                <th className="py-3.5 px-3 min-w-[200px]">Product Name *</th>
                <th className="py-3.5 px-3 min-w-[150px]">Category *</th>
                <th className="py-3.5 px-3 min-w-[110px]">Price (₹) *</th>
                <th className="py-3.5 px-3 min-w-[110px]">Reg. Price (₹)</th>
                <th className="py-3.5 px-3 min-w-[180px]">Sizes & Stock (e.g. S10, M15)</th>
                <th className="py-3.5 px-3 min-w-[200px] text-center">Pictures</th>
                <th className="py-3.5 px-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* # */}
                  <td className="py-3 px-3 text-center font-mono text-xs font-bold text-gray-400">
                    {idx + 1}
                  </td>

                  {/* NAME */}
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      placeholder="e.g. Real Madrid Home 2026"
                      value={row.name}
                      onChange={(e) => handleRowChange(row.id, "name", e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium focus:border-black focus:outline-none"
                    />
                  </td>

                  {/* CATEGORY */}
                  <td className="py-3 px-3">
                    <select
                      value={row.category}
                      onChange={(e) => handleRowChange(row.id, "category", e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-black focus:border-black focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* PRICE */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="1499"
                      value={row.price}
                      onChange={(e) => handleRowChange(row.id, "price", e.target.value)}
                      className="w-full rounded border border-gray-300 px-2.5 py-2 text-sm font-bold text-black focus:border-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>

                  {/* ORIGINAL REGULAR PRICE */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="1999"
                      value={row.originalPrice}
                      onChange={(e) => handleRowChange(row.id, "originalPrice", e.target.value)}
                      className="w-full rounded border border-gray-300 px-2.5 py-2 text-sm text-gray-700 focus:border-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>

                  {/* SIZES & STOCK */}
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      placeholder="S10, M15, L20"
                      value={row.sizesStr}
                      onChange={(e) => handleRowChange(row.id, "sizesStr", e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
                    />
                  </td>

                  {/* PICTURES (MULTIPLE IMAGE SUPPORT) */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      {row.imageUrls.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[180px] p-1 border rounded bg-gray-50">
                          {row.imageUrls.map((url, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-gray-300 bg-white group"
                            >
                              <img
                                src={url}
                                alt={`preview ${imgIdx}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(row.id, imgIdx)}
                                className="absolute inset-0 flex items-center justify-center bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                title="Remove picture"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <label className="cursor-pointer rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1">
                        <ImageIcon size={14} />
                        <span>
                          {row.imageUrls.length > 0
                            ? `+ Add (${row.imageUrls.length})`
                            : "Select Pictures"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImagesSelect(row.id, e.target.files)}
                        />
                      </label>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(idx)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black"
                        title="Duplicate row"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAddRow(1)}
              className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-50"
            >
              <Plus size={16} /> Add Row
            </button>
            <span className="text-xs text-gray-400 font-medium">
              Total rows: <strong className="text-black">{rows.length}</strong> (Fill details & click Save All)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="rounded border border-gray-300 px-6 py-2.5 text-xs font-bold tracking-wider text-gray-700 hover:bg-gray-100"
            >
              CANCEL
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded bg-black px-8 py-2.5 text-xs font-bold tracking-widest text-[#f4c84a] transition-colors hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  CREATING PRODUCTS...
                </>
              ) : (
                <>
                  <Save size={16} />
                  SAVE ALL PRODUCTS
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
