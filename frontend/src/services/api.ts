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
  console.group("🚀 API REQUEST");
  console.log("📍 URL:", config.url);
  console.log("🔧 Method:", config.method?.toUpperCase());
  console.log("📦 Data:", config.data);
  console.log("🔑 Headers:", {
    'Content-Type': config.headers['Content-Type'],
    'Authorization': config.headers['Authorization'] ? '[TOKEN PRESENT]' : '[NO TOKEN]'
  });
  console.groupEnd();

  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add timing metadata
  (config as any).metadata = { startTime: Date.now() };

  return config;
});

// Add response interceptor for enhanced logging - NO BYPASS SYSTEM
api.interceptors.response.use(
  (response) => {
    console.group("✅ API SUCCESS");
    console.log("📍 URL:", response.config.url);
    console.log("📊 Status:", `${response.status} ${response.statusText}`);
    console.log("📦 Data:", response.data);
    console.log("⏱️ Duration:", (response.config as any).metadata?.startTime ?
      `${Date.now() - (response.config as any).metadata.startTime}ms` : 'Unknown');
    console.groupEnd();
    return response;
  },
  (error) => {
    // Enhanced error logging with better formatting
    const errorDetails = {
      url: error.config?.url || 'Unknown URL',
      method: (error.config?.method || 'Unknown').toUpperCase(),
      status: error.response?.status || 'No Status',
      statusText: error.response?.statusText || 'No Status Text',
      data: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No Response Data',
      message: error.message || 'No Error Message',
      hostname: window.location.hostname,
      timestamp: new Date().toISOString(),
    };

    console.group("❌ API ERROR DETAILS");
    console.error("🌐 Request:", `${errorDetails.method} ${errorDetails.url}`);
    console.error("📊 Status:", `${errorDetails.status} - ${errorDetails.statusText}`);
    console.error("💬 Message:", errorDetails.message);
    console.error("📦 Response Data:", errorDetails.data);
    console.error("🕐 Timestamp:", errorDetails.timestamp);
    console.error("🏠 Hostname:", errorDetails.hostname);
    console.error("🔧 Full Error Object:", error);
    console.groupEnd();

    // Also log as a single formatted string for easy copying
    const errorSummary = `API Error: ${errorDetails.method} ${errorDetails.url} - ${errorDetails.status} ${errorDetails.statusText} - ${errorDetails.message}`;
    console.error("📋 Error Summary:", errorSummary);

    // Add context for common errors
    if (errorDetails.status === 400) {
      console.warn("💡 Common 400 causes: Invalid request data, missing required fields, or malformed JSON");
    } else if (errorDetails.status === 401) {
      console.warn("💡 Common 401 causes: Missing or invalid authentication token");
    } else if (errorDetails.status === 403) {
      console.warn("💡 Common 403 causes: Insufficient permissions for this resource");
    } else if (errorDetails.status === 404) {
      console.warn("💡 Common 404 causes: Resource not found or incorrect URL");
    } else if (errorDetails.status === 409) {
      console.warn("💡 Common 409 causes: Conflict with existing data (duplicate phone/email)");
    } else if (errorDetails.status === 500) {
      console.warn("💡 Common 500 causes: Server-side error, database connection issues");
    } else if (error.code === 'NETWORK_ERROR' || !errorDetails.status) {
      console.warn("💡 Network issues: Check internet connection and server availability");
    }

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

    // Validate product ID to prevent invalid requests
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      throw new Error('Invalid product ID: ID is empty or undefined');
    }

    // Products now use real integer IDs from the database
    console.log("🛍️ Fetching product with ID:", id, "Type:", typeof id);

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

  // Generic GET method for any endpoint
  get: async (url: string) => {
    console.log("🔄 GENERIC GET REQUEST to real database:", url);
    const response = await api.get(url);
    console.log("🔄 GENERIC GET SUCCESS:", response.data);
    return response;
  },
};

export default api;
