// lib/api.ts
import axios from "axios";

const AUTH = process.env.NEXT_PUBLIC_AUTH_URL!;
const CATALOG = process.env.NEXT_PUBLIC_CATALOG_URL!;
const ORDERS = process.env.NEXT_PUBLIC_ORDERS_URL!;

// ---------- AUTH ----------
export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "customer";
}) {
  const res = await axios.post(`${AUTH}/auth/register`, data);
  return res.data;
}

export async function apiLogin(data: { email: string; password: string }) {
  const res = await axios.post(`${AUTH}/auth/login`, data);
  return res.data; // { token, user }
}

// ---------- CATEGORIES ----------
export async function apiGetCategories() {
  const res = await axios.get(`${CATALOG}/categories`);
  return res.data; // [{id,name}]
}

export async function apiCreateCategory(token: string, data: { name: string }) {
  const res = await axios.post(`${CATALOG}/categories`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ---------- PRODUCTS ----------
export async function apiGetProduct(id: number) {
  const res = await axios.get(`${CATALOG}/products/${id}`);
  return res.data;
}

export async function apiCreateProduct(
  token: string,
  data: { name: string; price: number; categoryId: number; brand: string; inStock: boolean }
) {
  const res = await axios.post(`${CATALOG}/products`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Solr search endpoint you implemented:
export async function apiSearchProducts(params: {
  q?: string;
  category?: string;
  brand?: string;
  inStock?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}) {
  const res = await axios.get(`${CATALOG}/search/products`, { params });
  return res.data; // {paging, results}
}

// ---------- ORDERS ----------
export async function apiCreateOrder(
  token: string,
  payload: { customerId: number; items: { productId: number; qty: number; unitPrice: number }[]; status?: string }
) {
  const res = await axios.post(`${ORDERS}/orders`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function apiGetOrders() {
  const res = await axios.get(`${ORDERS}/orders`);
  return res.data;
}

export async function apiUpdateOrderStatus(
  token: string,
  id: number,
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED"
) {
  const res = await axios.put(
    `${ORDERS}/orders/${id}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
