import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
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
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryPhone: string;
  orderDate: string;
  estimatedDelivery: string;
  items: Array<{
    id: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
}

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const orders = response.data.orders || response.data;
      setOrders(orders);

      // Calculate stats
      const totalOrders = orders.length;
      const completedOrders = orders.filter(
        (o: Order) => o.status === "DELIVERED",
      ).length;
      const totalSpent = orders
        .filter((o: Order) => o.paymentStatus === "COMPLETED")
        .reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
      const pendingOrders = orders.filter(
        (o: Order) => o.status === "PENDING",
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
            paymentMethod: "M-PESA",
            status: "DELIVERED",
            deliveryAddress: "123 Main Street, Nairobi",
            deliveryPhone: "+254712345678",
            orderDate: new Date(Date.now() - 86400000).toISOString(),
            estimatedDelivery: new Date(Date.now() - 43200000).toISOString(),
            notes: "Please deliver in the morning",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            customerName: "John Doe",
            items: [
              {
                id: "item_1",
                quantity: 5,
                pricePerUnit: 120,
                totalPrice: 600,
                product: {
                  id: "prod_1",
                  name: "Organic Tomatoes",
                  images: []
                }
              },
            ],
          },
          {
            id: "order_2",
            orderNumber: "ORD-2024-002",
            totalAmount: 1800,
            paymentStatus: "PENDING",
            paymentMethod: "M-PESA",
            status: "PROCESSING",
            deliveryAddress: "456 Oak Avenue, Nakuru",
            deliveryPhone: "+254723456789",
            orderDate: new Date(Date.now() - 3600000).toISOString(),
            estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
            notes: "Call before delivery",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date().toISOString(),
            customerName: "John Doe",
            items: [
              {
                id: "item_3",
                quantity: 2,
                pricePerUnit: 900,
                totalPrice: 1800,
                product: {
                  id: "prod_2",
                  name: "Premium Maize",
                  images: []
                }
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
                toast.success("Using demo data - backend deployment needed");
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
          <div
            onClick={() => navigate('/customer/orders')}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>

          <div
            onClick={() => navigate('/customer/orders?filter=pending')}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-yellow-300 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-yellow-600">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600">
                    {stats.pendingOrders}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>

          <div
            onClick={() => navigate('/customer/orders?filter=completed')}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-green-600">
                    {stats.completedOrders}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>

          <div
            onClick={() => navigate('/customer/profile')}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-purple-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600">
                    KES {stats.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
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
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {order.items[0]?.product?.images?.[0] ? (
                      <img
                        src={order.items[0].product.images[0]}
                        alt={order.items[0].product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      Order #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""} • KES{" "}
                      {order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
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
                    {order.paymentMethod}
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
