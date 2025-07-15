"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  BarChart3,
} from "lucide-react";

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    name: string;
    orders: number;
    totalSpent: number;
  }>;
  dailyOrders: Array<{
    date: string;
    orders: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalytics({
        totalOrders: 1567,
        totalRevenue: 2456000,
        averageOrderValue: 1567,
        topProducts: [
          { name: "Organic Tomatoes", orders: 145, revenue: 348000 },
          { name: "Fresh Spinach", orders: 112, revenue: 224000 },
          { name: "Sweet Carrots", orders: 98, revenue: 196000 },
          { name: "Green Beans", orders: 87, revenue: 174000 },
          { name: "Baby Potatoes", orders: 76, revenue: 152000 },
        ],
        ordersByStatus: [
          { status: "Delivered", count: 1200, percentage: 76.6 },
          { status: "In Transit", count: 189, percentage: 12.1 },
          { status: "Pending", count: 89, percentage: 5.7 },
          { status: "Cancelled", count: 89, percentage: 5.7 },
        ],
        monthlyStats: [
          { month: "Jan", orders: 145, revenue: 348000 },
          { month: "Feb", orders: 167, revenue: 401000 },
          { month: "Mar", orders: 189, revenue: 454000 },
          { month: "Apr", orders: 156, revenue: 374000 },
          { month: "May", orders: 234, revenue: 562000 },
          { month: "Jun", orders: 276, revenue: 662000 },
        ],
        topCustomers: [
          { name: "John Doe", orders: 23, totalSpent: 45600 },
          { name: "Jane Smith", orders: 19, totalSpent: 38400 },
          { name: "Peter Kimani", orders: 17, totalSpent: 34200 },
          { name: "Mary Wanjiku", orders: 15, totalSpent: 30000 },
          { name: "David Mwangi", orders: 13, totalSpent: 26000 },
        ],
        dailyOrders: [
          { date: "Mon", orders: 45 },
          { date: "Tue", orders: 52 },
          { date: "Wed", orders: 38 },
          { date: "Thu", orders: 61 },
          { date: "Fri", orders: 73 },
          { date: "Sat", orders: 89 },
          { date: "Sun", orders: 67 },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) return null;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Track your platform's performance and sales metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
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
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {analytics.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg. Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {analytics.averageOrderValue.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">-2.1%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+15.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Orders Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Daily Orders
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.dailyOrders.map((day, index) => (
                  <div key={day.date} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {day.date}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="flex items-center">
                        <div
                          className="bg-primary-200 h-6 rounded"
                          style={{
                            width: `${(day.orders / Math.max(...analytics.dailyOrders.map((d) => d.orders))) * 100}%`,
                          }}
                        ></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {day.orders}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Status
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.ordersByStatus.map((status) => (
                  <div key={status.status}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {status.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {status.count} ({status.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Products
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {product.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        KES {product.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Customers
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.topCustomers.map((customer, index) => (
                  <div
                    key={customer.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {customer.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        KES {customer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Revenue Trend
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.monthlyStats.map((month) => (
                <div key={month.month} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {month.month}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {month.orders} orders
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        KES {month.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
                        style={{
                          width: `${(month.revenue / Math.max(...analytics.monthlyStats.map((m) => m.revenue))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
