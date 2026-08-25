import ProductCard from "./ProductCard";

const products = [
  {
    id: "classic-red-football-jersey",
    name: "Classic Red Football Jersey",
    price: 999,
    image: "/images/product-placeholder.jpg",
  },
  {
    id: "blue-football-jersey",
    name: "Blue Football Jersey",
    price: 999,
    image: "/public/images/logo.jpg",
  },
  {
    id: "white-football-jersey",
    name: "White Football Jersey",
    price: 1099,
    image: "/images/product-placeholder.jpg",
  },
  {
    id: "black-football-jersey",
    name: "Black Football Jersey",
    price: 999,
    image: "/images/product-placeholder.jpg",
  },
];

export default function ProductSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            Featured
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Featured Jerseys
          </h2>
        </div>

        <a
          href="/shop"
          className="hidden text-sm font-semibold underline underline-offset-4 sm:block"
        >
          View all
        </a>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}