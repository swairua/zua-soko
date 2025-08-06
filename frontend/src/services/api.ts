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

// Add response interceptor for detailed error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Comprehensive error information extraction
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const data = error.response?.data;
    const config = error.config;
    const url = config?.url;
    const method = config?.method?.toUpperCase();

    // Create detailed error information
    const errorDetails = {
      timestamp: new Date().toISOString(),
      request: {
        method,
        url: `${API_BASE_URL}${url}`,
        fullUrl: config?.url,
        headers: config?.headers,
        timeout: config?.timeout
      },
      response: {
        status,
        statusText,
        data,
        headers: error.response?.headers
      },
      network: {
        code: error.code,
        message: error.message,
        name: error.name,
        isNetworkError: !error.response
      }
    };

    // Enhanced logging with full details
    console.group(`🚨 API ERROR DETAILS - ${method} ${url}`);
    console.error('📍 Status:', status || 'Network Error');
    console.error('📝 Status Text:', statusText || 'No status text');
    console.error('🔗 URL:', `${API_BASE_URL}${url}`);
    console.error('⚠️ Error Code:', error.code);
    console.error('💬 Error Message:', error.message);
    console.error('📦 Response Data:', data);
    console.error('🌐 Network Error:', !error.response);
    console.error('🔍 Full Error Details:', errorDetails);
    console.groupEnd();

    // Show user-friendly error notification with details
    const showDetailedError = (title: string, details: string) => {
      // Create detailed error display
      const errorDisplay = `
${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Status: ${status || 'Network Error'}
🔗 URL: ${method} ${url}
⚠️ Code: ${error.code || 'Unknown'}
💬 Message: ${error.message}
📦 Data: ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━`;

      console.error(errorDisplay);

      // Also show in UI if possible
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('api-error-details', {
          detail: { title, details: errorDisplay, errorDetails }
        }));
      }
    };

    // Handle different types of errors with detailed information
    if (!error.response) {
      // Network error (server not responding)
      const details = `Server is not responding. Check if backend is running on the expected port.`;
      showDetailedError('🌐 NETWORK ERROR', details);
      error.friendlyMessage = `Network Error: Cannot connect to server (${error.code})`;

    } else if (status === 403) {
      // Authentication error
      console.warn('🔄 Authentication failed - clearing tokens');
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth-storage');

      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }

      showDetailedError('🔐 AUTHENTICATION ERROR', 'Token invalid or expired');
      error.friendlyMessage = 'Authentication failed - please login again';

    } else if (status === 404) {
      // Endpoint not found
      showDetailedError('🔍 ENDPOINT NOT FOUND', `API endpoint does not exist`);
      error.friendlyMessage = `API endpoint not found: ${method} ${url}`;

    } else if (status === 500) {
      // Server error
      const serverError = typeof data === 'object' ? (data.message || data.error) : data;
      showDetailedError('🔥 SERVER ERROR', `Internal server error occurred`);
      error.friendlyMessage = `Server Error (500): ${serverError || 'Internal server error'}`;

    } else if (status === 502) {
      // Bad gateway
      showDetailedError('🚧 BAD GATEWAY', 'Server is temporarily unavailable');
      error.friendlyMessage = 'Server temporarily unavailable (502)';

    } else {
      // Other HTTP errors
      const errorMessage = typeof data === 'object' ? (data.message || data.error) : data;
      showDetailedError(`❌ HTTP ERROR ${status}`, errorMessage || statusText);
      error.friendlyMessage = `HTTP ${status}: ${errorMessage || statusText}`;
    }

    // Attach detailed error info to error object
    error.errorDetails = errorDetails;
    error.detailedMessage = error.friendlyMessage;

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
    console.log(`🔍 API POST: ${API_BASE_URL}${url}`);
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
