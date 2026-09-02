"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BulkUploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            
            <h2 className="mb-4 font-serif text-2xl font-bold">Bulk Upload CSV</h2>
            
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>

              {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
              {success && <div className="mb-4 text-sm text-green-500">{success}</div>}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full rounded bg-black py-3 font-bold tracking-widest text-[#f4c84a] hover:bg-gray-900 disabled:opacity-50"
              >
                {loading ? "UPLOADING..." : "UPLOAD"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
