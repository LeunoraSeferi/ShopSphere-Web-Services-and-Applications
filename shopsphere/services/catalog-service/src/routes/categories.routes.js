import express from "express";
import { z } from "zod";
import { categories } from "../data/db.js";

const router = express.Router();

const categorySchema = z.object({
  name: z.string().min(2)
});

// GET all
router.get("/categories", (req, res) => {
  res.json(categories);
});

// GET by id
router.get("/categories/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const cat = categories.find(c => c.id === id);
  if (!cat) return next({ status: 404, code: "NOT_FOUND", message: "Category not found" });
  res.json(cat);
});

// POST create
router.post("/categories", (req, res, next) => {
  try {
    const body = categorySchema.parse(req.body);
    const newCat = {
      id: categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      name: body.name
    };
    categories.push(newCat);
    res.status(201).json(newCat);
  } catch (e) {
    next({ status: 400, code: "VALIDATION_ERROR", message: e.errors?.[0]?.message || "Invalid input" });
  }
});

// PUT update
router.put("/categories/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const cat = categories.find(c => c.id === id);
  if (!cat) return next({ status: 404, code: "NOT_FOUND", message: "Category not found" });

  if (req.body.name) cat.name = req.body.name;
  res.json(cat);
});

// DELETE remove
router.delete("/categories/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return next({ status: 404, code: "NOT_FOUND", message: "Category not found" });

  categories.splice(idx, 1);
  res.status(204).send();
});

export default router;
