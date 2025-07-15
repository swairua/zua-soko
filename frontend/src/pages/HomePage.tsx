import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import {
  Leaf,
  Users,
  Truck,
  Star,
  Shield,
  ChevronDown,
  ChevronUp,
  Key,
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-primary-600" />,
      title: "Fresh Produce",
      description:
        "Direct from farmers to your table, ensuring maximum freshness and quality.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Support Farmers",
      description:
        "Help local farmers get fair prices for their hard work and dedication.",
    },
    {
      icon: <Truck className="w-8 h-8 text-primary-600" />,
      title: "Fast Delivery",
      description:
        "Quick and reliable delivery service to get your orders to you fresh.",
    },
    {
      icon: <Star className="w-8 h-8 text-primary-600" />,
      title: "Quality Assured",
      description:
        "All produce is quality-checked before delivery to ensure satisfaction.",
    },
  ];

  const demoAccounts = [
    {
      role: "Admin",
      phone: "+254712345678",
      description: "Manage users, approve farmers, view analytics",
      icon: <Shield className="w-5 h-5" />,
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      role: "Farmer",
      phone: "+254734567890",
      description: "Create consignments, manage produce listings",
      icon: <Leaf className="w-5 h-5" />,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      role: "Customer",
      phone: "+254756789012",
      description: "Browse marketplace, place orders, track deliveries",
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      role: "Driver",
      phone: "+254778901234",
      description: "Manage deliveries, update delivery status",
      icon: <Truck className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
  ];

  const getDashboardLink = () => {
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
        return "/marketplace";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-primary-600">Zuasoko</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connecting farmers and customers across Kenya. Fresh produce, fair
              prices, and sustainable agriculture for everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/marketplace"
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Browse Marketplace
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>

            {/* Demo Credentials Section */}
            {!isAuthenticated && (
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                  className="flex items-center justify-center gap-2 mx-auto text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>View Demo Credentials</span>
                  {showDemoCredentials ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showDemoCredentials && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">
                      Demo Account Access
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {demoAccounts.map((account, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${account.color} text-xs`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {account.icon}
                            <span className="font-semibold">
                              {account.role}
                            </span>
                          </div>
                          <div className="font-mono text-xs mb-1">
                            {account.phone}
                          </div>
                          <div className="text-xs opacity-80">
                            {account.description}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-3 text-xs text-gray-600">
                      Password for all accounts:{" "}
                      <span className="font-mono font-semibold">
                        password123
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Shield className="w-3 h-3" />
                        Login to any demo account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Zuasoko?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing agriculture in Kenya by creating direct
              connections between farmers and customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Quick Access (Only for logged-in admins) */}
      {isAuthenticated && user?.role === "ADMIN" && (
        <section className="bg-red-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Welcome back, Administrator. Manage your platform efficiently.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/admin/dashboard"
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  View Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="bg-white text-red-600 px-6 py-2 rounded-lg font-medium border border-red-600 hover:bg-red-50 transition-colors"
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/analytics"
                  className="bg-white text-red-600 px-6 py-2 rounded-lg font-medium border border-red-600 hover:bg-red-50 transition-colors"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and customers who are already part of the
            Zuasoko community.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Register Now
              </Link>
              <Link
                to="/login"
                className="bg-transparent text-white px-8 py-3 rounded-lg text-lg font-semibold border-2 border-white hover:bg-white hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
