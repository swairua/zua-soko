import axios from "axios";

// Configure axios based on environment
// In production, use relative URLs to the same domain
// In development, use the configured VITE_API_URL or default to /api
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction ? "/api" : (import.meta.env.VITE_API_URL || "/api");

console.log("🔧 API Configuration:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  isProduction,
  hostname: window.location.hostname
});

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
    // Handle different types of error responses more gracefully
    const status = error.response?.status;
    const data = error.response?.data;

    // Check if response is HTML (like Express error pages)
    const isHtmlResponse = typeof data === 'string' && data.includes('<!DOCTYPE html>');

    if (isHtmlResponse) {
      // Extract error message from HTML if possible
      const match = data.match(/<pre>(.*?)<\/pre>/);
      const htmlError = match ? match[1] : 'Server endpoint not found';
      console.error(`API Error (${status}):`, htmlError);

      // Create a more user-friendly error object
      error.friendlyMessage = htmlError;
      error.isEndpointMissing = status === 404;

      // Override the error message to prevent [object Object]
      error.message = htmlError;
    } else if (typeof data === 'object' && data !== null) {
      // Handle JSON error objects
      const errorMessage = data.message || data.error || 'Unknown server error';
      console.error(`API Error (${status}):`, errorMessage);
      error.friendlyMessage = errorMessage;
      error.message = errorMessage;
    } else {
      // Handle other error types
      const errorMessage = data || error.message || 'Network error';
      console.error(`API Error (${status}):`, errorMessage);
      error.friendlyMessage = errorMessage;
    }

    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Auth endpoints
  login: async (credentials: { phone: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Product endpoints
  getProducts: async (params?: URLSearchParams) => {
    const url = params ? `/marketplace/products?${params}` : "/products";
    const response = await api.get(url);
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/marketplace/products/${id}`);
    return response.data;
  },

  // Marketplace metadata
  getCategories: async () => {
    const response = await api.get("/marketplace/categories");
    return response.data;
  },

  getCounties: async () => {
    const response = await api.get("/marketplace/counties");
    return response.data;
  },

  // Status check
  getHealth: async () => {
    const response = await api.get("/status");
    return response.data;
  },

  // Generic GET method
  get: async (url: string) => {
    console.log(`🔍 API GET: ${API_BASE_URL}${url}`);
    const response = await api.get(url);
    return response;
  },

  // Generic POST method
  post: async (url: string, data: any) => {
    const response = await api.post(url, data);
    return response;
  },

  // Generic PUT method
  put: async (url: string, data: any) => {
    const response = await api.put(url, data);
    return response;
  },

  // Generic DELETE method
  delete: async (url: string) => {
    const response = await api.delete(url);
    return response;
  },

  // Generic PATCH method
  patch: async (url: string, data: any) => {
    const response = await api.patch(url, data);
    return response;
  },
};

export default api;
