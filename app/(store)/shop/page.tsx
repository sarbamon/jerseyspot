import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import ShopFilters from "@/components/ShopFilters";
import ProductWishlistButton from "@/components/ProductWishlistButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Jerseys",
  description: "Browse our complete collection of premium football jerseys. From latest player versions to classic retro kits.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = params.category as string | undefined;
  const sort = params.sort as string | undefined;

  const categories = [
    { label: "Player Version", value: "player-version" },
    { label: "Fan Version", value: "fan-version" },
    { label: "Sets", value: "sets" },
    { label: "Retro", value: "retro" },
    { label: "Recommended", value: "recommended" },
    { label: "Clearance", value: "clearance" },
  ];

  let queryStr = "?";
  if (category) queryStr += `category=${category}&`;
  if (sort) queryStr += `sort=${sort}&`;

  let products = [];
  try {
    const data = await getProducts(queryStr);
    products = data.products || [];
  } catch (error) {
    console.error("Shop fetch error:", error);
  }

  const selectedCategoryLabel = categories.find(c => c.value === category)?.label || "All Jerseys";

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[1420px]">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end lg:mb-8">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Catalog</p>
            <h1 className="font-serif text-4xl font-black uppercase tracking-wider lg:text-5xl">{selectedCategoryLabel}</h1>
          </div>
        </div>

        <ShopFilters 
          currentCategory={category}
          currentSort={sort}
          categories={categories}
        />

        {/* PRODUCT GRID */}
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {products.length} {products.length === 1 ? "product" : "products"} found
              </p>
            </div>

            {products.length === 0 ? (
              <div className="border py-20 text-center">
                <p className="text-gray-500">No products match your filters.</p>
                <Link
                  href="/shop"
                  className="mt-6 inline-block bg-black px-6 py-3 text-sm font-bold text-[#f4c84a]"
                >
                  CLEAR FILTERS
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-0 border-l border-t border-gray-200 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product: any) => (
                  <Link
                    key={product._id}
                    href={`/shop/${product.slug}`}
                    className="group flex flex-col border-b border-r border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    {/* TOP ROW: Category & Price */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                        {product.category.replace("-version", "").replace("-", " ")}
                      </div>
                      <div className="flex flex-col items-end sm:flex-row sm:items-center sm:gap-1.5">
                        <span className="text-sm font-bold text-black sm:text-base">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* IMAGE */}
                    <div className="relative mb-6 flex w-full flex-1 items-center justify-center overflow-hidden">
                      <div className="relative w-full max-w-[160px] aspect-[4/5] sm:max-w-[200px]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        <ProductWishlistButton product={product} />
                      </div>
                    </div>

                    {/* BOTTOM ROW: Title & Subtext */}
                    <div className="mt-auto">
                      <h3 className="line-clamp-2 font-serif text-[13px] font-bold uppercase leading-tight text-black sm:text-sm">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-[9px] uppercase tracking-widest text-gray-400 sm:text-[10px]">
                        {product.team || "NEW"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
      </div>
    </main>
  );
}
