import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  Clock,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Star,
  Truck,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryPhone?: string;
  orderDate?: string;
  estimatedDelivery?: string;
  orderNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  customerName?: string;
  items: Array<{
    id?: string;
    quantity: number;
    pricePerUnit?: number;
    totalPrice: number;
    productName?: string;
    unit?: string;
    product?: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
}

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    // Redirect to profile as the default page
    navigate("/customer/profile", { replace: true });
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await axios.get(
        "/api/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("🛒 Raw orders response:", response.data);

      // Safe orders extraction
      let orders = [];
      if (response.data && Array.isArray(response.data.orders)) {
        orders = response.data.orders;
      } else if (Array.isArray(response.data)) {
        orders = response.data;
      }

      console.log("🛒 Processed orders:", orders.length);
      setOrders(orders);

      // Calculate stats with safe array operations
      const safeOrders = Array.isArray(orders) ? orders : [];
      const totalOrders = safeOrders.length;
      const completedOrders = safeOrders.filter(
        (o: any) => o && o.status === "DELIVERED",
      ).length;
      const totalSpent = safeOrders
        .filter((o: any) => o && o.paymentStatus === "COMPLETED")
        .reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0);
      const pendingOrders = safeOrders.filter(
        (o: any) => o && o.status === "PENDING",
      ).length;

      setStats({
        totalOrders,
        completedOrders,
        totalSpent,
        pendingOrders,
      });
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);

      // If 404, provide fallback demo data until backend is deployed
      if (error.response?.status === 404) {
        console.log("🛒 Using fallback demo orders (endpoint not found)");
        const demoOrders = [
          {
            id: "order_1",
            orderNumber: "ORD-2024-001",
            totalAmount: 2500,
            paymentStatus: "COMPLETED",
            status: "DELIVERED",
            deliveryAddress: "123 Main Street, Nairobi",
            notes: "Please deliver in the morning",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            customerName: "John Doe",
            items: [
              {
                id: "item_1",
                productName: "Organic Tomatoes",
                quantity: 5,
                unit: "kg",
                pricePerUnit: 120,
                totalPrice: 600,
              },
            ],
          },
          {
            id: "order_2",
            orderNumber: "ORD-2024-002",
            totalAmount: 1800,
            paymentStatus: "PENDING",
            status: "PROCESSING",
            deliveryAddress: "456 Oak Avenue, Nakuru",
            notes: "Call before delivery",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date().toISOString(),
            customerName: "John Doe",
            items: [
              {
                id: "item_3",
                productName: "Premium Maize",
                quantity: 2,
                unit: "bags",
                pricePerUnit: 900,
                totalPrice: 1800,
              },
            ],
          },
        ];

        setOrders(demoOrders);
        setStats({
          totalOrders: 2,
          completedOrders: 1,
          totalSpent: 2500,
          pendingOrders: 1,
        });
        toast("Using demo data - backend deployment needed", { icon: "ℹ️" });
      } else {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: Clock,
      CONFIRMED: Package,
      PROCESSING: Package,
      SHIPPED: Truck,
      DELIVERED: Package,
      CANCELLED: Package,
    };
    const Icon = icons[status as keyof typeof icons] || Package;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your profile and view your order history
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/marketplace")}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Marketplace
            </button>

            <button
              onClick={() => navigate("/customer/orders")}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              View Orders
            </button>

            <button
              onClick={() => navigate("/customer/profile")}
              className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <User className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
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
          </div>
          <div className="p-6">
            {(Array.isArray(orders) ? orders : []).slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {Array.isArray(order?.items) && order.items[0]?.product?.images?.[0] ? (
                      <img
                        src={order.items[0].product.images[0]}
                        alt={order.items[0].product.name || 'Product'}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      Order #{order?.id ? String(order.id).slice(-8) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(order?.items) ? order.items.length : 0} item
                      {(Array.isArray(order?.items) && order.items.length > 1) ? "s" : ""} • KES{" "}
                      {(order?.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() :
                       order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.paymentMethod || 'Payment method not specified'}
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
                <button
                  onClick={() => navigate("/marketplace")}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
