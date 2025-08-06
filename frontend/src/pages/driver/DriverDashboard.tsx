import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DriverDashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

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
                toast.success("Using demo data - backend deployment needed");
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
                toast.success("Demo mode: Status update simulated");
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
                toast.success("Demo mode: Delivery marked as completed");
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

  const handleAcceptNewDelivery = () => {
    toast.success("Looking for new deliveries...");
    // In a real app, this would search for available deliveries
  };

  const handleReportIssue = () => {
    toast("Issue reporting form would open here", { icon: "ℹ️" });
    // In a real app, this would open an issue reporting form
  };

  const handleViewEarnings = () => {
    toast("Earnings details would be shown here", { icon: "ℹ️" });
    // In a real app, this would show detailed earnings breakdown
  };

  const stats = [
    {
      title: "Deliveries Today",
      value: "8",
      icon: <Truck className="w-6 h-6" />,
      color: "bg-blue-500",
      onClick: () => navigate('/driver/assignments?filter=today'),
    },
    {
      title: "Total Earnings",
      value: "KES 12,500",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-green-500",
      onClick: () => navigate('/driver/earnings'),
    },
    {
      title: "Average Rating",
      value: "4.8",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-yellow-500",
      onClick: () => navigate('/driver/profile'),
    },
    {
      title: "Pending Pickups",
      value: "3",
      icon: <AlertCircle className="w-6 h-6" />,
      color: "bg-red-500",
      onClick: () => navigate('/driver/assignments?filter=pending'),
    },
  ];

  // Map API data to UI format
  const formattedDeliveries = deliveries.map((consignment) => ({
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
          <div className="space-y-3">
            <button
              onClick={handleAcceptNewDelivery}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">
                Accept New Delivery
              </div>
              <div className="text-sm text-gray-600">
                Find deliveries near you
              </div>
            </button>
            <button
              onClick={handleReportIssue}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Report Issue</div>
              <div className="text-sm text-gray-600">
                Report delivery problems
              </div>
            </button>
            <button
              onClick={handleViewEarnings}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">View Earnings</div>
              <div className="text-sm text-gray-600">Check payment history</div>
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
                formattedDeliveries.map((delivery) => (
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
    </div>
  );
}
