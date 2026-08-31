"use client";

import { useState, useEffect } from "react";
import { getAds, createAd, updateAd, deleteAd, uploadImages } from "@/lib/api";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";

export default function AdsManagementPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [position, setPosition] = useState("orders_top");
  const [isActive, setIsActive] = useState(true);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await getAds();
      if (data.ads) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error("Failed to fetch ads", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ad: any = null) => {
    if (ad) {
      setEditingAd(ad);
      setName(ad.name);
      setLink(ad.link);
      setPosition(ad.position);
      setIsActive(ad.isActive);
      setImagePreview(ad.imageUrl);
    } else {
      setEditingAd(null);
      setName("");
      setLink("");
      setPosition("orders_top");
      setIsActive(true);
      setImagePreview("");
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = imagePreview;

      // Upload new image if selected
      if (imageFile) {
        const dt = new DataTransfer();
        dt.items.add(imageFile);
        const uploadResult = await uploadImages(dt.files);
        if (uploadResult.urls?.[0]) {
          imageUrl = uploadResult.urls[0];
        } else {
          throw new Error("Failed to upload image");
        }
      }

      if (!imageUrl) {
        alert("Please provide an image");
        setUploading(false);
        return;
      }

      const adData = {
        name,
        link,
        position,
        isActive,
        imageUrl
      };

      if (editingAd) {
        await updateAd(editingAd._id, adData);
      } else {
        await createAd(adData);
      }

      setIsModalOpen(false);
      fetchAds();
    } catch (error: any) {
      console.error("Error saving ad:", error);
      alert(error.message || "Failed to save ad");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await deleteAd(id);
      fetchAds();
    } catch (error: any) {
      alert(error.message || "Failed to delete ad");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-black">Ad Banners</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-black px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Create Ad
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad: any) => (
            <div key={ad._id} className={`rounded-xl overflow-hidden border ${ad.isActive ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-75'} shadow-sm flex flex-col`}>
              <div className="relative h-40 bg-black">
                <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" />
                {!ad.isActive && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Inactive</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{ad.name}</h3>
                <div className="text-xs text-gray-500 mb-2">Slot: <span className="font-mono text-gray-800">{ad.position}</span></div>
                <div className="text-xs text-blue-600 line-clamp-1 mb-4">{ad.link || "No Link"}</div>
                
                <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                  <button onClick={() => handleOpenModal(ad)} className="text-gray-500 hover:text-black flex items-center gap-1 text-sm font-medium transition">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(ad._id)} className="text-gray-400 hover:text-red-600 flex items-center gap-1 text-sm font-medium transition">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
              No ads found. Create one to get started!
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-serif text-xl font-bold">{editingAd ? "Edit Ad Banner" : "Create Ad Banner"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                
                {/* Image Upload */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Banner Image</label>
                  <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-black group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer" />
                    
                    {imagePreview ? (
                      <div className="relative h-32 w-full bg-black">
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                          <span className="text-white text-sm font-bold bg-black/50 px-3 py-1 rounded">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center text-gray-500 group-hover:text-black">
                        <ImageIcon size={32} className="mb-2" />
                        <span className="text-sm font-medium">Click or drag image to upload</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">Name (Internal Use)</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-black" placeholder="e.g. Axis Bank Promo" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">Destination Link URL</label>
                  <input type="text" value={link} onChange={e => setLink(e.target.value)} className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-black" placeholder="https://..." />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">Display Slot Position</label>
                  <select value={position} onChange={e => setPosition(e.target.value)} className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-black bg-white">
                    <option value="orders_top">Orders List (Top)</option>
                    <option value="orders_bottom">Order Details (Bottom)</option>
                    <option value="home_banner">Home Page (Not yet implemented)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
                  <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Ad is Active</label>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" disabled={uploading} className="rounded bg-black px-6 py-2 text-sm font-bold uppercase tracking-wider text-[#f4c84a] transition hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                  {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f4c84a] border-t-transparent"></span> : null}
                  {editingAd ? "Update Ad" : "Create Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
