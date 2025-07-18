import axios from "axios";

// Configure axios for both development and production
// In development, try proxy first, fallback to demo endpoints
const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Balanced timeout for real database connection
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token and enhanced logging
api.interceptors.request.use((config) => {
  console.log(
    "🚀 API REQUEST:",
    config.method?.toUpperCase(),
    config.url,
    "Data:",
    config.data,
  );

  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for enhanced logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      "✅ API SUCCESS:",
      response.config.url,
      "Status:",
      response.status,
      "Data sample:",
      response.data,
    );
    return response;
  },
  (error) => {
    // Log errors but don't spam for health checks
    if (!error.config?.url?.includes("/health")) {
      const errorDetails = {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        hostname: window.location.hostname,
        timestamp: new Date().toISOString(),
      };
      console.error("❌ API ERROR:", JSON.stringify(errorDetails, null, 2));
    }
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
  // Health check with improved error handling
  getHealth: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error: any) {
      // In development, return demo status if API is unreachable
      if (
        error.code === "ECONNREFUSED" ||
        error.message.includes("ENOTFOUND")
      ) {
        return {
          status: "OK",
          message: "Demo mode - API server not available",
          database: "demo",
          timestamp: new Date().toISOString(),
        };
      }
      // Return a structured error response for other errors
      return {
        status: "ERROR",
        message: "API unavailable",
        database: "error: " + (error.response?.data?.message || error.message),
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Auth endpoints - prioritize real database with fallback
  login: async (credentials: { phone: string; password: string }) => {
    console.log("🔐 ATTEMPTING LOGIN with real database:", credentials.phone);
    try {
      const response = await api.post("/auth/login", credentials);
      console.log("🔐 LOGIN SUCCESS:", response.data);
      return response.data;
    } catch (error: any) {
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
    console.log("📝 ATTEMPTING REGISTRATION with real database");
    const response = await api.post("/auth/register", userData);
    console.log("📝 REGISTRATION SUCCESS:", response.data);
    return response.data;
  },

  // Product endpoints - prioritize real database with fallback
  getProducts: async (params?: URLSearchParams) => {
    try {
      const url = params ? `/marketplace/products?${params}` : "/products"; // Try both endpoints
      console.log("🛍️ FETCHING PRODUCTS from real database:", url);
      const response = await api.get(url);
      console.log(
        "🛍️ PRODUCTS SUCCESS:",
        response.data.products?.length || response.data.length,
        "products",
      );
      return response.data;
    } catch (error) {
      console.warn("Database products failed, trying demo:", error);
      try {
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
      console.log("🛍️ FETCHING SINGLE PRODUCT from real database:", id);
      const response = await api.get(`/marketplace/products/${id}`);
      console.log("🛍️ SINGLE PRODUCT SUCCESS:", response.data);
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

  // Marketplace metadata - with fallback
  getCategories: async () => {
    try {
      console.log("📁 FETCHING CATEGORIES from real database");
      const response = await api.get("/marketplace/categories");
      console.log("📁 CATEGORIES SUCCESS:", response.data);
      return response.data;
    } catch (error) {
      console.warn("Categories failed, using fallback");
      return fallbackData.categories;
    }
  },

  getCounties: async () => {
    try {
      console.log("🗺️ FETCHING COUNTIES from real database");
      const response = await api.get("/marketplace/counties");
      console.log("🗺️ COUNTIES SUCCESS:", response.data);
      return response.data;
    } catch (error) {
      console.warn("Counties failed, using fallback");
      return fallbackData.counties;
    }
  },

  // Wallet endpoints
  getWalletBalance: async () => {
    try {
      console.log("💰 FETCHING WALLET BALANCE from real database");
      const response = await api.get("/wallet/balance");
      console.log("💰 WALLET SUCCESS:", response.data);
      return response.data;
    } catch (error) {
      console.error("Wallet balance failed:", error);
      return { balance: 0 };
    }
  },

  // Order endpoints
  createOrder: async (orderData: any) => {
    console.log("📦 CREATING ORDER in real database");
    const response = await api.post("/orders", orderData);
    console.log("📦 ORDER SUCCESS:", response.data);
    return response.data;
  },

  getOrders: async () => {
    console.log("📦 FETCHING ORDERS from real database");
    const response = await api.get("/orders");
    console.log("📦 ORDERS SUCCESS:", response.data);
    return response.data;
  },

  // Admin endpoints
  getUsers: async () => {
    console.log("👥 FETCHING USERS from real database");
    const response = await api.get("/admin/users");
    console.log("👥 USERS SUCCESS:", response.data);
    return response.data;
  },

  approveUser: async (userId: string) => {
    console.log("✅ APPROVING USER in real database:", userId);
    const response = await api.post(`/admin/users/${userId}/approve`);
    console.log("✅ USER APPROVAL SUCCESS:", response.data);
    return response.data;
  },

  // Generic GET method for any endpoint
  get: async (url: string) => {
    console.log("🔄 GENERIC GET REQUEST to real database:", url);
    const response = await api.get(url);
    console.log("🔄 GENERIC GET SUCCESS:", response.data);
    return response;
  },
};

export default api;
