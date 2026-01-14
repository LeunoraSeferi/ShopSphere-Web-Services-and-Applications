"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGetOrders, apiUpdateOrderStatus } from "@/lib/api";
import Link from "next/link";

type OrderItem = {
  id?: number;
  productId: number;
  qty: number;
  unitPrice: number;
};

type Order = {
  id: number;
  customerId: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
  total: number;
  createdAt?: string;
  items?: OrderItem[];
};

const STATUSES: Order["status"][] = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { user, token, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadOrders() {
    if (!token) return;
    setLoading(true);
    setMsg(null);

    try {
      const data = await apiGetOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setMsg(e?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(orderId: number, newStatus: Order["status"]) {
    if (!token) {
      setMsg("Missing token. Please login again.");
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

    try {
      await apiUpdateOrderStatus(token, orderId, newStatus);
      setMsg("✅ Status updated successfully");
    } catch (e: any) {
      setMsg(e?.message || "Failed to update status.");
      loadOrders();
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!user || !token) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Orders</h1>
        <p role="alert" className="text-red-400">You must login as admin.</p>
        <Link href="/login?next=/admin/orders" className="inline-block mt-3 border rounded px-3 py-2 focus-visible:ring">
          Go to Login
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Orders</h1>
        <p role="alert" className="text-red-400">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Orders</h1>
        <button onClick={loadOrders} className="border rounded px-3 py-2 text-sm focus-visible:ring">
          Refresh
        </button>
      </div>

      {msg && <p role="alert" className="text-sm text-yellow-200">{msg}</p>}

      {loading ? (
        <p className="text-gray-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border rounded p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">Order #{o.id}</div>
                  <div className="text-sm text-gray-400">
                    Customer: {o.customerId} • Total: ${Number(o.total).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor={`status-${o.id}`} className="text-sm">Status</label>
                  <select
                    id={`status-${o.id}`}
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value as Order["status"])}
                    className="rounded border bg-black px-2 py-1 text-sm focus-visible:ring"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {Array.isArray(o.items) && o.items.length > 0 && (
                <div className="mt-3 border-t pt-3 text-sm space-y-1">
                  {o.items.map((it, idx) => (
                    <div key={it.id ?? idx} className="flex justify-between">
                      <span>Product {it.productId} × {it.qty}</span>
                      <span>${(it.unitPrice * it.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
