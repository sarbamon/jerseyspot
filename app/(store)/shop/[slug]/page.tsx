import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/lib/api";
import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";

type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  team: string;
  season?: string;
  sizes: string[];
  stock: number;
  rating?: number;
  reviewsCount?: number;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: PageProps) {
  const { slug } = await params;

  // Pass true to disable Next.js caching so stock is always accurate in real-time
  const data = await getProduct(slug, true);
  const product: Product = data.product;

  const discount =
    product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-white text-black">

      {/* ================= BREADCRUMB ================= */}

      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center text-xs text-gray-500">

          <Link
            href="/"
            className="transition hover:text-black"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link
            href="/shop"
            className="transition hover:text-black"
          >
            Shop
          </Link>

          <span className="mx-2">/</span>

          <span className="text-black">
            {product.name}
          </span>

        </div>
      </div>

      {/* ================= PRODUCT ================= */}

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ================= PRODUCT IMAGE ================= */}

          <div className="relative">
            <ProductGallery 
              images={product.images && product.images.length > 0 ? product.images : [product.image]} 
              name={product.name} 
              discount={discount} 
            />
          </div>

          {/* ================= PRODUCT DETAILS ================= */}

          <div className="flex flex-col justify-center">

            {/* TEAM */}

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {product.team}
            </p>

            {/* PRODUCT NAME */}

            <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            {/* RATING */}

            {product.rating !== undefined && (
              <div className="mt-4 flex items-center gap-2 text-sm">

                <span className="tracking-wide">
                  {"★".repeat(
                    Math.round(product.rating)
                  )}
                </span>

                <span className="text-gray-500">
                  {product.rating}
                  {" "}
                  (
                  {product.reviewsCount || 0}
                  {" "}
                  reviews)
                </span>

              </div>
            )}

            {/* PRICE */}

            <div className="mt-6 flex flex-wrap items-center gap-3">

              <span className="text-2xl font-bold sm:text-3xl">
                ₹
                {product.price.toLocaleString("en-IN")}
              </span>

              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹
                    {product.originalPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                )}

            </div>

            {/* SAVING */}

            {product.originalPrice &&
              product.originalPrice > product.price && (
                <p className="mt-2 text-sm font-medium text-green-700">
                  You save ₹
                  {(
                    product.originalPrice -
                    product.price
                  ).toLocaleString("en-IN")}
                </p>
              )}

            {/* DESCRIPTION */}

            <div className="mt-6">

              <p className="max-w-xl leading-7 text-gray-600">
                {product.description}
              </p>

            </div>

            {/* SEASON */}

            {product.season && (
              <div className="mt-5 text-sm">
                <span className="font-semibold">
                  Season:
                </span>{" "}
                <span className="text-gray-600">
                  {product.season}
                </span>
              </div>
            )}

            {/* ================= INTERACTIVE ACTIONS ================= */}

            <ProductActions
              product={{
                _id: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                originalPrice:
                  product.originalPrice,
                image: product.image,
                team: product.team,
                sizes: product.sizes,
                stock: product.stock,
              }}
            />

            {/* ================= DELIVERY INFO ================= */}

            <div className="mt-8 border-t border-gray-200 pt-6">

              <div className="grid gap-5 sm:grid-cols-3">

                <div>
                  <p className="text-sm font-bold">
                    FAST DELIVERY
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Quick delivery across India.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold">
                    SECURE PAYMENT
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Safe and secure checkout.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold">
                    QUALITY GUARANTEE
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Quality jerseys from Jersey Spot.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}