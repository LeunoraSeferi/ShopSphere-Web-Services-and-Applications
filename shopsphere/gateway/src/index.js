import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs } from "./graphql/schema/typeDefs.js";
import { resolvers } from "./graphql/resolvers/index.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gateway" });
});

// Apollo Server
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
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
