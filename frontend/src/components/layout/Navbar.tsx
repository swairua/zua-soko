import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useCart } from "../../store/cart";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Store,
  UserCircle,
} from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case "FARMER":
        return "/farmer/dashboard";
      case "CUSTOMER":
        return "/customer/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      case "DRIVER":
        return "/driver/dashboard";
      default:
        return "/";
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={closeMobileMenu}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd9c4872a6831464dbf1ea37e56217255%2F25be9c7c97144293ad2d62bc18c010f8?format=webp&width=800"
                  alt="Zuasoko Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                Zuasoko
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/marketplace"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Marketplace
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>

                {/* Cart for authenticated users */}
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart?.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
                </Link>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {user?.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Cart for guest users */}
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart?.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
                </Link>

                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button and cart */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Cart - Available for all users */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <ShoppingCart className="w-5 h-5" />
              {cart?.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>

            <Link
              to="/marketplace"
              className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <Store className="w-5 h-5" />
              Marketplace
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  <UserCircle className="w-5 h-5" />
                  Dashboard
                </Link>

                {/* User info section */}
                <div className="px-3 py-3 border-t border-gray-200 mt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user?.role?.toLowerCase()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-3 py-3 border-t border-gray-200 mt-2 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
