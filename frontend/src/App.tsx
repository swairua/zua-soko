import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/marketplace/MarketplacePage";
import ProductPage from "./pages/marketplace/ProductPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";

// Profile Pages
import ProfilePage from "./pages/customer/ProfilePage";
import OrderHistoryPage from "./pages/customer/OrderHistoryPage";

// Farmer Pages
import ConsignmentsPage from "./pages/farmer/ConsignmentsPage";
import WalletPage from "./pages/farmer/WalletPage";

// Admin Pages
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import ConsignmentManagementPage from "./pages/admin/ConsignmentManagementPage";
import DriverManagementPage from "./pages/admin/DriverManagementPage";
import FarmerCategoriesPage from "./pages/admin/FarmerCategoriesPage";
import MarketplaceManagementPage from "./pages/admin/MarketplaceManagementPage";
import OrderAnalysisPage from "./pages/admin/OrderAnalysisPage";
import RegistrationFeesPage from "./pages/admin/RegistrationFeesPage";

// Driver Pages
import AssignmentsPage from "./pages/driver/AssignmentsPage";
import WarehousePage from "./pages/driver/WarehousePage";

// Other Pages
import ComingSoonPage from "./pages/ComingSoonPage";
import TestMpesaPage from "./pages/TestMpesaPage";

// Development Components
import EnvironmentTest from "./components/EnvironmentTest";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Protected Route Component
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Navbar />
              
              <main className="flex-grow">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                  </div>
                }>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/marketplace/products/:productId" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Customer Routes */}
                    <Route
                      path="/customer/dashboard"
                      element={
                        <ProtectedRoute role="customer">
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/profile"
                      element={
                        <ProtectedRoute role="customer">
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/orders"
                      element={
                        <ProtectedRoute role="customer">
                          <OrderHistoryPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Farmer Routes */}
                    <Route
                      path="/farmer/dashboard"
                      element={
                        <ProtectedRoute role="farmer">
                          <FarmerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farmer/consignments"
                      element={
                        <ProtectedRoute role="farmer">
                          <ConsignmentsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/farmer/wallet"
                      element={
                        <ProtectedRoute role="farmer">
                          <WalletPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Driver Routes */}
                    <Route
                      path="/driver/dashboard"
                      element={
                        <ProtectedRoute role="driver">
                          <DriverDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/driver/assignments"
                      element={
                        <ProtectedRoute role="driver">
                          <AssignmentsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/driver/warehouse"
                      element={
                        <ProtectedRoute role="driver">
                          <WarehousePage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute role="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/analytics"
                      element={
                        <ProtectedRoute role="admin">
                          <AnalyticsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/settings"
                      element={
                        <ProtectedRoute role="admin">
                          <AdminSettingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/consignments"
                      element={
                        <ProtectedRoute role="admin">
                          <ConsignmentManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/drivers"
                      element={
                        <ProtectedRoute role="admin">
                          <DriverManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/categories"
                      element={
                        <ProtectedRoute role="admin">
                          <FarmerCategoriesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/marketplace"
                      element={
                        <ProtectedRoute role="admin">
                          <MarketplaceManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <ProtectedRoute role="admin">
                          <OrderAnalysisPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/registration-fees"
                      element={
                        <ProtectedRoute role="admin">
                          <RegistrationFeesPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Development/Testing Routes */}
                    <Route path="/test-mpesa" element={<TestMpesaPage />} />
                    <Route path="/coming-soon" element={<ComingSoonPage />} />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<ComingSoonPage />} />
                  </Routes>
                </Suspense>
              </main>
              
              <Footer />
              <MobileBottomNav />
              
              {/* Development Tools */}
              {import.meta.env.DEV && <EnvironmentTest />}
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
