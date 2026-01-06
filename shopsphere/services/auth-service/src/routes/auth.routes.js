import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { users } from "../data/db.js";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "manager", "customer"]).optional(),
});

router.post("/auth/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    const exists = users.find((u) => u.email === body.email);
    if (exists) return next({ status: 409, code: "CONFLICT", message: "Email already exists" });

    const passwordHash = await bcrypt.hash(body.password, 10);
    const newUser = {
      id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role || "customer",
    };

    users.push(newUser);

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (e) {
    next({ status: 400, code: "VALIDATION_ERROR", message: e.errors?.[0]?.message || "Invalid input" });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = users.find((u) => u.email === body.email);
    if (!user) return next({ status: 401, code: "UNAUTHORIZED", message: "Invalid credentials" });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return next({ status: 401, code: "UNAUTHORIZED", message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e) {
    next({ status: 400, code: "VALIDATION_ERROR", message: e.errors?.[0]?.message || "Invalid input" });
  }
});

export default router;
