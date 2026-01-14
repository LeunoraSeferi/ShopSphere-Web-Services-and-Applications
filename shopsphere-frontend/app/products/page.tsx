"use client";

import { useEffect, useState } from "react";
import { apiGetCategories, apiGetProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import FiltersBar, { Filters } from "@/components/FiltersBar";

type Category = { id: number; name: string };

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    category: "",
    inStock: "",
    minPrice: "",
    maxPrice: "",
    sort: "relevance",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load categories (for FiltersBar)
  useEffect(() => {
    (async () => {
      try {
        const cats = await apiGetCategories();
        setCategories(cats);
      } catch {}
    })();
  }, []);

  // 🔑 LOAD PRODUCTS FROM POSTGRES (NOT SOLR)
  async function loadProducts() {
    setLoading(true);
    setErr(null);

    try {
      const all = await apiGetProducts(); // DB source
      setProducts(Array.isArray(all) ? all : []);
    } catch {
      setErr("Failed to load products. Is catalog-service running on port 3004?");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function applyFilters() {
    // for now: reload DB list (enough for project)
    loadProducts();
  }

  function resetFilters() {
    setFilters({
      q: "",
      category: "",
      inStock: "",
      minPrice: "",
      maxPrice: "",
      sort: "relevance",
    });
    loadProducts();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <FiltersBar
        categories={categories}
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {err && (
        <div role="alert" className="border rounded p-3 mb-4">
          {err}
        </div>
      )}

      {loading && <div className="py-6">Loading products…</div>}

      {!loading && products.length === 0 && (
        <div className="py-6">No products found.</div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                brand: p.brand,
                price: Number(p.price),
                inStock: Boolean(p.inStock),
                categoryId: p.categoryId,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
