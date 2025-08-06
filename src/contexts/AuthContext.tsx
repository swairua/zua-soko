// This file has been deprecated in favor of Zustand auth store
// All components should use useAuthStore from "../../store/auth" instead
export function useAuth() {
  throw new Error(
    "useAuth from AuthContext is deprecated. Use useAuthStore from store/auth instead.",
  );
}
