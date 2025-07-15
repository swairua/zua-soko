"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  TrendingUp,
  Wallet,
  Bell,
  Sprout,
  Eye,
  Edit,
  Trash2,
  Brain,
} from "lucide-react";
import AIRecommendations from "@/components/ai/AIRecommendations";
import SuspenseWrapper from "@/components/SuspenseWrapper";

interface Consignment {
  id: string;
  produceName: string;
  category: string;
  quantity: number;
  unit: string;
  farmerPrice: number;
  adminPrice?: number;
  finalPrice?: number;
  status: string;
  description: string;
  images: string[];
  createdAt: string;
  adminNotes?: string;
}

interface FarmerWallet {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export default function FarmerDashboard() {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [wallet, setWallet] = useState<FarmerWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("consignments");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const controller = new AbortController();

    try {
      // TODO: Get farmer ID from session/auth
      const farmerId = "farmer-id-from-session";

      const [consignmentsRes, walletRes] = await Promise.all([
        fetch(`/api/farmer/consignments?farmerId=${farmerId}`, {
          signal: controller.signal,
        }),
        fetch(`/api/farmer/wallet?farmerId=${farmerId}`, {
          signal: controller.signal,
        }),
      ]);

      if (consignmentsRes.ok) {
        const consignmentsData = await consignmentsRes.json();
        setConsignments(consignmentsData);
      }

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to fetch dashboard data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PRICE_NEGOTIATION":
        return "bg-blue-100 text-blue-800";
      case "FARMER_APPROVED":
        return "bg-green-100 text-green-800";
      case "DRIVER_ASSIGNED":
        return "bg-purple-100 text-purple-800";
      case "COLLECTED":
        return "bg-indigo-100 text-indigo-800";
      case "IN_SHOP":
        return "bg-emerald-100 text-emerald-800";
      case "SOLD":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return "Pending Admin Approval";
      case "APPROVED":
        return "Approved by Admin";
      case "PRICE_NEGOTIATION":
        return "Price Under Review";
      case "FARMER_APPROVED":
        return "Price Accepted";
      case "DRIVER_ASSIGNED":
        return "Driver Assigned";
      case "COLLECTED":
        return "Collected by Driver";
      case "IN_SHOP":
        return "Available in Shop";
      case "SOLD":
        return "Sold";
      default:
        return status.replace("_", " ");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
                alt="Zuasoko Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Zuasoko Farmer
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <Link
                href="/auth/logout"
                className="text-gray-700 hover:text-primary-600"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Farmer!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your produce and track your earnings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Consignments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {consignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    consignments.filter(
                      (c) =>
                        c.status === "APPROVED" ||
                        c.status === "FARMER_APPROVED",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Wallet Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {wallet?.balance?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {wallet?.pendingBalance?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("consignments")}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "consignments"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                My Consignments
              </button>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "wallet"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Wallet
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "ai"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Assistant
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "consignments" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Produce Consignments
                  </h2>
                  <Link
                    href="/farmer/consignments/new"
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Submit New Produce
                  </Link>
                </div>

                {consignments.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No consignments yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start by submitting your first produce consignment
                    </p>
                    <Link
                      href="/farmer/consignments/new"
                      className="btn-primary"
                    >
                      Submit Produce
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consignments.map((consignment) => (
                      <div
                        key={consignment.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {consignment.produceName}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consignment.status)}`}
                              >
                                {getStatusText(consignment.status)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Category
                                </p>
                                <p className="font-medium">
                                  {consignment.category}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  Quantity
                                </p>
                                <p className="font-medium">
                                  {consignment.quantity} {consignment.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  Your Price
                                </p>
                                <p className="font-medium">
                                  KES {consignment.farmerPrice.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  {consignment.adminPrice
                                    ? "Admin Price"
                                    : "Final Price"}
                                </p>
                                <p className="font-medium text-primary-600">
                                  KES{" "}
                                  {(
                                    consignment.finalPrice ||
                                    consignment.adminPrice ||
                                    consignment.farmerPrice
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {consignment.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {consignment.description}
                              </p>
                            )}

                            {consignment.adminNotes && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                                <p className="text-sm font-medium text-blue-800">
                                  Admin Notes:
                                </p>
                                <p className="text-sm text-blue-700">
                                  {consignment.adminNotes}
                                </p>
                              </div>
                            )}

                            {consignment.status === "PRICE_NEGOTIATION" && (
                              <div className="flex space-x-2 mt-4">
                                <button className="btn-primary text-sm">
                                  Accept Admin Price
                                </button>
                                <button className="btn-secondary text-sm">
                                  Counter Offer
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            {consignment.status === "PENDING_APPROVAL" && (
                              <>
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-red-400 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wallet" && wallet && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4">
                      Available Balance
                    </h3>
                    <p className="text-3xl font-bold">
                      KES {wallet.balance.toLocaleString()}
                    </p>
                    <button className="mt-4 bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50">
                      Withdraw to M-Pesa
                    </button>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Pending Earnings
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      KES {wallet.pendingBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      From unsold consignments
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Total Earned</h4>
                    <p className="text-xl font-bold text-green-600">
                      KES {wallet.totalEarned.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">
                      Total Withdrawn
                    </h4>
                    <p className="text-xl font-bold text-blue-600">
                      KES {wallet.totalWithdrawn.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div>
                <SuspenseWrapper>
                  <AIRecommendations
                    farmerLocation="Kiambu"
                    currentSeason="Dry Season"
                  />
                </SuspenseWrapper>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
