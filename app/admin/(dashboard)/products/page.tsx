import Link from "next/link";
import Image from "next/image";
import { Plus, Edit } from "lucide-react";
import { getProducts } from "@/lib/api";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import RestoreProductButton from "@/components/admin/RestoreProductButton";

export const dynamic = "force-dynamic";
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isDeletedTab = tab === "deleted";
  
  const data = await getProducts(isDeletedTab ? "?showDeleted=true" : "", true);
  const products = data.products;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-black">
          Products
        </h1>
        <div className="flex flex-wrap gap-4">
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

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product._id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                          <Image src={product.image || "/placeholder.png"} alt={product.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-black">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.team}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase tracking-wider text-xs font-bold">
                      {product.category ? product.category.replace("-", " ") : "N/A"}
                    </td>
                    <td className="px-6 py-4 font-bold text-black">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      {isDeletedTab ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-800">
                          Deleted
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {isDeletedTab ? (
                          <RestoreProductButton productId={product._id} />
                        ) : (
                          <>
                            <Link href={`/admin/products/${product.slug}/edit`} className="text-gray-400 hover:text-black">
                              <Edit size={18} />
                            </Link>
                            <DeleteProductButton productId={product._id} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
