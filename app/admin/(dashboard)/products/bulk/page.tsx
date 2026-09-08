"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, Copy, Upload, Image as ImageIcon, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProduct, uploadImages, getSiteConfig } from "@/lib/api";

interface BulkRow {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  sizesStr: string;
  imageFile: File | null;
  imageUrl: string;
  uploading?: boolean;
}

const DEFAULT_SIZES = "S10, M15, L20, XL10";

export default function BulkProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string; value: string }[]>([
    { name: "Player Version", value: "player-version" },
    { name: "Fan Version", value: "fan-version" },
    { name: "Retro", value: "retro" },
    { name: "Sets", value: "sets" },
  ]);

  const createEmptyRow = (defaultCat = "player-version"): BulkRow => ({
    id: Math.random().toString(36).substring(2, 9),
    name: "",
    category: defaultCat,
    price: "",
    originalPrice: "",
    sizesStr: DEFAULT_SIZES,
    imageFile: null,
    imageUrl: "",
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
            setRows([
              createEmptyRow(dynamicCats[0].value),
              createEmptyRow(dynamicCats[0].value),
              createEmptyRow(dynamicCats[0].value),
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
    const defaultCat = categories[0]?.value || "player-version";
    const newRows = Array.from({ length: count }, () => createEmptyRow(defaultCat));
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

  const handleImageSelect = async (id: string, file: File | null) => {
    if (!file) return;

    // Show instant local preview
    const previewUrl = URL.createObjectURL(file);
    handleRowChange(id, "imageFile", file);
    handleRowChange(id, "imageUrl", previewUrl);
  };

  const handleApplyCategoryToAll = (categoryValue: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, category: categoryValue })));
  };

  const handleApplySizesToAll = (sizesStr: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, sizesStr })));
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
        if (row.imageFile) {
          try {
            const formData = new FormData();
            formData.append("images", row.imageFile);
            const uploadRes = await uploadImages([row.imageFile]);
            if (uploadRes && uploadRes.urls && uploadRes.urls[0]) {
              row.imageUrl = uploadRes.urls[0];
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
            const match = part.match(/^([a-zA-Z0-9]+)\s*[:=\-]?\s*(\d+)$/);
            if (match) {
              const size = match[1].toUpperCase();
              const stock = parseInt(match[2], 10);
              sizesArr.push({ size, stock });
              totalStock += stock;
            }
          }
        }

        const fallbackImage = "/images/products/placeholder.jpg";
        const finalImage = row.imageUrl && !row.imageUrl.startsWith("blob:") ? row.imageUrl : fallbackImage;

        return {
          name: row.name.trim(),
          category: row.category,
          price: parseFloat(row.price),
          originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
          sizes: sizesArr,
          stock: totalStock,
          image: finalImage,
          images: [finalImage],
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

      {/* GLOBAL QUICK APPLIERS */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
          ⚡ Quick Batch Presets (Apply to All Rows)
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Set All Categories:</span>
            <select
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold focus:outline-none"
              onChange={(e) => handleApplyCategoryToAll(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Select category...</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Set All Sizes & Stock:</span>
            <button
              type="button"
              onClick={() => handleApplySizesToAll(DEFAULT_SIZES)}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold hover:bg-gray-100"
            >
              Default (S10, M15, L20, XL10)
            </button>
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
                <th className="py-3.5 px-3 w-32">Price (₹) *</th>
                <th className="py-3.5 px-3 w-32">Reg. Price (₹)</th>
                <th className="py-3.5 px-3 min-w-[180px]">Sizes & Stock (e.g. S10, M15)</th>
                <th className="py-3.5 px-3 w-44 text-center">Picture</th>
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
                      placeholder="1499"
                      value={row.price}
                      onChange={(e) => handleRowChange(row.id, "price", e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-bold text-black focus:border-black focus:outline-none"
                      min="0"
                    />
                  </td>

                  {/* ORIGINAL PRICE */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      placeholder="1999"
                      value={row.originalPrice}
                      onChange={(e) => handleRowChange(row.id, "originalPrice", e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-500 focus:border-black focus:outline-none"
                      min="0"
                    />
                  </td>

                  {/* SIZES */}
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      placeholder="S10, M15, L20"
                      value={row.sizesStr}
                      onChange={(e) => handleRowChange(row.id, "sizesStr", e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-xs font-mono focus:border-black focus:outline-none"
                    />
                  </td>

                  {/* PICTURE */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {row.imageUrl ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded border border-gray-300 bg-gray-100">
                          <img
                            src={row.imageUrl}
                            alt="preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleRowChange(row.id, "imageFile", null);
                              handleRowChange(row.id, "imageUrl", "");
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity hover:opacity-100"
                            title="Remove picture"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : null}

                      <label className="cursor-pointer rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1">
                        <ImageIcon size={14} />
                        <span>{row.imageUrl ? "Change" : "Select"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageSelect(row.id, e.target.files?.[0] || null)}
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
