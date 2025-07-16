import axios from "axios";

// Configure axios for production
const API_BASE_URL = import.meta.env.PROD ? "/api" : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Fallback data for when API is unavailable
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
      id: "1",
      name: "Organic Tomatoes",
      category: "Vegetables",
      pricePerUnit: 130,
      unit: "kg",
      stockQuantity: 85,
      images: [
        "https://images.unsplash.com/photo-1546470427-e26264be0b07?w=300&h=200&fit=crop",
      ],
      description:
        "Fresh organic tomatoes, Grade A quality. Perfect for salads and cooking.",
      isFeatured: true,
      isAvailable: true,
      tags: ["organic", "fresh", "grade-a"],
      farmer: {
        id: "1",
        county: "Kiambu",
        user: { firstName: "Jane", lastName: "Wanjiku" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Fresh Spinach",
      category: "Leafy Greens",
      pricePerUnit: 50,
      unit: "bunch",
      stockQuantity: 30,
      images: [
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop",
      ],
      description:
        "Freshly harvested spinach bunches, rich in iron and vitamins.",
      isFeatured: false,
      isAvailable: true,
      tags: ["fresh", "leafy", "vitamins"],
      farmer: {
        id: "2",
        county: "Nakuru",
        user: { firstName: "John", lastName: "Kamau" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Sweet Potatoes",
      category: "Root Vegetables",
      pricePerUnit: 80,
      unit: "kg",
      stockQuantity: 45,
      images: [
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop",
      ],
      description:
        "Fresh sweet potatoes, rich in nutrients and perfect for various dishes.",
      isFeatured: true,
      isAvailable: true,
      tags: ["sweet", "nutritious", "versatile"],
      farmer: {
        id: "3",
        county: "Meru",
        user: { firstName: "Mary", lastName: "Njeri" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// API functions
export const apiService = {
  // Auth endpoints
  login: async (credentials: { phone: string; password: string }) => {
    try {
      // Try demo endpoint first for Vercel deployment
      const response = await api.post("/demo/login", credentials);
      return response.data;
    } catch (error) {
      // Fallback to regular login
      try {
        const response = await api.post("/auth/login", credentials);
        return response.data;
      } catch (fallbackError) {
        console.error("Login failed:", fallbackError);
        throw fallbackError;
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

  // Product endpoints
  getProducts: async () => {
    try {
      // Try demo endpoint first
      const response = await api.get("/demo/products");
      return response.data;
    } catch (error) {
      try {
        // Fallback to regular products endpoint
        const response = await api.get("/products");
        return response.data;
      } catch (fallbackError) {
        console.warn("API unavailable, using fallback data");
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

  // Utility endpoints
  getHealth: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "ERROR", message: "API unavailable" };
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
