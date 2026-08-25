type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <a href={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-medium">
            {product.name}
          </h3>

          <p className="mt-2 text-sm font-semibold">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
        </div>
      </a>
    </article>
  );
}