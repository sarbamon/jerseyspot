import Image from "next/image";

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
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
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