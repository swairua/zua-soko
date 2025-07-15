import axios from "axios";

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
      tags: ["fresh", "leafy", "green", "iron-rich"],
      farmer: {
        id: "1",
        county: "Kiambu",
        user: { firstName: "Jane", lastName: "Wanjiku" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Premium Maize",
      category: "Grains",
      pricePerUnit: 60,
      unit: "kg",
      stockQuantity: 150,
      images: [
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop",
      ],
      description: "High-quality white maize, perfect for ugali and porridge.",
      isFeatured: true,
      isAvailable: true,
      tags: ["white-maize", "high-quality", "staple"],
      farmer: {
        id: "2",
        county: "Nakuru",
        user: { firstName: "Peter", lastName: "Kamau" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Sweet Potatoes",
      category: "Root Vegetables",
      pricePerUnit: 90,
      unit: "kg",
      stockQuantity: 65,
      images: [
        "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=200&fit=crop",
      ],
      description: "Sweet and nutritious orange-fleshed sweet potatoes.",
      isFeatured: true,
      isAvailable: true,
      tags: ["sweet", "nutritious", "orange"],
      farmer: {
        id: "1",
        county: "Kiambu",
        user: { firstName: "Jane", lastName: "Wanjiku" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      name: "French Beans",
      category: "Vegetables",
      pricePerUnit: 150,
      unit: "kg",
      stockQuantity: 28,
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      ],
      description:
        "Premium French beans, perfect for export and local markets.",
      isFeatured: false,
      isAvailable: true,
      tags: ["premium", "export-quality", "tender"],
      farmer: {
        id: "3",
        county: "Meru",
        user: { firstName: "Grace", lastName: "Muthoni" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "6",
      name: "Bell Peppers",
      category: "Vegetables",
      pricePerUnit: 200,
      unit: "kg",
      stockQuantity: 18,
      images: [
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&h=200&fit=crop",
      ],
      description: "Colorful bell peppers - red, yellow, and green varieties.",
      isFeatured: true,
      isAvailable: true,
      tags: ["colorful", "bell", "varieties"],
      farmer: {
        id: "3",
        county: "Meru",
        user: { firstName: "Grace", lastName: "Muthoni" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// Create axios instance with base configuration
const getBaseURL = () => {
  // In production/Vercel, use the current origin
  if (import.meta.env.PROD) {
    return typeof window !== "undefined"
      ? "/api"
      : "https://zuasoko-app.vercel.app/api";
  }

  // In development, use environment variable or fallback
  return import.meta.env.VITE_API_URL || "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Increased timeout for serverless functions
  headers: {
    "Content-Type": "application/json",
  },
  // Disable Vite's HMR in production
  withCredentials: false,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on auth errors during fetch failures
    if (
      error.response?.status === 401 &&
      !error.message?.includes("Failed to fetch")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }

    // Log network errors but don't spam console in production
    if (error.message?.includes("Failed to fetch") && !import.meta.env.PROD) {
      console.warn("Network request failed, falling back to cached data");
    }

    return Promise.reject(error);
  },
);

// Enhanced API service with fallback support
export const marketplaceAPI = {
  async getProducts(params?: any) {
    try {
      const response = await api.get("/products", { params });
      return response.data;
    } catch (error) {
      console.warn("API unavailable, using fallback data:", error);

      // Apply basic filtering to fallback data
      let filteredProducts = [...fallbackData.products];

      if (params?.category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category === params.category,
        );
      }

      if (params?.county) {
        filteredProducts = filteredProducts.filter(
          (p) => p.farmer.county === params.county,
        );
      }

      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower),
        );
      }

      if (params?.featured === "true") {
        filteredProducts = filteredProducts.filter((p) => p.isFeatured);
      }

      return {
        products: filteredProducts,
        pagination: {
          page: 1,
          limit: 12,
          total: filteredProducts.length,
          pages: 1,
        },
      };
    }
  },

  async getCategories() {
    try {
      const response = await api.get("/marketplace/categories");
      return response.data;
    } catch (error) {
      console.warn("API unavailable, using fallback categories");
      return fallbackData.categories;
    }
  },

  async getCounties() {
    try {
      const response = await api.get("/marketplace/counties");
      return response.data;
    } catch (error) {
      console.warn("API unavailable, using fallback counties");
      return fallbackData.counties;
    }
  },

  async getProduct(id: string) {
    try {
      const response = await api.get(`/marketplace/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn("API unavailable, using fallback product data");
      return (
        fallbackData.products.find((p) => p.id === id) ||
        fallbackData.products[0]
      );
    }
  },
};

// Auth API
export const authAPI = {
  async login(credentials: any) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async register(userData: any) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  async getCart() {
    try {
      const response = await api.get("/cart");
      return response.data;
    } catch (error) {
      console.warn("Cart API unavailable");
      return {
        id: "demo-cart",
        totalItems: 0,
        totalAmount: 0,
        cartItems: [],
      };
    }
  },

  async addToCart(item: any) {
    try {
      const response = await api.post("/cart/items", item);
      return response.data;
    } catch (error) {
      console.warn("Cart API unavailable");
      throw error;
    }
  },
};

export default api;
