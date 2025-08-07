import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthResetNotification from "../../components/AuthResetNotification";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const phoneValue = formData.phone.trim();
      const passwordValue = formData.password.trim();
      console.log("🔍 LoginPage - About to call login with:", {
        phone: phoneValue,
        password: passwordValue,
        formData: formData,
      });
      await login(phoneValue, passwordValue);
      toast.success("Login successful!");

      // Get the updated user from the store
      const { user } = useAuthStore.getState();

      // Redirect to role-specific dashboard
      if (user?.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user?.role === "FARMER") {
        navigate("/farmer/dashboard", { replace: true });
      } else if (user?.role === "CUSTOMER") {
        navigate("/customer/dashboard", { replace: true });
      } else if (user?.role === "DRIVER") {
        navigate("/driver/dashboard", { replace: true });
      } else {
        // Fallback to original behavior if role is unknown
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <AuthResetNotification />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g., +254712345678 or 0712345678"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  phone: "+254734567890",
                  password: "password123",
                });
              }}
              className="w-full mb-3 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
            >
              🧪 Quick Fill Farmer Demo (+254734567890 / password123)
            </button>

            <button
              type="button"
              onClick={async () => {
                // Emergency login for when API is completely broken
                try {
                  setFormData({
                    phone: "+254734567890",
                    password: "password123",
                  });
                  await login("+254734567890", "password123");
                  toast.success("Emergency demo login successful!");

                  // Get the updated user from the store
                  const { user } = useAuthStore.getState();

                  // Redirect to role-specific dashboard
                  if (user?.role === "ADMIN") {
                    navigate("/admin/dashboard", { replace: true });
                  } else if (user?.role === "FARMER") {
                    navigate("/farmer/dashboard", { replace: true });
                  } else if (user?.role === "CUSTOMER") {
                    navigate("/customer/dashboard", { replace: true });
                  } else if (user?.role === "DRIVER") {
                    navigate("/driver/dashboard", { replace: true });
                  } else {
                    navigate(from, { replace: true });
                  }
                } catch (error) {
                  console.error("Emergency login failed:", error);
                  toast.error("Even emergency login failed. Please try manual credentials.");
                }
              }}
              className="w-full mb-3 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700"
            >
              🚨 Emergency Login (If API is down)
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-600">
              <p>
                <strong>Admin:</strong> +254712345678 / password123
              </p>
              <p>
                <strong>Farmer (John):</strong> +254723456789 / password123
              </p>
              <p>
                <strong>Farmer (Mary):</strong> +254734567890 / password123
              </p>
              <p>
                <strong>Customer:</strong> +254745678901 / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
