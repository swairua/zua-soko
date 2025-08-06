import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Phone,
  AlertTriangle,
  Calendar,
  CreditCard,
} from "lucide-react";

export default function DriverDashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "delivery_issue",
    description: "",
    deliveryId: "",
    severity: "medium",
  });
  const [earningsData, setEarningsData] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    recentPayments: [],
  });

  // Fetch driver assignments
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/driver/assignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDeliveries(response.data.assignments || response.data);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);

      // If 404, provide fallback demo data until backend is deployed
      if (error.response?.status === 404) {
        console.log("🚛 Using fallback demo assignments (endpoint not found)");
        const demoAssignments = [
          {
            id: "assign_1",
            consignmentId: "cons_1",
            title: "Organic Tomatoes Delivery",
            farmerName: "Jane Wanjiku",
            farmerPhone: "+254712345678",
            pickupLocation: "Nakuru, Rift Valley",
            deliveryLocation: "Nairobi Central Market",
            quantity: "100 kg",
            status: "DRIVER_ASSIGNED",
            estimatedValue: 13000,
            distance: "180 km",
            estimatedTime: "3 hours",
          },
          {
            id: "assign_2",
            consignmentId: "cons_2",
            title: "Fresh Spinach Delivery",
            farmerName: "Peter Kamau",
            farmerPhone: "+254723456789",
            pickupLocation: "Kiambu, Central Kenya",
            deliveryLocation: "Westlands Market",
            quantity: "50 bunches",
            status: "IN_TRANSIT",
            estimatedValue: 2500,
            distance: "45 km",
            estimatedTime: "1.5 hours",
          },
        ];
        setDeliveries(demoAssignments);
        toast("Using demo data - backend deployment needed", { icon: "ℹ️" });
      } else {
        toast.error("Failed to fetch assignments");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delivery actions
  const handleStartPickup = async (deliveryId: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/driver/assignments/${deliveryId}/status`,
        { status: "IN_TRANSIT", notes: "Pickup started" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`Started pickup for delivery ${deliveryId}`);
      // Refresh the data to show updated status
      fetchAssignments();
    } catch (error: any) {
      console.error("Error updating delivery status:", error);
      if (error.response?.status === 404) {
        toast("Demo mode: Status update simulated", { icon: "ℹ���" });
        // In demo mode, just refresh to simulate the change
        fetchAssignments();
      } else {
        toast.error("Failed to start pickup");
      }
    }
  };

  const handleMarkDelivered = async (deliveryId: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/driver/assignments/${deliveryId}/status`,
        { status: "DELIVERED", notes: "Delivery completed" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`Marked delivery ${deliveryId} as completed`);
      // Refresh the data to show updated status
      fetchAssignments();
    } catch (error: any) {
      console.error("Error updating delivery status:", error);
      if (error.response?.status === 404) {
        toast("Demo mode: Delivery marked as completed", { icon: "ℹ️" });
        // In demo mode, just refresh to simulate the change
        fetchAssignments();
      } else {
        toast.error("Failed to mark as delivered");
      }
    }
  };

  const handleUpdateLocation = async () => {
    try {
      // Get current GPS location
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by this browser");
        return;
      }

      toast("Getting your location...", { icon: "ℹ️" });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Update location on server
            await axios.put(
              `${import.meta.env.VITE_API_URL}/driver/location`,
              {
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            toast.success(
              `Location updated: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            );
          } catch (error) {
            console.error("Error updating location on server:", error);
            toast.success(
              `Location obtained: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            );
            toast("Could not sync with server - using local GPS", {
              icon: "⚠️",
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            "Failed to get location. Please enable GPS and try again.",
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    } catch (error) {
      console.error("Location update error:", error);
      toast.error("Failed to update location");
    }
  };

  const handleAcceptNewDelivery = async () => {
    try {
      const response = await axios.get("/api/driver/available-deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.deliveries.length > 0) {
        navigate("/driver/assignments");
        toast.success(`Found ${response.data.deliveries.length} available deliveries!`);
      } else {
        toast("No deliveries available at the moment", { icon: "ℹ️" });
      }
    } catch (error) {
      console.error("Failed to fetch available deliveries:", error);
      toast.error("Failed to check available deliveries");
    }
  };

  const handleReportIssue = () => {
    setShowReportModal(true);
  };

  const handleViewEarnings = async () => {
    try {
      const response = await axios.get("/api/driver/earnings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setEarningsData(response.data.earnings);
        setShowEarningsModal(true);
      } else {
        toast.error("Failed to load earnings data");
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
      toast.error("Failed to load earnings data");
    }
  };

  const handleSubmitIssue = async () => {
    if (!reportForm.description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    try {
      const response = await axios.post("/api/driver/report-issue", reportForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Issue reported successfully!");
        setShowReportModal(false);
        setReportForm({
          type: "delivery_issue",
          description: "",
          deliveryId: "",
          severity: "medium",
        });
      } else {
        toast.error(response.data.message || "Failed to report issue");
      }
    } catch (error) {
      console.error("Failed to submit issue:", error);
      toast.error("Failed to report issue");
    }
  };

  const stats = [
    {
      title: "Deliveries Today",
      value: "8",
      icon: <Truck className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      title: "Total Earnings",
      value: "KES 12,500",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      title: "Average Rating",
      value: "4.8",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-yellow-500",
    },
    {
      title: "Pending Pickups",
      value: "3",
      icon: <AlertCircle className="w-6 h-6" />,
      color: "bg-red-500",
    },
  ];

  // Map API data to UI format
  const formattedDeliveries = (Array.isArray(deliveries) ? deliveries : []).map((consignment) => ({
    id: consignment.id,
    customer: `${consignment.farmer?.user?.firstName || "Unknown"} ${consignment.farmer?.user?.lastName || "Farmer"}`,
    location: consignment.location || "Unknown location",
    status:
      consignment.status === "DRIVER_ASSIGNED"
        ? "pending"
        : consignment.status === "IN_TRANSIT"
          ? "in_transit"
          : consignment.status === "DELIVERED"
            ? "delivered"
            : "unknown",
    time: new Date(consignment.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: `KES ${((consignment.finalPricePerUnit || consignment.bidPricePerUnit) * consignment.quantity).toLocaleString()}`,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Pickup";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your delivery schedule for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Driver Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Driver Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Available
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Vehicle</span>
              <span className="text-gray-900 font-medium">
                Pickup Truck - KCA123X
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Location</span>
              <span className="text-gray-900 font-medium">Nairobi CBD</span>
            </div>
            <button
              onClick={handleUpdateLocation}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Update Location
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleAcceptNewDelivery}
              className="flex items-center p-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-700">
                <Truck className="w-5 h-5" />
              </div>
              <div className="ml-3 text-left">
                <div className="font-medium text-blue-900">
                  Find New Deliveries
                </div>
                <div className="text-sm text-blue-700">
                  Browse available assignments
                </div>
              </div>
            </button>

            <button
              onClick={handleReportIssue}
              className="flex items-center p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors group"
            >
              <div className="p-2 bg-red-600 rounded-lg text-white group-hover:bg-red-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="ml-3 text-left">
                <div className="font-medium text-red-900">Report Issue</div>
                <div className="text-sm text-red-700">
                  Report delivery problems
                </div>
              </div>
            </button>

            <button
              onClick={handleViewEarnings}
              className="flex items-center p-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group"
            >
              <div className="p-2 bg-green-600 rounded-lg text-white group-hover:bg-green-700">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="ml-3 text-left">
                <div className="font-medium text-green-900">View Earnings</div>
                <div className="text-sm text-green-700">Check payment history</div>
              </div>
            </button>

            <button
              onClick={() => navigate("/driver/warehouse")}
              className="flex items-center p-4 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors group"
            >
              <div className="p-2 bg-purple-600 rounded-lg text-white group-hover:bg-purple-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="ml-3 text-left">
                <div className="font-medium text-purple-900">Warehouse Tasks</div>
                <div className="text-sm text-purple-700">
                  Manage inventory & pickups
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                toast.success("Emergency contact: +254 700 000 000");
              }}
              className="flex items-center p-4 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors group"
            >
              <div className="p-2 bg-orange-600 rounded-lg text-white group-hover:bg-orange-700">
                <Phone className="w-5 h-5" />
              </div>
              <div className="ml-3 text-left">
                <div className="font-medium text-orange-900">Emergency Contact</div>
                <div className="text-sm text-orange-700">
                  Get help when needed
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">5 deliveries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">1 delivery</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-orange-600">
                2 deliveries
              </span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-semibold text-gray-900">KES 2,400</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Deliveries
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading deliveries...
                  </td>
                </tr>
              ) : formattedDeliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No deliveries assigned
                  </td>
                </tr>
              ) : (
                (Array.isArray(formattedDeliveries) ? formattedDeliveries : []).map((delivery) => (
                  <tr key={delivery.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {delivery.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {delivery.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}
                      >
                        {getStatusText(delivery.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.status === "pending" && (
                        <button
                          onClick={() => handleStartPickup(delivery.id)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Start Pickup
                        </button>
                      )}
                      {delivery.status === "in_transit" && (
                        <button
                          onClick={() => handleMarkDelivered(delivery.id)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {delivery.status === "delivered" && (
                        <span className="text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Report Issue
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={reportForm.type}
                  onChange={(e) =>
                    setReportForm(prev => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="delivery_issue">Delivery Issue</option>
                  <option value="vehicle_problem">Vehicle Problem</option>
                  <option value="customer_issue">Customer Issue</option>
                  <option value="app_bug">App Bug</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={reportForm.severity}
                  onChange={(e) =>
                    setReportForm(prev => ({ ...prev, severity: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low - Minor inconvenience</option>
                  <option value="medium">Medium - Affects work efficiency</option>
                  <option value="high">High - Blocks completion</option>
                  <option value="critical">Critical - Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Delivery ID (Optional)
                </label>
                <input
                  type="text"
                  value={reportForm.deliveryId}
                  onChange={(e) =>
                    setReportForm(prev => ({ ...prev, deliveryId: e.target.value }))
                  }
                  placeholder="Enter delivery ID if applicable"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitIssue}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2 inline" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Modal */}
      {showEarningsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Earnings Overview
                </h3>
                <button
                  onClick={() => setShowEarningsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Earnings Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Today</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    KES {(earningsData?.today || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">This Week</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    KES {(earningsData?.week || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">This Month</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    KES {(earningsData?.month || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    KES {(earningsData?.total || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Recent Payments */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Recent Payments
                </h4>
                <div className="space-y-3">
                  {(Array.isArray(earningsData?.recentPayments) ? earningsData.recentPayments : []).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.date ? new Date(payment.date).toLocaleDateString() : 'Unknown Date'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.deliveries || 0} deliveries completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          KES {(payment.amount || 0).toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!earningsData?.recentPayments || earningsData.recentPayments.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <p>No recent payments found</p>
                      <p className="text-sm">Complete deliveries to start earning!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h5 className="font-medium text-blue-900">Payment Schedule</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      Payments are processed weekly every Friday via M-Pesa.
                      You'll receive payment for all completed deliveries from the previous week.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowEarningsModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
