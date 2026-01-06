import axios from "axios";

const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:3002/api/v1";

// helper: always return a safe float
function toFloat(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export const resolvers = {
  Query: {
    products: async () => {
      const res = await axios.get(`${CATALOG_URL}/products`);
      // your REST returns an array
      return res.data;
    },

    product: async (_, { id }) => {
      const res = await axios.get(`${CATALOG_URL}/products/${id}`);
      return res.data;
    },
  },

  Mutation: {
    createProduct: async (_, { input }) => {
      const res = await axios.post(`${CATALOG_URL}/products`, input);
      return res.data;
    },

    updateProduct: async (_, { id, input }) => {
      const res = await axios.put(`${CATALOG_URL}/products/${id}`, input);
      return res.data;
    },

    deleteProduct: async (_, { id }) => {
      await axios.delete(`${CATALOG_URL}/products/${id}`);
      return true;
    },
  },

  // Field-level resolvers (required advanced GraphQL concept)
  Product: {
    category: async (product) => {
      // category is optional, so returning null is OK if not found
      try {
        const res = await axios.get(`${CATALOG_URL}/categories/${product.categoryId}`);
        return res.data;
      } catch {
        return null;
      }
    },

    finalPrice: (product) => {
      // IMPORTANT: must return a number ALWAYS because schema is Float!
      // Example logic: no discount -> finalPrice = price
      const price = toFloat(product.price, 0);

      // You can later add discount logic here if you want:
      // const discount = product.inStock ? 0 : 0.1;
      // return price * (1 - discount);

      return price;
    },
  },
};
