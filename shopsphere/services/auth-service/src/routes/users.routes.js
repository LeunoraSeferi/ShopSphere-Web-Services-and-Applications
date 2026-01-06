import express from "express";
import { users } from "../data/db.js";
import { requireAuth, requireRole } from "../middlewares/authJwt.js";

const router = express.Router();

// Admin only
router.get("/users", requireAuth, requireRole("admin"), (req, res) => {
  const safe = users.map(({ passwordHash, ...rest }) => rest);
  res.json(safe);
});

router.get("/users/:id", requireAuth, requireRole("admin"), (req, res, next) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return next({ status: 404, code: "NOT_FOUND", message: "User not found" });

  const { passwordHash, ...safe } = user;
  res.json(safe);
});

router.put("/users/:id", requireAuth, requireRole("admin"), (req, res, next) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return next({ status: 404, code: "NOT_FOUND", message: "User not found" });

  const { name, role } = req.body;
  if (name) user.name = name;
  if (role) user.role = role;

  const { passwordHash, ...safe } = user;
  res.json(safe);
});

router.delete("/users/:id", requireAuth, requireRole("admin"), (req, res, next) => {
  const id = Number(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return next({ status: 404, code: "NOT_FOUND", message: "User not found" });

  users.splice(index, 1);
  res.status(204).send();
});

export default router;
