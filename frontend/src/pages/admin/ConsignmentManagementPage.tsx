import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  Truck,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface Consignment {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  proposedPricePerUnit: number;
  finalPricePerUnit: number | null;
  adminSuggestedPrice: number | null;
  status: string;
  images: string[];
  harvestDate: string;
  expectedDeliveryDate: string;
  driverId: string | null;
  createdAt: string;
  farmer?: {
    name: string;
    phone: string;
    profile: any;
  };
}

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_type: string;
  vehicle_registration: string;
  status: string;
  location: string;
  total_deliveries: number;
  rating: number;
  earnings: number;
  verified: boolean;
}

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    label: "Pending Review",
  },
  APPROVED: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Approved",
  },
  REJECTED: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Rejected",
  },
  PRICE_SUGGESTED: {
    color: "bg-blue-100 text-blue-800",
    icon: DollarSign,
    label: "Price Suggested",
  },
  DRIVER_ASSIGNED: {
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
    label: "Driver Assigned",
  },
  IN_TRANSIT: {
    color: "bg-indigo-100 text-indigo-800",
    icon: Truck,
    label: "In Transit",
  },
  DELIVERED: {
    color: "bg-teal-100 text-teal-800",
    icon: Package,
    label: "Delivered",
  },
  COMPLETED: {
    color: "bg-gray-100 text-gray-800",
    icon: CheckCircle,
    label: "Completed",
  },
};

export default function ConsignmentManagementPage() {
  const { token } = useAuthStore();
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedConsignment, setSelectedConsignment] =
    useState<Consignment | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "suggest_price" | "assign_driver"
  >("approve");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");

  useEffect(() => {
    fetchConsignments();
    fetchDrivers();
  }, []);

  const fetchConsignments = async () => {
    try {
      console.log("📦 Fetching consignments from live database");
      const response = await axios.get(
        `/api/admin/consignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("📦 Consignments response:", response.data);

      // Handle both formats: direct array or object with consignments property
      const consignmentsData = Array.isArray(response.data)
        ? response.data
        : response.data.consignments || [];

      console.log("📦 Setting consignments array:", consignmentsData);
      setConsignments(Array.isArray(consignmentsData) ? consignmentsData : []);
    } catch (error) {
      console.error("❌ Error fetching consignments:", error);
      toast.error("Failed to fetch consignments from database");
      // Always set to empty array on error to prevent filter issues
      setConsignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log("🚛 Fetching drivers from live database");
      const response = await axios.get(
        `/api/admin/drivers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("🚛 Drivers response:", response.data);

      // Handle both formats: direct array or object with drivers property
      const driversData = Array.isArray(response.data)
        ? response.data
        : response.data.drivers || [];

      console.log("🚛 Setting drivers array:", driversData);
      setDrivers(Array.isArray(driversData) ? driversData : []);
    } catch (error) {
      console.error("❌ Error fetching drivers:", error);
      toast.error("Failed to fetch drivers from database");
      // Set empty array on error
      setDrivers([]);
    }
  };

  const handleAction = async (consignment: Consignment, action: string) => {
    setSelectedConsignment(consignment);
    setActionType(action as any);
    setShowActionModal(true);

    if (action === "suggest_price") {
      // Handle both field names for compatibility
      const currentPrice = consignment.proposedPricePerUnit || (consignment as any).price_per_unit || 0;
      setSuggestedPrice(currentPrice.toString());
    }
  };

  const submitAction = async () => {
    if (!selectedConsignment) return;

    try {
      let payload: any = {};

      switch (actionType) {
        case "approve":
          payload = { status: "APPROVED" };
          break;
        case "reject":
          payload = { status: "REJECTED" };
          break;
        case "suggest_price":
          if (!suggestedPrice || Number(suggestedPrice) <= 0) {
            toast.error("Please enter a valid price");
            return;
          }
          payload = {
            status: "PRICE_SUGGESTED",
            suggestedPrice: Number(suggestedPrice),
          };
          break;
        case "assign_driver":
          if (!selectedDriverId) {
            toast.error("Please select a driver");
            return;
          }
          payload = { status: "DRIVER_ASSIGNED", driverId: selectedDriverId };
          break;
      }

      await axios.patch(
        `/api/admin/consignments/${selectedConsignment.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Consignment updated successfully!");
      setShowActionModal(false);
      fetchConsignments();

      // Reset form
      setSuggestedPrice("");
      setSelectedDriverId("");
    } catch (error) {
      console.error("Error updating consignment:", error);
      toast.error("Failed to update consignment");
    }
  };

  // Ensure consignments is always an array to prevent filter errors
  const safeConsignments = Array.isArray(consignments) ? consignments : [];

  const filteredConsignments =
    filter === "ALL"
      ? safeConsignments
      : safeConsignments.filter((c) => c.status === filter);

  const getActionButtons = (consignment: Consignment) => {
    switch (consignment.status) {
      case "PENDING":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(consignment, "approve")}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction(consignment, "suggest_price")}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Suggest Price
            </button>
            <button
              onClick={() => handleAction(consignment, "reject")}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        );

      case "APPROVED":
        return (
          <button
            onClick={() => handleAction(consignment, "assign_driver")}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            Assign Driver
          </button>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consignments...</p>
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
                Consignment Management
              </h1>
              <p className="text-gray-600 mt-1">
                Review and manage farmer consignments
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {
                    safeConsignments.filter((c) => c.status === "PENDING")
                      .length
                  }
                </h3>
                <p className="text-gray-600 text-sm">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {
                    safeConsignments.filter((c) => c.status === "APPROVED")
                      .length
                  }
                </h3>
                <p className="text-gray-600 text-sm">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {
                    safeConsignments.filter(
                      (c) =>
                        c.status === "DRIVER_ASSIGNED" ||
                        c.status === "IN_TRANSIT",
                    ).length
                  }
                </h3>
                <p className="text-gray-600 text-sm">In Transit</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {
                    safeConsignments.filter(
                      (c) =>
                        c.status === "DELIVERED" || c.status === "COMPLETED",
                    ).length
                  }
                </h3>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              "ALL",
              "PENDING",
              "APPROVED",
              "DRIVER_ASSIGNED",
              "IN_TRANSIT",
              "DELIVERED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Consignments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Consignments ({filteredConsignments.length})
            </h2>
          </div>

          {filteredConsignments.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No consignments found
              </h3>
              <p className="text-gray-600">
                {filter === "ALL"
                  ? "No consignments have been submitted yet"
                  : `No ${filter.toLowerCase()} consignments`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConsignments.map((consignment) => {
                const statusInfo =
                  statusConfig[consignment.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo?.icon || Package;
                const totalValue =
                  (consignment.finalPricePerUnit ||
                    consignment.proposedPricePerUnit ||
                    0) * (consignment.quantity || 0);

                return (
                  <div key={consignment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-8 h-8 text-gray-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {consignment.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {consignment.description}
                            </p>

                            {/* Farmer Info */}
                            {consignment.farmer && (
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{consignment.farmer.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{consignment.farmer.phone}</span>
                                </div>
                                {consignment.farmer.profile?.county && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                      {consignment.farmer.profile.county}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Consignment Details */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>
                                {consignment.quantity} {consignment.unit}
                              </span>
                              <span>•</span>
                              <span>
                                KSh {consignment.proposedPricePerUnit} per{" "}
                                {consignment.unit}
                              </span>
                              <span>•</span>
                              <span>{consignment.category}</span>
                              <span>•</span>
                              <span>
                                Total: KSh {totalValue.toLocaleString()}
                              </span>
                            </div>

                            {/* Price Suggestion Info */}
                            {consignment.status === "PRICE_SUGGESTED" &&
                              consignment.adminSuggestedPrice && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-sm text-blue-700">
                                    <strong>Price suggested:</strong> KSh{" "}
                                    {consignment.adminSuggestedPrice} per{" "}
                                    {consignment.unit}
                                    <span className="ml-2 text-blue-600">
                                      (Total: KSh{" "}
                                      {(
                                        consignment.adminSuggestedPrice *
                                        consignment.quantity
                                      ).toLocaleString()}
                                      )
                                    </span>
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-3">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo?.label || consignment.status}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(consignment.createdAt).toLocaleDateString()}
                        </div>

                        {getActionButtons(consignment)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Modal */}
        {showActionModal && selectedConsignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {actionType === "approve" && "Approve Consignment"}
                  {actionType === "reject" && "Reject Consignment"}
                  {actionType === "suggest_price" && "Suggest New Price"}
                  {actionType === "assign_driver" && "Assign Driver"}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedConsignment.title}
                </p>
              </div>

              <div className="p-6">
                {actionType === "suggest_price" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current proposed price: KSh{" "}
                        {selectedConsignment.proposedPricePerUnit} per{" "}
                        {selectedConsignment.unit}
                      </label>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your suggested price (KSh per {selectedConsignment.unit}
                        )
                      </label>
                      <input
                        type="number"
                        value={suggestedPrice}
                        onChange={(e) => setSuggestedPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter suggested price"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                )}

                {actionType === "assign_driver" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Driver
                      </label>
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Choose a driver</option>
                        {Array.isArray(drivers)
                          ? drivers
                              .filter((d) => d.status === "ACTIVE" && d.verified)
                              .map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.first_name} {driver.last_name} - {driver.vehicle_type} (
                                  {driver.vehicle_registration}) - Rating:{" "}
                                  {driver.rating}⭐
                                </option>
                              ))
                          : []}
                      </select>
                    </div>
                  </div>
                )}

                {(actionType === "approve" || actionType === "reject") && (
                  <p className="text-gray-600">
                    Are you sure you want to {actionType} this consignment?
                  </p>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAction}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
