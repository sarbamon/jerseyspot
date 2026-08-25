import { getProduct } from "@/lib/api";
import EditProductForm from "@/components/admin/EditProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let product = null;
  try {
    const data = await getProduct(slug, true);
    product = data.product;
  } catch (error) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-4 text-gray-500">The product you are trying to edit does not exist.</p>
      </div>
    );
  }

  return <EditProductForm product={product} />;
}
