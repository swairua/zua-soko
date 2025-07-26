import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  X,
  Eye,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
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
      unit: string;
    };
  }>;
}

export default function OrderHistoryPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

      // Safely extract orders data
      let ordersData = [];
      if (response.data && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }

      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
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
      DELIVERED: CheckCircle,
      CANCELLED: X,
    };
    const Icon = icons[status as keyof typeof icons] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {/* Orders Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(Array.isArray(orders) ? orders : []).filter((o) => o?.status === "PENDING").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(Array.isArray(orders) ? orders : []).filter((o) => o?.status === "DELIVERED").length}
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
                  KES{" "}
                  {(Array.isArray(orders) ? orders : [])
                    .filter((o) => o?.paymentStatus === "COMPLETED")
                    .reduce((sum, o) => sum + (o?.totalAmount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start shopping to see your orders here
              </p>
              <button
                onClick={() => (window.location.href = "/marketplace")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(Array.isArray(orders) ? orders : []).map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
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
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {Array.isArray(order?.items) ? order.items.length : 0} item
                          {Array.isArray(order?.items) && order.items.length > 1 ? "s" : ""} • KES{" "}
                          {(order.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Ordered: {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment:{" "}
                      <span
                        className={`ml-1 px-2 py-0.5 rounded text-xs ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-2" />
                      Method: {order.paymentMethod}
                    </div>
                  </div>

                  {order.status === "SHIPPED" ||
                  order.status === "DELIVERED" ? (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        {order.status === "DELIVERED"
                          ? "Order delivered successfully!"
                          : "Your order is on the way!"}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Details #{selectedOrder.id.slice(-8)}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Order Status
                  </h4>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1">{selectedOrder.status}</span>
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Items Ordered
                  </h4>
                  <div className="space-y-3">
                    {(Array.isArray(selectedOrder?.items) ? selectedOrder.items : []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <img
                            src={item.product.images[0] || "/placeholder.jpg"}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} {item.product.unit} × KES{" "}
                              {item.pricePerUnit}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900">
                          KES {(item.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Delivery Information
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {selectedOrder.deliveryAddress}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedOrder.deliveryPhone}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Expected:{" "}
                      {new Date(
                        selectedOrder.estimatedDelivery,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      KES {(selectedOrder.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Payment via {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
