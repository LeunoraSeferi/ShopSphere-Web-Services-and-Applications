// lib/images.ts

// ---------- PRODUCTS ----------
export function getProductImage(productId: unknown) {
  const id = String(productId);

  const map: Record<string, string> = {
    "1": "/images/products/parfum-a.jpg",
    "2": "/images/products/parfum-b.jpg",
    // add more later:
    // "3": "/images/products/perfume-c.jpg",
  };

  return map[id] ?? "/images/products/default-product.jpg";
}

// ---------- CATEGORIES ----------
export function getCategoryImage(categoryId: unknown) {
  const id = String(categoryId);

  const map: Record<string, string> = {
    "1": "/images/categories/perfume.avif",
    "2": "/images/categories/cosmetic.jpg",
  };

  return map[id] ?? "/images/categories/default-category.jpg";
}
