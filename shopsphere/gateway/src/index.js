import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import axios from "axios";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs } from "./graphql/schema/typeDefs.js";
import { resolvers } from "./graphql/resolvers/index.js";

// Redis connect
import { connectRedis } from "./redis/redisClient.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
// Cache middlewares
import { cacheGet } from "./middlewares/cache.js";
import { clearProductsCache } from "./middlewares/cacheInvalidate.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(apiLimiter);

// Connect Redis when gateway starts
await connectRedis();

// Base URL for Catalog Service (inside Docker: CATALOG_URL should be set)
const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:3002/api/v1";

/**
 * ======================================
 * REST PROXY ENDPOINTS (for Redis caching demo)
 * These enable Postman tests:
 *  - GET  http://localhost:4000/api/v1/products  (MISS/HIT)
 *  - GET  http://localhost:4000/api/v1/products/:id (MISS/HIT)
 *  - POST http://localhost:4000/api/v1/products  (clears cache)
 * ======================================
 */

// GET all products (CACHED)
app.get("/api/v1/products", cacheGet(60), async (req, res) => {
  try {
    const response = await axios.get(`${CATALOG_URL}/products`);
    return res.json(response.data);
  } catch (err) {
    return res.status(502).json({
      error: "CATALOG_PROXY_ERROR",
      message: "Failed to fetch products from catalog-service",
    });
  }
});

// GET product by id (CACHED)
app.get("/api/v1/products/:id", cacheGet(60), async (req, res) => {
  try {
    const response = await axios.get(`${CATALOG_URL}/products/${req.params.id}`);
    return res.json(response.data);
  } catch (err) {
    const status = err?.response?.status || 502;
    return res.status(status).json({
      error: "CATALOG_PROXY_ERROR",
      message: "Failed to fetch product from catalog-service",
    });
  }
});

// POST create product (invalidate cache after success)
app.post("/api/v1/products", async (req, res) => {
  try {
    const response = await axios.post(`${CATALOG_URL}/products`, req.body);

    // IMPORTANT: Clear cached products after write
    await clearProductsCache();

    return res.status(201).json(response.data);
  } catch (err) {
    const status = err?.response?.status || 400;
    return res.status(status).json({
      error: "CATALOG_PROXY_ERROR",
      message: err?.response?.data?.message || "Create product failed",
    });
  }
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gateway" });
});

// Apollo Server (GraphQL)
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

// GraphQL endpoint
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
  console.log(`REST:   http://localhost:${PORT}/api/v1/products`);
  console.log(`GraphQL: http://localhost:${PORT}/graphql`);
});
