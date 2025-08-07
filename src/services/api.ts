import axios from "axios";
import { getApiUrl, getDebugMode, getEnvironmentConfig } from "../utils/env";

// Get configuration from environment
const config = getEnvironmentConfig();
const API_BASE_URL = config.apiUrl;
const DEBUG_MODE = config.debugMode;

console.log(`🔗 API Service initialized with base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for better real database connection
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token and enhanced logging
api.interceptors.request.use((config) => {
  if (DEBUG_MODE) {
    console.group("🚀 API REQUEST");
    console.log("📍 URL:", config.url);
    console.log("🔧 Method:", config.method?.toUpperCase());
    console.log("📦 Data:", config.data);
    console.log("🔑 Headers:", {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers['Authorization'] ? '[TOKEN PRESENT]' : '[NO TOKEN]'
    });
    console.groupEnd();
  }

  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add timing metadata
  (config as any).metadata = { startTime: Date.now() };

  return config;
});

// Add response interceptor for enhanced logging
api.interceptors.response.use(
  (response) => {
    if (DEBUG_MODE) {
      console.group("✅ API SUCCESS");
      console.log("📍 URL:", response.config.url);
      console.log("📊 Status:", `${response.status} ${response.statusText}`);
      console.log("📦 Data:", response.data);
      console.log("⏱️ Duration:", `${Date.now() - (response.config as any).metadata?.startTime}ms`);
      console.groupEnd();
    }
    return response;
  },
  (error) => {
    const isNetworkError = !error.response;
    const status = error.response?.status || 'No Status';
    const statusText = error.response?.statusText || 'No Status Text';
    
    console.group("❌ API ERROR");
    console.error("📍 URL:", error.config?.url);
    console.error("🔧 Method:", error.config?.method?.toUpperCase());
    console.error("📊 Status:", `${status} - ${statusText}`);
    console.error("💬 Message:", error.message);
    console.error("📦 Response Data:", error.response?.data);
    console.error("🕐 Timestamp:", new Date().toISOString());
    console.error("🏠 Hostname:", window.location.hostname);
    
    // Enhanced error context
    console.group("🔧 Error Context");
    console.log("🔗 Base URL:", API_BASE_URL);
    console.log("🌍 Environment:", config.isProduction ? 'production' : 'development');
    console.log("🔧 Full Error Object:", error);
    console.groupEnd();
    
    // Summary for easy reading
    console.log("📋 Error Summary:", `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status} ${statusText} - ${error.message}`);
    console.groupEnd();
    
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Auth endpoints
  login: async (credentials: { phone: string; password: string }) => {
    console.log("🔐 LOGIN request to real database");
    const response = await api.post("/auth/login", credentials);
    console.log("🔐 LOGIN SUCCESS:", response.data);
    return response.data;
  },

  register: async (userData: any) => {
    console.log("📝 REGISTER request to real database");
    const response = await api.post("/auth/register", userData);
    console.log("📝 REGISTER SUCCESS:", response.data);
    return response.data;
  },

  // Product endpoints - Real database only
  getProducts: async (params?: any) => {
    console.log("🛍️ FETCHING PRODUCTS from real database");
    const response = await api.get("/marketplace/products", { params });
    console.log("🛍️ PRODUCTS SUCCESS:", response.data);
    return response.data;
  },

  getProduct: async (id: string) => {
    console.log("🛍️ FETCHING PRODUCT from real database", id);
    const response = await api.get(`/marketplace/products/${id}`);
    console.log("🛍️ PRODUCT SUCCESS:", response.data);
    return response.data;
  },

  getCategories: async () => {
    console.log("🏷️ FETCHING CATEGORIES from real database");
    const response = await api.get("/marketplace/categories");
    console.log("🏷️ CATEGORIES SUCCESS:", response.data);
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
    console.log("💰 WALLET BALANCE SUCCESS:", response.data);
    return response.data;
  },

  // Farmer endpoints - Real database only
  getConsignments: async () => {
    console.log("📦 FETCHING CONSIGNMENTS from real database");
    const response = await api.get("/consignments");
    console.log("📦 CONSIGNMENTS SUCCESS:", response.data);
    return response.data;
  },

  createConsignment: async (consignmentData: any) => {
    console.log("📦 CREATING CONSIGNMENT in real database");
    const response = await api.post("/consignments", consignmentData);
    console.log("📦 CONSIGNMENT CREATION SUCCESS:", response.data);
    return response.data;
  },

  // Order endpoints - Real database only
  getOrders: async () => {
    console.log("🛒 FETCHING ORDERS from real database");
    const response = await api.get("/orders");
    console.log("🛒 ORDERS SUCCESS:", response.data);
    return response.data;
  },

  createOrder: async (orderData: any) => {
    console.log("🛒 CREATING ORDER in real database");
    const response = await api.post("/orders", orderData);
    console.log("🛒 ORDER CREATION SUCCESS:", response.data);
    return response.data;
  },

  // Driver endpoints - Real database only
  getAvailableDeliveries: async () => {
    console.log("🚛 FETCHING AVAILABLE DELIVERIES from real database");
    const response = await api.get("/driver/available-deliveries");
    console.log("🚛 DELIVERIES SUCCESS:", response.data);
    return response.data;
  },

  acceptDelivery: async (deliveryId: string) => {
    console.log("🚛 ACCEPTING DELIVERY in real database");
    const response = await api.post("/driver/accept-delivery", { deliveryId });
    console.log("🚛 DELIVERY ACCEPTANCE SUCCESS:", response.data);
    return response.data;
  },

  getDriverEarnings: async () => {
    console.log("💵 FETCHING DRIVER EARNINGS from real database");
    const response = await api.get("/driver/earnings");
    console.log("💵 DRIVER EARNINGS SUCCESS:", response.data);
    return response.data;
  },

  // Generic methods
  get: async (url: string, config?: any) => {
    return api.get(url, config);
  },

  post: async (url: string, data?: any, config?: any) => {
    return api.post(url, data, config);
  },

  put: async (url: string, data?: any, config?: any) => {
    return api.put(url, data, config);
  },

  delete: async (url: string, config?: any) => {
    return api.delete(url, config);
  }
};

export default api;
