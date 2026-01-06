import express from "express";
import { z } from "zod";
import { orders } from "../data/db.js";

const router = express.Router();

const createOrderSchema = z.object({
  customerId: z.number().int().positive(),
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      qty: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "CANCELLED"]).optional(),
});

function calcTotal(items) {
  return items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
}

// ✅ GET all orders
router.get("/orders", (req, res) => {
  res.json(orders);
});

// ✅ GET order by id
router.get("/orders/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const o = orders.find(x => x.id === id);
  if (!o) return next({ status: 404, code: "NOT_FOUND", message: "Order not found" });
  res.json(o);
});

// ✅ POST create order
router.post("/orders", (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);

    const newOrder = {
      id: orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      customerId: body.customerId,
      items: body.items,
      status: body.status || "PENDING",
      total: calcTotal(body.items),
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
  } catch (e) {
    next({ status: 400, code: "VALIDATION_ERROR", message: e.errors?.[0]?.message || "Invalid input" });
  }
});

// ✅ PUT update order (status + items)
router.put("/orders/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const o = orders.find(x => x.id === id);
  if (!o) return next({ status: 404, code: "NOT_FOUND", message: "Order not found" });

  const { status, items } = req.body;

  if (status !== undefined) {
    const allowed = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return next({ status: 400, code: "VALIDATION_ERROR", message: "Invalid status" });
    }
    o.status = status;
  }

  if (items !== undefined) {
    if (!Array.isArray(items) || items.length === 0) {
      return next({ status: 400, code: "VALIDATION_ERROR", message: "Items must be a non-empty array" });
    }
    o.items = items;
    o.total = calcTotal(items);
  }

  res.json(o);
});

// ✅ DELETE order (remove)
router.delete("/orders/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const idx = orders.findIndex(x => x.id === id);
  if (idx === -1) return next({ status: 404, code: "NOT_FOUND", message: "Order not found" });

  orders.splice(idx, 1);
  res.status(204).send();
});

export default router;
