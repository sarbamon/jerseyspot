import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import ShopFilters from "@/components/ShopFilters";
import ProductWishlistButton from "@/components/ProductWishlistButton";
import Pagination from "@/components/Pagination";
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
  const pageStr = params.page as string | undefined;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  let siteCategories: { label: string; value: string }[] = [];
  try {
    // We import getSiteConfig at the top if needed (it is already imported usually, wait let me check imports)
    const { getSiteConfig } = await import("@/lib/api");
    const configData = await getSiteConfig(true);
    if (configData.config && configData.config.categories) {
      siteCategories = configData.config.categories.map((c: any) => ({
        label: c.name,
        // extract the value from href, e.g. "/shop?category=foo" -> "foo"
        value: c.href.split("=")[1] || c.name.toLowerCase().replace(/\s+/g, '-'),
      }));
    }
  } catch (err) {
    console.error("Failed to load shop categories:", err);
  }

  // Fallback if none
  if (siteCategories.length === 0) {
    siteCategories = [
      { label: "Player Version", value: "player-version" },
      { label: "Fan Version", value: "fan-version" },
      { label: "Sets", value: "sets" },
      { label: "Retro", value: "retro" },
      { label: "Recommended", value: "recommended" },
    ];
  }
  const categories = siteCategories;

  let queryStr = "?limit=35&";
  if (category) queryStr += `category=${category}&`;
  if (sort) queryStr += `sort=${sort}&`;
  if (page) queryStr += `page=${page}&`;

  let products = [];
  let totalPages = 1;
  let currentPage = 1;
  let totalProducts = 0;
  try {
    const data = await getProducts(queryStr);
    products = data.products || [];
    totalPages = data.pages || 1;
    currentPage = data.page || 1;
    totalProducts = data.total || products.length;
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
                {totalProducts > products.length 
                  ? `Showing ${products.length} of ${totalProducts} products` 
                  : `${products.length} ${products.length === 1 ? "product" : "products"} found`}
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                {products.map((product: any) => {
                  const isOutOfStock =
                    product.stock <= 0 ||
                    (product.sizes &&
                      product.sizes.length > 0 &&
                      product.sizes.every((s: any) => s.stock <= 0));

                  return (
                    <Link
                      key={product._id}
                      href={`/shop/${product.slug}`}
                      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
                    >
                      {/* TOP ROW: Category & Out of Stock */}
                      <div className="mb-3 flex items-center justify-between min-h-[24px]">
                        <div className="border border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black rounded-sm">
                          {product.category
                            ? product.category.replace("-version", "").replace("-", " ")
                            : "JERSEY"}
                        </div>
                        {isOutOfStock ? (
                          <span className="rounded bg-red-100 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                            OUT OF STOCK
                          </span>
                        ) : null}
                      </div>

                      {/* IMAGE */}
                      <div className="relative mb-4 flex w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-gray-50/50 p-2">
                        <div className="relative w-full max-w-[160px] aspect-[4/5] sm:max-w-[200px]">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className={`object-contain transition duration-500 group-hover:scale-105 ${
                              isOutOfStock ? "opacity-75" : ""
                            }`}
                          />
                          <ProductWishlistButton product={product} />
                        </div>
                      </div>

                      {/* BOTTOM ROW: Title & Price Brought Down */}
                      <div className="mt-auto space-y-1">
                        <h3 className="line-clamp-2 font-serif text-[13px] font-bold uppercase leading-tight text-black sm:text-sm">
                          {product.name}
                        </h3>
                        {product.team ? (
                          <p className="text-[9px] uppercase tracking-widest text-gray-400 sm:text-[10px]">
                            {product.team}
                          </p>
                        ) : product.createdAt &&
                          Date.now() - new Date(product.createdAt).getTime() <
                            7 * 24 * 60 * 60 * 1000 ? (
                          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 sm:text-[10px]">
                            NEW
                          </p>
                        ) : null}

                        {/* PRICE MOVED TO BOTTOM */}
                        <div className="mt-2 flex items-center gap-2 pt-1 border-t border-gray-100">
                          <span className="text-base font-black text-black">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{product.originalPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </div>
      </div>
    </main>
  );
}
