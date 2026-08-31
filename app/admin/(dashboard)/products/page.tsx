import Link from "next/link";
import { Plus, Search } from "lucide-react";
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

        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 rounded bg-black px-6 py-3 text-sm font-bold tracking-wide text-[#f4c84a] transition-colors hover:bg-gray-900"
        >
          <Plus size={18} />
          ADD PRODUCT
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form action="/admin/products" method="GET" className="relative max-w-md">
          {isDeletedTab && <input type="hidden" name="tab" value="deleted" />}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search products by name or team..."
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </form>
      </div>

      <AdminProductTable products={products} isDeletedTab={isDeletedTab} />
    </div>
  );
}
