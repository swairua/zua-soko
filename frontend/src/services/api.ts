import axios from "axios";

// Configure axios for both development and production
const API_BASE_URL = import.meta.env.PROD ? "/api" : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
<<<<<<< HEAD
  timeout: 10000, // Reduced timeout to 10 seconds
=======
  timeout: 30000, // Increased timeout for better real database connection
>>>>>>> origin/main
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

<<<<<<< HEAD
// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log health check errors to avoid console spam
    if (!error.config?.url?.includes("/health")) {
      console.warn("API request failed:", error.message);
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
=======
// Add response interceptor for enhanced logging - NO BYPASS SYSTEM
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
    console.error("❌ API ERROR:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      hostname: window.location.hostname,
      timestamp: new Date().toISOString(),
    });
>>>>>>> origin/main

    // NO BYPASS - Let all errors bubble up to force real database debugging
    return Promise.reject(error);
  },
);

// API functions - All targeting real database
export const apiService = {
<<<<<<< HEAD
  // Health check with improved error handling
  getHealth: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error: any) {
      // Return a structured error response instead of throwing
      return {
        status: "ERROR",
        message: "API unavailable",
        database: "error: " + (error.response?.data?.message || error.message),
        timestamp: new Date().toISOString(),
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
=======
  // Auth endpoints - Real database only
  login: async (credentials: { phone: string; password: string }) => {
    console.log("🔐 ATTEMPTING LOGIN with real database:", credentials.phone);
    const response = await api.post("/auth/login", credentials);
    console.log("🔐 LOGIN SUCCESS:", response.data);
    return response.data;
>>>>>>> origin/main
  },

  register: async (userData: any) => {
    console.log("📝 ATTEMPTING REGISTRATION with real database");
    const response = await api.post("/auth/register", userData);
    console.log("📝 REGISTRATION SUCCESS:", response.data);
    return response.data;
  },

<<<<<<< HEAD
  // Product endpoints - prioritize real database
  getProducts: async () => {
    try {
      // Try real database first
      const response = await api.get("/products");
      console.log(
        "✅ Loaded products from database:",
        response.data.products?.length || 0,
        "products",
      );
      return response.data;
    } catch (error) {
      console.warn("Database products failed, trying demo:", error);

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
=======
  // Product endpoints - Real database only
  getProducts: async (params?: URLSearchParams) => {
    const url = params
      ? `/marketplace/products?${params}`
      : "/marketplace/products";
    console.log("🛍️ FETCHING PRODUCTS from real database:", url);
    const response = await api.get(url);
    console.log(
      "🛍️ PRODUCTS SUCCESS:",
      response.data.products?.length || response.data.length,
      "products",
    );
    return response.data;
>>>>>>> origin/main
  },

  getProduct: async (id: string) => {
    console.log("🛍️ FETCHING SINGLE PRODUCT from real database:", id);
    const response = await api.get(`/marketplace/products/${id}`);
    console.log("🛍️ SINGLE PRODUCT SUCCESS:", response.data);
    return response.data;
  },

<<<<<<< HEAD
  // Wallet endpoints
=======
  // Marketplace metadata - Real database only
  getCategories: async () => {
    console.log("📁 FETCHING CATEGORIES from real database");
    const response = await api.get("/marketplace/categories");
    console.log("📁 CATEGORIES SUCCESS:", response.data);
    return response.data;
  },

  getCounties: async () => {
    console.log("🗺️ FETCHING COUNTIES from real database");
    const response = await api.get("/marketplace/counties");
    console.log("🗺️ COUNTIES SUCCESS:", response.data);
    return response.data;
  },

  // Wallet endpoints - Real database only
>>>>>>> origin/main
  getWalletBalance: async () => {
    console.log("💰 FETCHING WALLET BALANCE from real database");
    const response = await api.get("/wallet/balance");
    console.log("💰 WALLET SUCCESS:", response.data);
    return response.data;
  },

  // Order endpoints - Real database only
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

  // Admin endpoints - Real database only
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
