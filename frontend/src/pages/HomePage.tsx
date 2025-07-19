import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useAppDownload } from "../hooks/useAppDownload";
import { ApkInfoModal } from "../components/ApkInfoModal";
// Builder.io imports (optional)
import {
  Leaf,
  Users,
  Truck,
  Star,
  Shield,
  ChevronDown,
  ChevronUp,
  Key,
  Smartphone,
  Download,
  Bell,
  MapPin,
  Clock,
  CreditCard,
  QrCode,
  Play,
  Apple,
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [showApkInfoModal, setShowApkInfoModal] = useState(false);
  const {
    isAvailable: apkAvailable,
    appInfo,
    loading: apkLoading,
    downloadApp,
  } = useAppDownload();

  // Builder.io content (disabled for now)
  const heroContent = null;
  const featuresContent = null;

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

  const mobileAppFeatures = [
    {
      icon: <Bell className="w-6 h-6 text-primary-600" />,
      title: "Push Notifications",
      description:
        "Stay updated on orders, deliveries, and fresh produce availability",
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary-600" />,
      title: "Live Tracking",
      description:
        "Track your deliveries in real-time from farm to your doorstep",
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-600" />,
      title: "Quick Orders",
      description: "Reorder your favorites with just one tap",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-primary-600" />,
      title: "Mobile Payments",
      description: "Secure M-Pesa integration for seamless transactions",
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
      {/* Builder.io Hero Content */}
      {heroContent && (
        <BuilderSection
          sectionName="homepage-hero"
          content={heroContent}
          data={{ user, isAuthenticated }}
        />
      )}

      {/* Default Hero Section */}
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

      {/* Builder.io Features Content */}
      {featuresContent && (
        <BuilderSection
          sectionName="homepage-features"
          content={featuresContent}
          data={{ features, user, isAuthenticated }}
        />
      )}

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

      {/* Mobile App Download Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Smartphone className="w-4 h-4" />
                  Now Available on Mobile
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Take Zuasoko{" "}
                  <span className="text-primary-600">Anywhere</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Access fresh produce, manage your farm, or track deliveries on
                  the go. Our mobile app brings the complete Zuasoko experience
                  to your smartphone.
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => {
                    if (apkAvailable) {
                      downloadApp();
                    } else {
                      alert(
                        "Android app coming soon! 🚀\n\nWe're putting the finishing touches on our mobile app. Stay tuned for the official release!",
                      );
                    }
                  }}
                  disabled={apkLoading}
                  className={`group px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    apkAvailable
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  } ${apkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="bg-white p-1 rounded">
                    {apkLoading ? (
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    ) : (
                      <Play className="w-6 h-6 text-gray-900" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">
                      {apkAvailable ? "DOWNLOAD" : "GET IT ON"}
                    </div>
                    <div className="text-lg font-semibold">
                      {apkAvailable ? "Direct APK" : "Google Play"}
                    </div>
                    {apkAvailable && appInfo && (
                      <div className="text-xs text-gray-300">
                        v{appInfo.version} • {appInfo.size}
                      </div>
                    )}
                  </div>
                  <Download className="w-4 h-4 ml-2 group-hover:animate-bounce" />
                  {apkAvailable && (
                    <div className="bg-green-400 text-green-900 px-2 py-1 rounded text-xs font-bold ml-2">
                      READY
                    </div>
                  )}
                </button>

                <a
                  href="#"
                  className="group bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg opacity-60 cursor-not-allowed"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "iOS app coming soon! 🍎\n\nWe're working hard to bring Zuasoko to the App Store. Keep an eye out for updates!",
                    );
                  }}
                >
                  <div className="bg-white p-1 rounded">
                    <Apple className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                  <div className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-bold ml-2">
                    SOON
                  </div>
                </a>
              </div>

              {/* App Info Button */}
              {apkAvailable && appInfo && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowApkInfoModal(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm border border-primary-300 hover:border-primary-500 px-4 py-2 rounded-lg transition-colors"
                  >
                    View App Details & Permissions
                  </button>
                </div>
              )}

              {/* App Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mobileAppFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="flex-shrink-0 p-2 bg-primary-50 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Phone Mockup and QR Code */}
            <div className="relative">
              {/* Phone Mockup */}
              <div className="relative mx-auto w-64 h-96 lg:w-80 lg:h-[480px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] shadow-2xl">
                  <div className="absolute inset-2 bg-white rounded-[2rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-primary-600 h-8 flex items-center justify-between px-4">
                      <div className="text-white text-xs font-medium">9:41</div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* App Screenshot */}
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Zuasoko</div>
                          <div className="text-xs text-gray-500">
                            Fresh from farm
                          </div>
                        </div>
                      </div>

                      {/* Sample Product Cards */}
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Organic Tomatoes
                            </div>
                            <div className="text-xs text-gray-500">
                              Fresh from Nakuru
                            </div>
                            <div className="text-primary-600 font-bold text-sm">
                              KES 120/kg
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Fresh Carrots
                            </div>
                            <div className="text-xs text-gray-500">
                              Direct from farm
                            </div>
                            <div className="text-primary-600 font-bold text-sm">
                              KES 80/kg
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Spinach Bunch
                            </div>
                            <div className="text-xs text-gray-500">
                              Locally grown
                            </div>
                            <div className="text-primary-600 font-bold text-sm">
                              KES 50/bunch
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Navigation */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg p-2">
                        <div className="flex justify-around">
                          <div className="p-2 bg-primary-600 rounded-lg">
                            <Leaf className="w-4 h-4 text-white" />
                          </div>
                          <div className="p-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="p-2">
                            <Bell className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="p-2">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="mt-8 text-center">
                <div className="inline-block p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="w-12 h-12 text-gray-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    Scan to Download
                  </div>
                  <div className="text-xs text-gray-500">Coming Soon</div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary-200 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-green-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1/2 -right-6 w-6 h-6 bg-yellow-200 rounded-full animate-pulse delay-700"></div>
            </div>
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

      {/* APK Info Modal */}
      {showApkInfoModal && appInfo && (
        <ApkInfoModal
          isOpen={showApkInfoModal}
          onClose={() => setShowApkInfoModal(false)}
          appInfo={appInfo}
          onDownload={downloadApp}
        />
      )}
    </div>
  );
}
