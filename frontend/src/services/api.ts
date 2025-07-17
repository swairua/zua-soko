import axios from "axios";

// Configure axios for both development and production
const API_BASE_URL = import.meta.env.PROD ? "/api" : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for better real database connection
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

    // NO BYPASS - Let all errors bubble up to force real database debugging
    return Promise.reject(error);
  },
);

// API functions - All targeting real database
export const apiService = {
  // Auth endpoints - Real database only
  login: async (credentials: { phone: string; password: string }) => {
    console.log("🔐 ATTEMPTING LOGIN with real database:", credentials.phone);
    const response = await api.post("/auth/login", credentials);
    console.log("🔐 LOGIN SUCCESS:", response.data);
    return response.data;
  },

  register: async (userData: any) => {
    console.log("📝 ATTEMPTING REGISTRATION with real database");
    const response = await api.post("/auth/register", userData);
    console.log("📝 REGISTRATION SUCCESS:", response.data);
    return response.data;
  },

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
  },

  getProduct: async (id: string) => {
    console.log("🛍️ FETCHING SINGLE PRODUCT from real database:", id);
    const response = await api.get(`/marketplace/products/${id}`);
    console.log("🛍️ SINGLE PRODUCT SUCCESS:", response.data);
    return response.data;
  },

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
};

export default api;
