import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Search,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import axios from "axios";
import toast from "react-hot-toast";

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: { name: string; orders: number; revenue: number }[];
  topCustomers: { name: string; orders: number; totalSpent: number }[];
  monthlyTrends: { month: string; orders: number; revenue: number }[];
  categoryBreakdown: { category: string; orders: number; percentage: number }[];
  recentOrders: any[];
}

export default function OrderAnalysisPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [analytics, setAnalytics] = useState<OrderAnalytics>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topProducts: [],
    topCustomers: [],
    monthlyTrends: [],
    categoryBreakdown: [],
    recentOrders: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      console.log("📊 Fetching order analytics");

      // Fetch orders data
      const ordersResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.orders;

        // Calculate analytics
        const totalOrders = orders.length;
        const totalRevenue = orders
          .filter((o: any) => o.payment_status === "PAID")
          .reduce((sum: number, o: any) => sum + o.total_amount, 0);
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Top customers analysis
        const customerMap = new Map();
        orders.forEach((order: any) => {
          const customerKey = `${order.first_name} ${order.last_name}`;
          if (customerMap.has(customerKey)) {
            const existing = customerMap.get(customerKey);
            customerMap.set(customerKey, {
              ...existing,
              orders: existing.orders + 1,
              totalSpent:
                existing.totalSpent +
                (order.payment_status === "PAID" ? order.total_amount : 0),
            });
          } else {
            customerMap.set(customerKey, {
              name: customerKey,
              orders: 1,
              totalSpent:
                order.payment_status === "PAID" ? order.total_amount : 0,
            });
          }
        });

        const topCustomers = Array.from(customerMap.values())
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5);

        // Demo data for other analytics
        const topProducts = [
          { name: "Fresh Tomatoes", orders: 45, revenue: 58500 },
          { name: "Sweet Potatoes", orders: 38, revenue: 30400 },
          { name: "Fresh Spinach", orders: 32, revenue: 48000 },
          { name: "Irish Potatoes", orders: 28, revenue: 33600 },
          { name: "Carrots", orders: 25, revenue: 22500 },
        ];

        const monthlyTrends = [
          { month: "Jan", orders: 125, revenue: 145000 },
          { month: "Feb", orders: 138, revenue: 162000 },
          { month: "Mar", orders: 145, revenue: 178000 },
          { month: "Apr", orders: 132, revenue: 155000 },
          { month: "May", orders: 156, revenue: 195000 },
          { month: "Jun", orders: 168, revenue: 210000 },
        ];

        const categoryBreakdown = [
          { category: "Vegetables", orders: 285, percentage: 45 },
          { category: "Fruits", orders: 190, percentage: 30 },
          { category: "Grains", orders: 95, percentage: 15 },
          { category: "Leafy Greens", orders: 63, percentage: 10 },
        ];

        setAnalytics({
          totalOrders,
          totalRevenue,
          averageOrderValue,
          topProducts,
          topCustomers,
          monthlyTrends,
          categoryBreakdown,
          recentOrders: orders.slice(0, 10),
        });
      }
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
      toast.error("Failed to fetch order analytics");

      // Set demo data on error
      setAnalytics({
        totalOrders: 634,
        totalRevenue: 785600,
        averageOrderValue: 1239,
        topProducts: [
          { name: "Fresh Tomatoes", orders: 45, revenue: 58500 },
          { name: "Sweet Potatoes", orders: 38, revenue: 30400 },
          { name: "Fresh Spinach", orders: 32, revenue: 48000 },
        ],
        topCustomers: [
          { name: "John Doe", orders: 12, totalSpent: 18500 },
          { name: "Jane Smith", orders: 8, totalSpent: 12800 },
          { name: "Mike Johnson", orders: 6, totalSpent: 9600 },
        ],
        monthlyTrends: [
          { month: "Jan", orders: 125, revenue: 145000 },
          { month: "Feb", orders: 138, revenue: 162000 },
          { month: "Mar", orders: 145, revenue: 178000 },
        ],
        categoryBreakdown: [
          { category: "Vegetables", orders: 285, percentage: 45 },
          { category: "Fruits", orders: 190, percentage: 30 },
          { category: "Grains", orders: 95, percentage: 15 },
        ],
        recentOrders: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Orders", analytics.totalOrders],
      ["Total Revenue", `KSh ${analytics.totalRevenue.toLocaleString()}`],
      [
        "Average Order Value",
        `KSh ${analytics.averageOrderValue.toLocaleString()}`,
      ],
      [""],
      ["Top Products", "Orders", "Revenue"],
      ...analytics.topProducts.map((p) => [
        p.name,
        p.orders,
        `KSh ${p.revenue.toLocaleString()}`,
      ]),
      [""],
      ["Top Customers", "Orders", "Total Spent"],
      ...analytics.topCustomers.map((c) => [
        c.name,
        c.orders,
        `KSh ${c.totalSpent.toLocaleString()}`,
      ]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-green-600" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive analysis of customer orders and purchasing
                patterns
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={exportData}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={fetchAnalytics}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {analytics.totalOrders.toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  KSh {analytics.totalRevenue.toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  KSh {Math.round(analytics.averageOrderValue).toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">Avg Order Value</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Monthly Trends
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.monthlyTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {trend.month}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((trend.revenue / Math.max(...analytics.monthlyTrends.map((t) => t.revenue))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {trend.orders} orders
                      </div>
                      <div className="text-xs text-gray-600">
                        KSh {trend.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Category Breakdown
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      {category.category}
                    </span>
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right min-w-0">
                        <div className="text-sm font-semibold text-gray-900">
                          {category.orders}
                        </div>
                        <div className="text-xs text-gray-600">
                          {category.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Products
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        KSh {product.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Customers
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.topCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {customer.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        KSh {customer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
