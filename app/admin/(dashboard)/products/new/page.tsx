"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProduct, uploadImages } from "@/lib/api";

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    team: "",
    category: "player-version",
    price: "",
    originalPrice: "",
    stock: 10,
    sizes: "S, M, L, XL, XXL",
    images: "/images/products/placeholder.jpg",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const data = await uploadImages(e.target.files);
      const newUrls = data.urls.join(", ");
      setFormData(prev => ({
        ...prev,
        images: prev.images === "/images/products/placeholder.jpg" || !prev.images 
          ? newUrls 
          : `${prev.images}, ${newUrls}`
      }));
      
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

  const currentImages = formData.images ? formData.images.split(",").map(i => i.trim()).filter(Boolean) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      
      const productPayload = {
        name: formData.name,
        slug: slug,
        team: formData.team,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        sizes: formData.sizes.split(",").map(s => s.trim()),
        images: formData.images.split(",").map(i => i.trim()),
        image: formData.images.split(",").map(i => i.trim())[0] || "/images/products/placeholder.jpg",
      };

      await createProduct(productPayload);
      alert("Product saved successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

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
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Team / Country</label>
              <input type="text" name="team" value={formData.team} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none">
                <option value="player-version">player-version</option>
                <option value="fan-version">fan-version</option>
                <option value="retro">retro</option>
                <option value="clearance">clearance</option>
              </select>
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
            
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" required />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">Sizes (Comma separated)</label>
              <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none" />
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
                      onClick={() => setFormData(prev => ({ ...prev, images: currentImages.filter((_, i) => i !== idx).join(", ") }))}
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
