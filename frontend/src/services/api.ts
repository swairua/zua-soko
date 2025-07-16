import axios from "axios";

// Configure axios for both development and production
const API_BASE_URL = import.meta.env.PROD ? "/api" : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn("API request failed:", error.message);
    return Promise.reject(error);
  },
);

// Fallback data for extreme cases
const fallbackData = {
  categories: [
    "Vegetables",
    "Fruits",
    "Grains",
    "Leafy Greens",
    "Root Vegetables",
  ],
  counties: ["Kiambu", "Nakuru", "Meru", "Nairobi", "Nyeri"],
  products: [
    {
      id: "fallback-1",
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price_per_unit: 130,
      unit: "kg",
      stock_quantity: 85,
      description:
        "Organic red tomatoes, Grade A quality. Perfect for salads and cooking.",
      is_featured: true,
      farmer_name: "Demo Farmer",
      farmer_county: "Nakuru",
      created_at: new Date().toISOString(),
    },
    {
      id: "fallback-2",
      name: "Sweet Potatoes",
      category: "Root Vegetables",
      price_per_unit: 80,
      unit: "kg",
      stock_quantity: 45,
      description:
        "Fresh sweet potatoes, rich in nutrients and perfect for various dishes.",
      is_featured: true,
      farmer_name: "Demo Farmer",
      farmer_county: "Meru",
      created_at: new Date().toISOString(),
    },
  ],
};

// API functions
export const apiService = {
  // Health check with database status
  getHealth: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      return {
        status: "ERROR",
        message: "API unavailable",
        database: "disconnected",
      };
    }
  },

  // Auth endpoints - prioritize real database
  login: async (credentials: { phone: string; password: string }) => {
    try {
      // Try real database login first
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      // If real database fails, try demo endpoints for backwards compatibility
      console.warn(
        "Real database login failed, trying demo endpoints:",
        error.response?.data?.error || error.message,
      );

      try {
        const response = await api.post("/demo/login", credentials);
        return response.data;
      } catch (fallbackError) {
        console.error("Both real and demo login failed:", fallbackError);
        throw error; // Throw original error
      }
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  // Product endpoints - prioritize real database
  getProducts: async () => {
    try {
      // Try real database first
      const response = await api.get("/products");
      console.log(
        "✅ Loaded products from Render.com database:",
        response.data.products?.length || 0,
        "products",
      );
      return response.data;
    } catch (error) {
      console.warn("Real database products failed, trying demo:", error);

      try {
        // Try demo endpoint
        const response = await api.get("/demo/products");
        console.log(
          "⚠️ Using demo products:",
          response.data.products?.length || 0,
          "products",
        );
        return response.data;
      } catch (fallbackError) {
        console.warn("All endpoints failed, using fallback data");
        return { products: fallbackData.products };
      }
    }
  },

  getProduct: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      // Return fallback product
      const product = fallbackData.products.find((p) => p.id === id);
      if (product) {
        return { product };
      }
      throw error;
    }
  },

  // Wallet endpoints
  getWalletBalance: async () => {
    try {
      const response = await api.get("/wallet/balance");
      return response.data;
    } catch (error) {
      console.error("Wallet balance failed:", error);
      return { balance: 0 };
    }
  },

  // Static data
  getCategories: () => Promise.resolve(fallbackData.categories),
  getCounties: () => Promise.resolve(fallbackData.counties),
};

export default api;
