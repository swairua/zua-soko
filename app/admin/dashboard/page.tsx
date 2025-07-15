"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users,
  Package,
  Truck,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Eye,
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

interface DashboardStats {
  totalFarmers: number;
  totalCustomers: number;
  totalDrivers: number;
  pendingConsignments: number;
  activeOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: "pending" | "confirmed" | "delivered";
  date: string;
}

interface PendingConsignment {
  id: string;
  productName: string;
  farmerName: string;
  quantity: string;
  pricePerUnit: number;
  totalValue: number;
  submittedDate: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalCustomers: 0,
    totalDrivers: 0,
    pendingConsignments: 0,
    activeOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingConsignments, setPendingConsignments] = useState<
    PendingConsignment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats and data
    setTimeout(() => {
      setStats({
        totalFarmers: 156,
        totalCustomers: 2340,
        totalDrivers: 45,
        pendingConsignments: 23,
        activeOrders: 89,
        totalRevenue: 2456000,
        monthlyRevenue: 456000,
        completedOrders: 1567,
      });

      setRecentOrders([
        {
          id: "ORD001",
          customerName: "John Doe",
          amount: 2500,
          status: "pending",
          date: "2024-01-16T10:30:00Z",
        },
        {
          id: "ORD002",
          customerName: "Jane Smith",
          amount: 1800,
          status: "confirmed",
          date: "2024-01-16T09:15:00Z",
        },
        {
          id: "ORD003",
          customerName: "Peter Kimani",
          amount: 3200,
          status: "delivered",
          date: "2024-01-16T08:00:00Z",
        },
      ]);

      setPendingConsignments([
        {
          id: "CONS001",
          productName: "Organic Tomatoes",
          farmerName: "Jane Wanjiku",
          quantity: "100kg",
          pricePerUnit: 120,
          totalValue: 12000,
          submittedDate: "2024-01-16T07:30:00Z",
        },
        {
          id: "CONS002",
          productName: "Fresh Spinach",
          farmerName: "Peter Mwangi",
          quantity: "30 bunches",
          pricePerUnit: 50,
          totalValue: 1500,
          submittedDate: "2024-01-16T06:45:00Z",
        },
        {
          id: "CONS003",
          productName: "Sweet Carrots",
          farmerName: "Mary Njeri",
          quantity: "75kg",
          pricePerUnit: 80,
          totalValue: 6000,
          submittedDate: "2024-01-15T16:20:00Z",
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const handleApproveConsignment = (id: string) => {
    console.log("Approving consignment:", id);
    // Implement approval logic
  };

  const handleRejectConsignment = (id: string) => {
    console.log("Rejecting consignment:", id);
    // Implement rejection logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Admin!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening on your platform today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Farmers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalFarmers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Drivers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDrivers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Consignments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingConsignments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.monthlyRevenue.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Completed Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Consignments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Consignments
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingConsignments.map((consignment) => (
                  <div
                    key={consignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {consignment.productName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {consignment.farmerName} • {consignment.quantity} • KES{" "}
                        {consignment.pricePerUnit}/unit
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        Total: KES {consignment.totalValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveConsignment(consignment.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRejectConsignment(consignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          #{order.id}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.customerName}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        KES {order.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title="View Order"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
