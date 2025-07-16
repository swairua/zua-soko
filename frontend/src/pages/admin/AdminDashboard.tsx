import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  BarChart3,
  Settings,
  UserCheck,
  FileText,
  Bell,
  Calendar,
  Activity,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";
import axios from "axios";

interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  activeConsignments: number;
  monthlyRevenue: number;
  recentActivities: any[];
  pendingConsignments: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  // Handle admin actions
  const handleReviewConsignment = (consignmentId: string) => {
    navigate(`/admin/consignments`);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      // In a real app, this would call a user management API
      // For now, we'll simulate the API call since there might not be a user approval endpoint
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

      toast.success(`User ${userId} approved successfully`);

      // Update the local state to reflect the change
      setStats((prev) => ({
        ...prev,
        recentUsers: prev.recentUsers.map((user) =>
          user.id === userId ? { ...user, status: "ACTIVE" } : user,
        ),
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
      }));
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const userData = response.data;
      setStats((prev) => ({
        ...prev,
        totalUsers: userData.length,
        pendingApprovals: userData.filter(
          (user: any) => user.status === "PENDING",
        ).length,
        recentUsers: userData.slice(0, 5).map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          status: user.verified ? "ACTIVE" : "PENDING",
          joinedAt: new Date(user.createdAt).toLocaleDateString(),
        })),
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users data");
    }
  };
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1247,
    pendingApprovals: 12,
    activeConsignments: 85,
    monthlyRevenue: 4567890,
    recentActivities: [],
    pendingConsignments: [],
    recentUsers: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    // Simulate loading other data
    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        recentActivities: [
          {
            id: 1,
            type: "user",
            message: "New farmer registration: John Kimani",
            time: "5 minutes ago",
            status: "pending",
          },
          {
            id: 2,
            type: "consignment",
            message: "Consignment submitted by Jane Wanjiku",
            time: "15 minutes ago",
            status: "pending",
          },
          {
            id: 3,
            type: "order",
            message: "Large order placed: KSh 25,000",
            time: "1 hour ago",
            status: "completed",
          },
          {
            id: 4,
            type: "driver",
            message: "Driver verification requested",
            time: "2 hours ago",
            status: "pending",
          },
        ],
        pendingConsignments: [
          {
            id: 1,
            title: "Organic Tomatoes - 100kg",
            farmer: "Jane Wanjiku",
            value: 13000,
            submittedAt: "2 hours ago",
          },
          {
            id: 2,
            title: "Premium Maize - 200kg",
            farmer: "Peter Kamau",
            value: 12000,
            submittedAt: "5 hours ago",
          },
          {
            id: 3,
            title: "Fresh Spinach - 50 bunches",
            farmer: "Grace Muthoni",
            value: 2500,
            submittedAt: "1 day ago",
          },
        ],
        recentUsers: [
          {
            id: 1,
            name: "John Kimani",
            role: "FARMER",
            status: "PENDING",
            joinedAt: "5 minutes ago",
          },
          {
            id: 2,
            name: "Sarah Wanjiru",
            role: "CUSTOMER",
            status: "ACTIVE",
            joinedAt: "2 hours ago",
          },
          {
            id: 3,
            name: "David Mwangi",
            role: "DRIVER",
            status: "PENDING",
            joinedAt: "1 day ago",
          },
        ],
      }));
      setLoading(false);
    }, 1000);
  }, []);

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage platform users",
      icon: Users,
      color: "bg-blue-500",
      link: "/admin/users",
      count: stats.totalUsers,
    },
    {
      title: "Review Consignments",
      description: "Approve pending consignments",
      icon: Package,
      color: "bg-green-500",
      link: "/admin/consignments",
      count: stats.pendingApprovals,
    },
    {
      title: "View Analytics",
      description: "Platform insights and metrics",
      icon: BarChart3,
      color: "bg-purple-500",
      link: "/admin/analytics",
      count: null,
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      color: "bg-gray-500",
      link: "/admin/settings",
      count: null,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="w-4 h-4" />;
      case "consignment":
        return <Package className="w-4 h-4" />;
      case "order":
        return <DollarSign className="w-4 h-4" />;
      case "driver":
        return <Truck className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening on your platform today.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.totalUsers}
                </h3>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.pendingApprovals}
                </h3>
                <p className="text-gray-600 text-sm">Pending Approvals</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.activeConsignments}
                </h3>
                <p className="text-gray-600 text-sm">Active Consignments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.monthlyRevenue)}
                </h3>
                <p className="text-gray-600 text-sm">Monthly Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  {action.count !== null && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {action.count}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {action.description}
                </p>
                <div className="flex items-center mt-3 text-primary-600 group-hover:text-primary-700">
                  <span className="text-sm font-medium">Manage</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="p-6">
                  <div className="flex items-start">
                    <div
                      className={`p-2 rounded-lg ${getStatusColor(activity.status)} mr-4`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    {activity.status === "pending" && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/admin/notifications"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all activities →
              </Link>
            </div>
          </div>

          {/* Pending Consignments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pending Consignments
                </h3>
                <Package className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.pendingConsignments.map((consignment) => (
                <div key={consignment.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {consignment.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        by {consignment.farmer}
                      </p>
                      <p className="text-sm text-gray-500">
                        {consignment.submittedAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(consignment.value)}
                      </p>
                      <button
                        onClick={() => handleReviewConsignment(consignment.id)}
                        className="mt-2 bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/admin/consignments"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all consignments →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Users
              </h3>
              <UserCheck className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.joinedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.status === "PENDING" ? (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/admin/users")}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-200">
            <Link
              to="/admin/users"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all users →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
