import Image from "next/image";
import { apiGetProduct } from "@/lib/api";
import { getProductImage } from "@/lib/images";
import AddToCart from "./AddToCart";

export default async function ProductDetails({ params }: { params: { id: string } }) {
  const product = await apiGetProduct(Number(params.id));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Image
        src={getProductImage(product?.id)}
        alt={String(product?.name || "Product image")}
        width={500}
        height={500}
        className="rounded object-cover"
        priority
      />

      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-600">{product.brand}</p>
        <p className="text-xl font-semibold mt-2">${product.price}</p>

        <AddToCart product={product} />
      </div>
    </div>
  );
}
