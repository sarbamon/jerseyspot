import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import ProductWishlistButton from "@/components/ProductWishlistButton";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  team: string;
  category?: string;
  stock: number;
  sizes?: { size: string; stock: number }[];
  featured: boolean;
};

export default async function FeaturedProducts() {
  // Fetch products without any filters to just get the most recently added ones
  // We'll limit it to 4 or 8 items here since it's just for the homepage section
  const data = await getProducts("");

  const products: Product[] = data.products.slice(0, 8); // Limit to top 8 recent products

  return (
    <section className="bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-gray-500">
              JERSEY SPOT
            </p>

            <h2 className="font-serif text-3xl font-bold text-black sm:text-4xl">
              Featured Jerseys
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden border-b border-black pb-1 text-sm font-semibold text-black sm:block"
          >
            VIEW ALL
          </Link>
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => {
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
                      className={`object-cover transition duration-500 group-hover:scale-105 ${
                        isOutOfStock ? "opacity-75" : ""
                      }`}
                    />
                    <ProductWishlistButton product={product as any} />
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

        {/* MOBILE VIEW ALL */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-block border border-black px-8 py-3 text-sm font-bold tracking-wider text-black"
          >
            VIEW ALL
          </Link>
        </div>

      </div>
    </section>
  );
}