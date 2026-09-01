"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProduct, uploadImages, getSiteConfig } from "@/lib/api";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<{name: string, value: string}[]>([
    { name: "Player Version", value: "player-version" },
    { name: "Fan Version", value: "fan-version" },
    { name: "Retro", value: "retro" },
  ]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const configData = await getSiteConfig(true);
        if (configData.config && configData.config.categories) {
          const dynamicCategories = configData.config.categories.map((c: any) => ({
            name: c.name,
            value: c.href.split("=")[1] || c.name.toLowerCase().replace(/\s+/g, '-'),
          }));
          if (dynamicCategories.length > 0) {
            setCategories(dynamicCategories);
            // Also update initial form data if needed
            setFormData(prev => ({
              ...prev,
              category: prev.category === "player-version" ? dynamicCategories[0].value : prev.category
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load categories for form", e);
      }
    }
    fetchCategories();
  }, []);

  // sizes stored as [{ size: "M", stock: 10 }, ...]
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "player-version",
    price: "",
    originalPrice: "",
    images: [] as string[],
    featured: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- Size management ---
  const addSize = (size: string) => {
    const label = size.trim().toUpperCase();
    if (!label) return;
    if (sizes.find((s) => s.size === label)) return;
    setSizes((prev) => [...prev, { size: label, stock: 0 }]);
    setCustomSizeInput("");
  };

  const removeSize = (size: string) => {
    setSizes((prev) => prev.filter((s) => s.size !== size));
  };

  const updateStock = (size: string, stock: number) => {
    setSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, stock: Math.max(0, stock) } : s))
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const data = await uploadImages(e.target.files);
      
      setFormData(prev => {
        const currentImages = prev.images.length === 1 && prev.images[0] === "/images/products/placeholder.jpg" 
          ? [] 
          : prev.images;
          
        return {
          ...prev,
          images: [...currentImages, ...data.urls]
        };
      });
      
      const origSize = (data.originalSize / 1024).toFixed(1);
      const compSize = (data.compressedSize / 1024).toFixed(1);
      const saved = (100 - (data.compressedSize / data.originalSize) * 100).toFixed(1);
      
      alert(`Upload complete! Size compressed from ${origSize}KB to ${compSize}KB (Saved ${saved}%)`);
    } catch (error: any) {
      alert("Error uploading images: " + error.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const currentImages = formData.images || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const computedStock = sizes.reduce((sum, s) => sum + s.stock, 0);

      const productPayload = {
        name: formData.name,
        slug,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: computedStock,
        sizes,
        images: formData.images,
        image: formData.images[0] || "/images/products/placeholder.jpg",
        featured: formData.featured,
      };

      await createProduct(productPayload);
      alert("Product saved successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

  const availablePresets = PRESET_SIZES.filter((s) => !sizes.find((sz) => sz.size === s));

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="rounded-full bg-white p-2 shadow-sm border border-gray-200 text-gray-500 transition-colors hover:text-black">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-black">
            Add New Product
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-serif text-xl font-bold text-black">Basic Details</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none">
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                Feature this product on the homepage
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-serif text-xl font-bold text-black">Pricing & Inventory</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Original Price (₹) [Optional]</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" />
            </div>
            
            {/* Dynamic Sizes */}
            <div className="sm:col-span-2">
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Sizes &amp; Stock
              </label>

              {/* Quick-add preset buttons */}
              {availablePresets.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {availablePresets.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => addSize(sz)}
                      className="flex items-center gap-1 rounded border border-dashed border-gray-400 px-3 py-1 text-xs font-bold text-gray-600 hover:border-black hover:text-black transition-colors"
                    >
                      <Plus size={11} /> {sz}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom size input */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(customSizeInput); } }}
                  placeholder="Custom size (e.g. 38, 40, 42…)"
                  className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addSize(customSizeInput)}
                  className="flex items-center gap-1 rounded bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Active sizes with stock inputs */}
              {sizes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No sizes added yet. Use the buttons above to add sizes.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {sizes.map(({ size, stock }) => (
                    <div
                      key={size}
                      className="flex flex-col items-center gap-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-gray-700">{size}</span>
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => updateStock(size, parseInt(e.target.value, 10) || 0)}
                        min={0}
                        className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-black focus:outline-none"
                      />
                      <span className="text-[9px] text-gray-400 uppercase tracking-wide">qty</span>
                    </div>
                  ))}
                </div>
              )}
            </div>


            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Product Images</label>
              
              <div className="mb-4 flex flex-wrap gap-4">
                {currentImages.map((img, idx) => (
                  <div key={idx} className="relative h-24 w-24 overflow-hidden rounded border border-gray-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Product ${idx}`} className="h-full w-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <label className={`cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-sm font-bold tracking-wide text-gray-700 transition-colors hover:bg-gray-50 shadow-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? 'Uploading & Compressing...' : 'Upload Images'}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">The first image will be used as the main cover image. Images are automatically compressed to save space.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products" className="rounded border border-gray-300 bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded bg-black px-8 py-3 text-sm font-bold uppercase tracking-wide text-[#f4c84a] hover:bg-gray-900 disabled:opacity-50">
            <Save size={18} />
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
