"use client";

import { useState, useEffect } from "react";
import { getSiteConfig, updateSiteConfig, uploadImages } from "@/lib/api";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    heroImage: "",
    deliveryCharge: 150,
    categories: [] as { name: string; href: string; image: string }[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await getSiteConfig(true);
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "hero" | number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const data = await uploadImages(e.target.files);
      if (data.urls && data.urls.length > 0) {
        if (type === "hero") {
          setConfig((prev) => ({ ...prev, heroImage: data.urls[0] }));
        } else {
          // type is the category index
          setConfig((prev) => {
            const newCategories = [...(prev.categories || [])];
            if (newCategories[type]) {
              newCategories[type] = { ...newCategories[type], image: data.urls[0] };
            }
            return { ...prev, categories: newCategories };
          });
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteConfig(config);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-black">
          Site Settings
        </h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-serif border-b pb-2">Hero Section</h2>
            
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-700">
                Hero Background Image
              </label>
              
              {config.heroImage && (
                <div className="relative mb-4 h-48 w-full max-w-lg overflow-hidden rounded border border-gray-200">
                  <Image src={config.heroImage} alt="Hero Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, heroImage: "" }))}
                    className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-500 shadow hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center w-full max-w-lg">
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <UploadCloud className="mb-2 text-gray-500" size={24} />
                    <p className="text-sm text-gray-500">
                      {uploading ? "Uploading..." : "Click to upload a new hero image"}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, "hero")} 
                    disabled={uploading} 
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-serif border-b pb-2">Homepage Categories</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {config.categories && config.categories.map((cat, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-700">
                    {cat.name} Image
                  </label>
                  
                  {cat.image ? (
                    <div className="relative mb-4 h-32 w-full overflow-hidden rounded border border-gray-200">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newCat = [...config.categories];
                          newCat[index].image = "";
                          setConfig(prev => ({ ...prev, categories: newCat }));
                        }}
                        className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-500 shadow hover:bg-gray-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        <UploadCloud className="mb-2 text-gray-500" size={24} />
                        <p className="text-xs text-gray-500 text-center px-2">
                          {uploading ? "Uploading..." : "Upload image"}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, index)} 
                        disabled={uploading} 
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-serif border-b pb-2">Checkout Settings</h2>
            
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-700">
                Delivery Charge (₹)
              </label>
              <input
                type="number"
                name="deliveryCharge"
                value={config.deliveryCharge}
                onChange={handleChange}
                min="0"
                className="w-full max-w-lg rounded border border-gray-300 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded bg-black px-8 py-3 text-sm font-bold tracking-wider text-[#f4c84a] transition-colors hover:bg-gray-900 disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE SETTINGS"}
          </button>
        </form>
      </div>
    </div>
  );
}
