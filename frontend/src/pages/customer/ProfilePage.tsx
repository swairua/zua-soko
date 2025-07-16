import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Shield,
  Calendar,
  ShoppingBag,
  Package,
  CreditCard,
  Clock,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  items: Array<{
    quantity: number;
    product: {
      name: string;
      images: string[];
    };
  }>;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    county: user?.county || "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOrders(response.data);

      // Calculate stats
      const totalOrders = response.data.length;
      const completedOrders = response.data.filter(
        (o: Order) => o.status === "DELIVERED",
      ).length;
      const totalSpent = response.data
        .filter((o: Order) => o.paymentStatus === "COMPLETED")
        .reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
      const pendingOrders = response.data.filter(
        (o: Order) => o.status === "PENDING",
      ).length;

      setStats({
        totalOrders,
        completedOrders,
        totalSpent,
        pendingOrders,
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      updateUser(response.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      county: user?.county || "",
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-indigo-100 text-indigo-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Profile Picture */}
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-600">{user?.role}</p>
                    <div className="flex items-center mt-1">
                      <Shield className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">
                        Verified Account
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user?.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user?.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user?.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <p className="text-gray-900 py-2">{user?.phone}</p>
                    <p className="text-sm text-gray-500">
                      Phone number cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      County
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.county}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            county: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select County</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Kiambu">Kiambu</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Eldoret">Eldoret</option>
                        <option value="Thika">Thika</option>
                        <option value="Nyeri">Nyeri</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{user?.county}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Member Since
                    </label>
                    <p className="text-gray-900 py-2">
                      {new Date(
                        (user as any)?.createdAt || new Date(),
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Quick Actions */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Total Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {stats.totalOrders}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {stats.pendingOrders}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {stats.completedOrders}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Total Spent</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    KES {stats.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/marketplace")}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </button>

                <button
                  onClick={() => navigate("/customer/orders")}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Package className="w-4 h-4 mr-2" />
                  View Order History
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View Cart
                </button>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
                <button
                  onClick={() => navigate("/customer/orders")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.id.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        KES {order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-4">
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No orders yet</p>
                    <button
                      onClick={() => navigate("/marketplace")}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
