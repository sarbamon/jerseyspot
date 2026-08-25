"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteProduct(productId);
        router.refresh(); // Refresh the Server Component page
      } catch (error: any) {
        alert("Failed to delete product: " + error.message);
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-gray-400 hover:text-red-600 disabled:opacity-50"
      aria-label="Delete product"
    >
      <Trash2 size={18} />
    </button>
  );
}
