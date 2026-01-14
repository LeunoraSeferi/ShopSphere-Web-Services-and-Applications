// lib/api.ts

type LoginPayload = { email: string; password: string };

// Ports (adjust only if yours differ)
const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE ?? "http://localhost:3001/api/v1";
const CATALOG_BASE = process.env.NEXT_PUBLIC_CATALOG_BASE ?? "http://localhost:3004/api/v1";
const ORDERS_BASE = process.env.NEXT_PUBLIC_ORDERS_BASE ?? "http://localhost:3003/api/v1";

type HeadersMap = Record<string, string>;

function authHeader(token?: string | null): HeadersMap {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper fetch
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersMap = {
    "Content-Type": "application/json",
    ...(options.headers as HeadersMap),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = (data as any)?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

// -------------------------
// AUTH
// -------------------------
export async function apiLogin(payload: LoginPayload) {
  return apiFetch<{ token: string; user: { id: number; name: string; role: "admin" | "customer" } }>(
    `${AUTH_BASE}/auth/login`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

// -------------------------
// CATEGORIES (Catalog)
// -------------------------
export async function apiGetCategories() {
  return apiFetch<Array<{ id: number; name: string }>>(`${CATALOG_BASE}/categories`);
}

export async function apiCreateCategory(token: string, payload: { name: string }) {
  return apiFetch(`${CATALOG_BASE}/categories`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

// -------------------------
// PRODUCTS (Catalog)
// -------------------------
export async function apiGetProducts() {
  return apiFetch<any[]>(`${CATALOG_BASE}/products`);
}

export async function apiGetProduct(id: number) {
  return apiFetch<any>(`${CATALOG_BASE}/products/${id}`);
}

export async function apiCreateProduct(
  token: string,
  payload: { name: string; brand: string; price: number; inStock: boolean; categoryId: number }
) {
  return apiFetch(`${CATALOG_BASE}/products`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

// -------------------------
// SEARCH (Solr)
// -------------------------
export async function apiSearchProducts(params: {
  q: string; // "*" or "*:*" or "perfume"
  category?: string;
  inStock?: string; // "true" | "false"
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number; // 1-based
  pageSize?: number;
}) {
  const url = new URL(`${CATALOG_BASE}/search/products`);

  url.searchParams.set("q", params.q || "*");

  if (params.category) url.searchParams.set("categoryId", params.category);
  if (params.inStock) url.searchParams.set("inStock", params.inStock);
  if (params.minPrice) url.searchParams.set("minPrice", params.minPrice);
  if (params.maxPrice) url.searchParams.set("maxPrice", params.maxPrice);
  if (params.sort) url.searchParams.set("sort", params.sort);

  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("pageSize", String(params.pageSize ?? 10));

  return apiFetch<{
    paging: { page: number; pageSize: number; total: number; totalPages: number };
    results: any[];
  }>(url.toString());
}

// -------------------------
// ORDERS
// -------------------------
export async function apiCreateOrder(
  token: string,
  payload: {
    customerId: number;
    items: Array<{ productId: number; qty: number; unitPrice: number }>;
    status: string;
  }
) {
  return apiFetch(`${ORDERS_BASE}/orders`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function apiGetOrders(token: string) {
  return apiFetch<any[]>(`${ORDERS_BASE}/orders`, {
    headers: authHeader(token),
  });
}

export async function apiUpdateOrderStatus(token: string, orderId: number, status: string) {
  return apiFetch(`${ORDERS_BASE}/orders/${orderId}`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  });
}
