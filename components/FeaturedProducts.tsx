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
  featured: boolean;
};

export default async function FeaturedProducts() {
  // Fetch products without any filters to just get the most recently added ones
  // We'll limit it to 4 or 8 items here since it's just for the homepage section
  const data = await getProducts("", true);

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
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/shop/${product.slug}`}
              className="group"
            >
              {/* IMAGE */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] font-bold tracking-wider text-[#f4c84a]">
                      SALE
                    </span>
                  )}
                
                <ProductWishlistButton product={product as any} />
              </div>

              {/* DETAILS */}
              <div className="pt-4">
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                  {product.team}
                </p>

                <h3 className="line-clamp-2 font-serif text-sm font-bold text-black sm:text-base">
                  {product.name}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-black">
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
          ))}
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