"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { restoreProduct } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RestoreProductButton({ productId }: { productId: string }) {
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreProduct(productId);
      router.refresh(); 
    } catch (error: any) {
      alert("Failed to restore product: " + error.message);
      setIsRestoring(false);
    }
  };

  return (
    <button 
      onClick={handleRestore}
      disabled={isRestoring}
      className="flex items-center gap-2 rounded bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
      aria-label="Restore product"
    >
      <RotateCcw size={14} />
      Restore
    </button>
  );
}
