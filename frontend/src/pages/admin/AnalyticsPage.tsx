import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Truck,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

interface DashboardStats {
  totalUsers: number;
  totalConsignments: number;
  totalOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  pendingApprovals: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface ChartData {
  name: string;
  value: number;
  change?: number;
}

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalConsignments: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    pendingApprovals: 0,
    userGrowth: 0,
    revenueGrowth: 0,
  });

  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching analytics data from database");

      // Fetch only stats endpoint (monthly endpoint doesn't exist yet)
      const statsResponse = await apiService.get("/admin/analytics/stats");

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
        console.log("✅ Analytics stats loaded:", statsResponse.data.stats);
      }

      // Set fallback monthly data for chart
      const fallbackMonthlyData = [
        { month: "Jan", revenue: 42000, orders: 156, users: 89 },
        { month: "Feb", revenue: 38000, orders: 142, users: 112 },
        { month: "Mar", revenue: 45000, orders: 168, users: 95 },
        { month: "Apr", revenue: 52000, orders: 195, users: 134 },
        { month: "May", revenue: 48000, orders: 178, users: 108 },
        { month: "Jun", revenue: 55000, orders: 205, users: 167 },
      ];
      setMonthlyData(fallbackMonthlyData);
      console.log("✅ Monthly chart data set (fallback data)");
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");

      // Set fallback data
      setStats({
        totalUsers: 1247,
        totalConsignments: 856,
        totalOrders: 2341,
        totalRevenue: 4567890,
        activeDrivers: 23,
        pendingApprovals: 12,
        userGrowth: 12.5,
        revenueGrowth: 8.2,
      });

      setMonthlyData([
        { name: "Jan", value: 320000 },
        { name: "Feb", value: 280000 },
        { name: "Mar", value: 450000 },
        { name: "Apr", value: 380000 },
        { name: "May", value: 520000 },
        { name: "Jun", value: 490000 },
        { name: "Jul", value: 640000 },
        { name: "Aug", value: 580000 },
        { name: "Sep", value: 720000 },
        { name: "Oct", value: 680000 },
        { name: "Nov", value: 750000 },
        { name: "Dec", value: 820000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [categoryData] = useState<ChartData[]>([
    { name: "Vegetables", value: 45 },
    { name: "Fruits", value: 25 },
    { name: "Grains", value: 15 },
    { name: "Leafy Greens", value: 10 },
    { name: "Others", value: 5 },
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      type: "order",
      message: "New order placed by Mary Wangari",
      amount: "KSh 2,450",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "consignment",
      message: "Consignment approved for Jane Wanjiku",
      amount: "KSh 15,000",
      time: "12 minutes ago",
    },
    {
      id: 3,
      type: "user",
      message: "New farmer registered: Peter Kamau",
      amount: "",
      time: "25 minutes ago",
    },
    {
      id: 4,
      type: "delivery",
      message: "Delivery completed by Michael Kiprotich",
      amount: "KSh 3,200",
      time: "1 hour ago",
    },
    {
      id: 5,
      type: "payment",
      message: "Payment processed for Grace Muthoni",
      amount: "KSh 8,750",
      time: "2 hours ago",
    },
  ]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-blue-600" />;
      case "consignment":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "user":
        return <Users className="w-4 h-4 text-purple-600" />;
      case "delivery":
        return <Truck className="w-4 h-4 text-orange-600" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Platform insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">
                +{stats.revenueGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.totalUsers || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">
                +{stats.userGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+15.3%</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Drivers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeDrivers}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+2</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Revenue
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-primary-600 rounded-t w-full transition-all duration-300 hover:bg-primary-700"
                    style={{
                      height: `${(item.value / Math.max(...monthlyData.map((d) => d.value))) * 100}%`,
                      minHeight: "4px",
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Product Categories
              </h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-3"
                      style={{
                        backgroundColor: `hsl(${index * 72}, 70%, 50%)`,
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-medium text-gray-900">
                      {activity.amount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-500">
                View and manage platform users
              </p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Package className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Review Consignments</h4>
              <p className="text-sm text-gray-500">
                Approve pending consignments
              </p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Download className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Generate Reports</h4>
              <p className="text-sm text-gray-500">
                Download detailed analytics
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
