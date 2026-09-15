import Link from "next/link";
import { Plus, TableProperties } from "lucide-react";
import { getProducts } from "@/lib/api";
import AdminProductTable from "@/components/admin/AdminProductTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string }>;
}) {
  const { tab, search } = await searchParams;
  const isDeletedTab = tab === "deleted";
  
  let queryStr = isDeletedTab ? "?showDeleted=true" : "?";
  if (search) {
    queryStr += `${isDeletedTab ? "&" : ""}search=${encodeURIComponent(search)}`;
  }
  
  const data = await getProducts(queryStr === "?" ? "" : queryStr, true);
  const products = data.products || [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-black">
          Products
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/admin/products"
            className={`border-b-2 px-1 pb-1 text-sm font-bold uppercase tracking-wider transition-colors ${
              !isDeletedTab ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
            }`}
          >
            Active
          </Link>
          <Link
            href="/admin/products?tab=deleted"
            className={`border-b-2 px-1 pb-1 text-sm font-bold uppercase tracking-wider transition-colors ${
              isDeletedTab ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
            }`}
          >
            Recently Deleted
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products/bulk"
            className="flex items-center justify-center gap-2 rounded border border-black bg-white px-5 py-3 text-sm font-bold tracking-wide text-black transition-colors hover:bg-gray-100"
          >
            <TableProperties size={18} />
            BULK FORM
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 rounded bg-black px-6 py-3 text-sm font-bold tracking-wide text-[#f4c84a] transition-colors hover:bg-gray-900"
          >
            <Plus size={18} />
            ADD PRODUCT
          </Link>
        </div>
      </div>

      <AdminProductTable products={products} isDeletedTab={isDeletedTab} />
    </div>
  );
}
