"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BulkUploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("csv", file);

    if (imageFiles && imageFiles.length > 0) {
      Array.from(imageFiles).forEach((img) => {
        formData.append("images", img);
      });
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("jerseyspot-admin-token");

      const res = await fetch(`${apiUrl}/products/bulk-upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        router.refresh();
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setError(data.message || "Failed to upload.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleHeader = "Name,Category,Price,Original Price,Size,Image,Description,Team,Season\n";
    const sampleRow1 = 'Argentina Home Jersey 2026,player-version,1499,1999,"S10, M15, L20, XL10",argentina.jpg,Official Argentina Football Jersey,Argentina,2026\n';
    const sampleRow2 = 'Brazil Home Jersey 2026,fan-version,1299,1799,"S5, M10, L15, XL5",brazil.jpg,Official Brazil Football Jersey,Brazil,2026\n';
    const csvContent = sampleHeader + sampleRow1 + sampleRow2;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 rounded border border-black bg-white px-6 py-3 text-sm font-bold tracking-wide text-black transition-colors hover:bg-gray-50"
      >
        <Upload size={18} />
        BULK UPLOAD
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            
            <h2 className="mb-2 font-serif text-2xl font-bold">Bulk Upload Products</h2>
            <p className="mb-4 text-xs text-gray-500">
              Upload your CSV file together with all your product photos in one click!
            </p>

            <div className="mb-4 rounded border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
              <span className="font-bold">✨ Direct Photo Upload:</span> You can select your CSV file AND all photo files on your computer together. They will automatically be uploaded to <strong>Cloudinary</strong> and attached to each product!
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">1. Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-gray-700 hover:file:bg-gray-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-bold text-gray-700">2. Select Product Photo Files (Optional)</label>
                <p className="mb-2 text-xs text-gray-500">Select all photo files from your folder (Hold Ctrl / Cmd to select multiple photos).</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-gray-700 hover:file:bg-gray-200"
                />
                {imageFiles && imageFiles.length > 0 && (
                  <p className="mt-2 text-xs font-semibold text-green-600">
                    ✓ {imageFiles.length} photo(s) selected for Cloudinary upload.
                  </p>
                )}
              </div>

              {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
              {success && <div className="mb-4 text-sm text-green-500">{success}</div>}

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="w-1/2 rounded border border-gray-300 py-3 text-xs font-bold tracking-wider text-gray-700 hover:bg-gray-100"
                >
                  DOWNLOAD SAMPLE CSV
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-1/2 rounded bg-black py-3 font-bold tracking-widest text-[#f4c84a] hover:bg-gray-900 disabled:opacity-50"
                >
                  {loading ? "UPLOADING TO CLOUDINARY..." : "UPLOAD ALL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
