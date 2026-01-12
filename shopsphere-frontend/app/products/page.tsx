"use client";

import { useEffect, useState } from "react";
import { apiGetCategories, apiSearchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import FiltersBar, { Filters } from "@/components/FiltersBar";

type Category = { id: number; name: string };

type SearchResponse = {
  paging: { page: number; pageSize: number; total: number; totalPages: number };
  results: any[];
};

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    category: "",
    inStock: "",
    minPrice: "",
    maxPrice: "",
    sort: "score desc",
  });

  const [page, setPage] = useState(1);

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // load categories once
  useEffect(() => {
    (async () => {
      try {
        const cats = await apiGetCategories();
        setCategories(cats);
      } catch {
        // not fatal for page
      }
    })();
  }, []);

  async function loadProducts(p = 1) {
    setLoading(true);
    setErr(null);

    try {
      const res = await apiSearchProducts({
        q: filters.q ? filters.q : "*:*",
        category: filters.category || undefined,
        inStock: filters.inStock || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort || undefined,
        page: String(p),
      });

      setData(res);
      setPage(p);
    } catch (e: any) {
      setErr("Failed to load products. Is catalog-service running on port 3004?");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // auto-load first page
  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters() {
    loadProducts(1);
  }

  function resetFilters() {
    const fresh = {
      q: "",
      category: "",
      inStock: "",
      minPrice: "",
      maxPrice: "",
      sort: "score desc",
    };
    setFilters(fresh);
    // load with reset values
    setTimeout(() => {
      loadProducts(1);
    }, 0);
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

      {!loading && data && data.results?.length === 0 && (
        <div className="py-6">No products found.</div>
      )}

      {!loading && data && data.results?.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.results.map((p: any) => (
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

          <Pagination
            page={data.paging.page}
            totalPages={data.paging.totalPages}
            onPage={(p) => loadProducts(p)}
          />
        </>
      )}
    </div>
  );
}
