import express from "express";
import { z } from "zod";
import { products, categories } from "../data/db.js";
import { productLinks } from "../utils/hateoas.js";
import { requireAuth, requireRole } from "../middlewares/authJwt.js";

const router = express.Router();

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  categoryId: z.number().int().positive(),
  brand: z.string().min(1),
  inStock: z.boolean(),
});

//  GET all (public)
router.get("/products", (req, res) => {
  const withLinks = products.map((p) => ({ ...p, _links: productLinks(p.id, p.categoryId) }));
  res.json(withLinks);
});

//  GET by id (public)
router.get("/products/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const p = products.find((x) => x.id === id);
  if (!p) return next({ status: 404, code: "NOT_FOUND", message: "Product not found" });

  res.json({ ...p, _links: productLinks(p.id, p.categoryId) });
});

//  POST create (ADMIN only)
router.post("/products", requireAuth, requireRole("admin"), (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);

    const catExists = categories.some((c) => c.id === body.categoryId);
    if (!catExists) return next({ status: 400, code: "VALIDATION_ERROR", message: "Invalid categoryId" });

    const newProduct = {
      id: products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      ...body,
    };

    products.push(newProduct);
    res.status(201).json({ ...newProduct, _links: productLinks(newProduct.id, newProduct.categoryId) });
  } catch (e) {
    next({
      status: 400,
      code: "VALIDATION_ERROR",
      message: e.errors?.[0]?.message || "Invalid input",
    });
  }
});

// PUT update (ADMIN only)
router.put("/products/:id", requireAuth, requireRole("admin"), (req, res, next) => {
  const id = Number(req.params.id);
  const p = products.find((x) => x.id === id);
  if (!p) return next({ status: 404, code: "NOT_FOUND", message: "Product not found" });

  const { name, price, categoryId, brand, inStock } = req.body;

  if (categoryId !== undefined) {
    const catExists = categories.some((c) => c.id === Number(categoryId));
    if (!catExists) return next({ status: 400, code: "VALIDATION_ERROR", message: "Invalid categoryId" });
    p.categoryId = Number(categoryId);
  }

  if (name !== undefined) p.name = name;
  if (price !== undefined) p.price = Number(price);
  if (brand !== undefined) p.brand = brand;
  if (inStock !== undefined) p.inStock = Boolean(inStock);

  res.json({ ...p, _links: productLinks(p.id, p.categoryId) });
});

//  DELETE remove (ADMIN only)
router.delete("/products/:id", requireAuth, requireRole("admin"), (req, res, next) => {
  const id = Number(req.params.id);
  const idx = products.findIndex((x) => x.id === id);
  if (idx === -1) return next({ status: 404, code: "NOT_FOUND", message: "Product not found" });

  products.splice(idx, 1);
  res.status(204).send();
});

export default router;
