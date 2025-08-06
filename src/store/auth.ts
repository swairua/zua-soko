import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "../services/api";



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

          console.log("🔑 Login attempt:", { phone });

          const response = await apiService.login({ phone, password });

          console.log("✅ Login success:", response);

          const { user, token } = response;

          localStorage.setItem("authToken", token);
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
        localStorage.setItem("authToken", token);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("authToken");
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
