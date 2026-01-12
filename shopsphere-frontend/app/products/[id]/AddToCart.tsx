"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string | number;
  name: string;
  brand: string;
  price: number;
};

export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const productId = Number(product.id); 

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2">
        <label htmlFor="qty" className="text-sm font-medium">
          Quantity
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-20 rounded border px-2 py-1 focus-visible:ring"
        />
      </div>

      <button
        onClick={() =>
          add(
            {
              productId,
              name: product.name,
              brand: product.brand,
              price: product.price,
            },
            qty
          )
        }
        className="rounded border px-4 py-2 focus-visible:ring"
        aria-label={`Add ${product.name} to cart`}
      >
        Add to cart
      </button>
    </div>
  );
}
