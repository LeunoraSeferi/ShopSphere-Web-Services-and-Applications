
// Uses API Gateway base URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1";

type HeadersMap = Record<string, string>;
type LoginPayload = { email: string; password: string };

function authHeader(token?: string | null): HeadersMap {
  // If token already contains "Bearer ", keep it safe
  if (!token) return {};
  return token.startsWith("Bearer ")
    ? { Authorization: token }
    : { Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as HeadersMap),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = (data as any)?.message || (data as any)?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

// =====================
// AUTH
// =====================
export function apiLogin(payload: LoginPayload) {
  return apiFetch<{
    token: string;
    user: { id: number; name: string; role: "admin" | "customer" };
  }>(`${API_BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// =====================
// PRODUCTS (public GET)
// =====================
export function apiGetProducts() {
  return apiFetch<any[]>(`${API_BASE}/products`);
}

export function apiGetProduct(id: number) {
  return apiFetch<any>(`${API_BASE}/products/${id}`);
}

// =====================
// CATEGORIES (public GET)
// =====================
export function apiGetCategories() {
  return apiFetch<any[]>(`${API_BASE}/categories`);
}

// =====================
// SEARCH (Solr) - via Gateway
// =====================
export function apiSearchProducts(params: {
  q: string; // "*" or "*:*" or "perfume"
  category?: string; // categoryId
  inStock?: string; // "true" | "false"
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number; // 1-based
  pageSize?: number;
}) {
  const url = new URL(`${API_BASE}/search/products`);

  url.searchParams.set("q", params.q || "*");

  // keep same param names you used before, but routed via gateway
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

// =====================
// ADMIN: PRODUCTS CRUD
// =====================
export function apiCreateProduct(token: string, payload: any) {
  return apiFetch<any>(`${API_BASE}/products`, {
    method: "POST",
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
}

export function apiUpdateProduct(token: string, id: number, payload: any) {
  return apiFetch<any>(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
}

export function apiDeleteProduct(token: string, id: number) {
  return apiFetch<void>(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeader(token) },
  });
}

// =====================
// ADMIN: CATEGORIES CRUD
// =====================
export function apiCreateCategory(token: string, payload: { name: string }) {
  return apiFetch<any>(`${API_BASE}/categories`, {
    method: "POST",
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
}

export function apiUpdateCategory(
  token: string,
  id: number,
  payload: { name: string }
) {
  return apiFetch<any>(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
}

export function apiDeleteCategory(token: string, id: number) {
  return apiFetch<void>(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: { ...authHeader(token) },
  });
}

// =====================
// ORDERS (customer + admin)
// =====================

// Customer creates order
export function apiCreateOrder(
  token: string,
  payload: {
    customerId: number;
    items: Array<{ productId: number; qty: number; unitPrice: number }>;
    status: string; // e.g., "PENDING"
  }
) {
  return apiFetch<any>(`${API_BASE}/orders`, {
    method: "POST",
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
}

// Admin (and/or user) gets orders.
// In many implementations: admin sees all, customer sees own.
export function apiGetOrders(token: string) {
  return apiFetch<any[]>(`${API_BASE}/orders`, {
    headers: { ...authHeader(token) },
  });
}

// Admin changes status
export function apiUpdateOrderStatus(token: string, id: number, status: string) {
  return apiFetch<any>(`${API_BASE}/orders/${id}`, {
    method: "PUT",
    headers: { ...authHeader(token) },
    body: JSON.stringify({ status }),
  });
}
