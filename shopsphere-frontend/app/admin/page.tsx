"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();

  //  Protect admin page
  if (!user || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p role="alert" className="text-red-400">
          Access denied. Admins only.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Manage Orders */}
        <Link
          href="/admin/orders"
          className="border rounded p-4 hover:bg-gray-900 focus-visible:ring"
        >
          <h2 className="font-semibold">Manage Orders</h2>
          <p className="text-sm text-gray-400">
            View all orders and update status
          </p>
        </Link>

        {/* Add Product */}
        <Link
          href="/admin/products/new"
          className="border rounded p-4 hover:bg-gray-900 focus-visible:ring"
        >
          <h2 className="font-semibold">Add Product</h2>
          <p className="text-sm text-gray-400">
            Create new products
          </p>
        </Link>

        {/* Add Category */}
        <Link
          href="/admin/categories/new"
          className="border rounded p-4 hover:bg-gray-900 focus-visible:ring"
        >
          <h2 className="font-semibold">Add Category</h2>
          <p className="text-sm text-gray-400">
            Create new categories
          </p>
        </Link>
      </div>
    </div>
  );
}
