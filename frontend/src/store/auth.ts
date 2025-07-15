import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log("🌐 Axios Request:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      baseURL: config.baseURL,
    });
    return config;
  },
  (error) => {
    console.error("🌐 Axios Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log("🌐 Axios Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("🌐 Axios Response Error:");
    console.error("  Status:", error.response?.status);
    console.error("  Status Text:", error.response?.statusText);
    console.error("  Headers:", error.response?.headers);
    console.error("  Data:", error.response?.data);
    console.error("  Message:", error.message);
    console.error("  Config URL:", error.config?.url);
    console.error("  Full Error:", error);
    return Promise.reject(error);
  },
);

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "FARMER" | "CUSTOMER" | "ADMIN" | "DRIVER";
  county: string;
  verified: boolean;
  registrationFeePaid: boolean;
  totalEarnings?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  loginWithData: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, password: string) => {
        try {
          set({ isLoading: true });

          console.log("🔑 Login attempt:", {
            phone,
            apiUrl: import.meta.env.VITE_API_URL,
            fullUrl: `${import.meta.env.VITE_API_URL}/auth/login`,
          });

          console.log(
            "📤 Request payload:",
            JSON.stringify({ phone, password }),
          );

          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/login`,
            {
              phone: phone,
              password: password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 10000,
            },
          );

          console.log("📥 Response status:", response.status);
          console.log("📥 Response headers:", response.headers);

          console.log("✅ Login success:", response.data);

          const { user, token } = response.data;

          localStorage.setItem("token", token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("❌ Login error:", error);
          console.error("❌ Error message:", error.message);
          console.error("❌ Error response data:", error.response?.data);
          console.error("❌ Error status:", error.response?.status);
          console.error("❌ Error status text:", error.response?.statusText);
          console.error("❌ Error URL:", error.config?.url);
          console.error("❌ Error code:", error.code);
          console.error("❌ Error name:", error.name);
          console.error(
            "❌ Full error object:",
            JSON.stringify(error, null, 2),
          );

          set({ isLoading: false });

          let errorMessage = "Login failed";

          if (
            error.code === "ERR_NETWORK" ||
            (error.name === "AxiosError" && !error.response)
          ) {
            errorMessage =
              "Cannot connect to server. Please check if the backend is running.";
          } else if (error.code === "ECONNREFUSED") {
            errorMessage = "Connection refused. Server may be down.";
          } else if (error.response?.status === 401) {
            errorMessage = "Invalid phone number or password";
          } else if (error.response?.status === 400) {
            errorMessage = error.response.data?.error || "Invalid request";
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message && error.message !== "[object Object]") {
            errorMessage = error.message;
          }

          console.error("❌ Final error message:", errorMessage);
          throw new Error(errorMessage);
        }
      },

      loginWithData: (user: User, token: string) => {
        localStorage.setItem("token", token);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
