import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/auth";
import ErrorBoundary from "./components/ErrorBoundary";
import { setupGlobalErrorHandling } from "./utils/errorHandler";
import ApiErrorDisplay from "./components/ApiErrorDisplay";
import ApiErrorTester from "./components/ApiErrorTester";

// Builder.io removed for stability

// Layout components
import Navbar from "./components/layout/Navbar";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import DatabaseStatus from "./components/DatabaseStatus";

// Page components
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/marketplace/MarketplacePage";
import ProductPage from "./pages/marketplace/ProductPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Farmer pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ProfilePage from "./pages/customer/ProfilePage";
import OrderHistoryPage from "./pages/customer/OrderHistoryPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import ConsignmentManagementPage from "./pages/admin/ConsignmentManagementPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import MarketplaceManagementPage from "./pages/admin/MarketplaceManagementPage";
import RegistrationFeesPage from "./pages/admin/RegistrationFeesPage";
import MpesaSettingsPage from "./pages/admin/MpesaSettingsPage";

// Driver pages
import DriverDashboard from "./pages/driver/DriverDashboard";
import AssignmentsPage from "./pages/driver/AssignmentsPage";
import WarehousePage from "./pages/driver/WarehousePage";

// Generic pages
import ComingSoonPage from "./pages/ComingSoonPage";
import TestMpesaPage from "./pages/TestMpesaPage";

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "FARMER":
      return <Navigate to="/farmer/dashboard" replace />;
    case "CUSTOMER":
      return <Navigate to="/customer/profile" replace />;
    case "ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    case "DRIVER":
      return <Navigate to="/driver/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Builder.io initialization removed for stability

  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <main className="pb-16 lg:pb-0">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route
                path="/marketplace/product/:id"
                element={<ProductPage />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Role-based dashboard redirect */}
              <Route path="/dashboard" element={<RoleBasedRedirect />} />

              {/* Farmer routes */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["FARMER"]}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Customer routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/consignments"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <ConsignmentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/marketplace"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <MarketplaceManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/registration-fees"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <RegistrationFeesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/mpesa-settings"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <MpesaSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Driver routes */}
              <Route
                path="/driver/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["DRIVER"]}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/assignments"
                element={
                  <ProtectedRoute allowedRoles={["DRIVER"]}>
                    <AssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/warehouse"
                element={
                  <ProtectedRoute allowedRoles={["DRIVER"]}>
                    <WarehousePage />
                  </ProtectedRoute>
                }
              />

              {/* Legacy routes - redirect to new structure */}
              <Route
                path="/farmer/consignments"
                element={<Navigate to="/farmer/dashboard" replace />}
              />
              <Route
                path="/farmer/wallet"
                element={<Navigate to="/farmer/dashboard" replace />}
              />

              {/* Test routes */}
              <Route path="/test-mpesa" element={<TestMpesaPage />} />

                            {/* Builder.io route removed for stability */}

              {/* Catch-all route */}
              <Route path="*" element={<ComingSoonPage />} />
            </Routes>
          </main>

          {/* Mobile bottom navigation for authenticated users */}
          {isAuthenticated && user && <MobileBottomNav />}

          {/* Database connection status */}
          <DatabaseStatus />

          <Toaster position="top-right" />
          <ApiErrorDisplay />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
