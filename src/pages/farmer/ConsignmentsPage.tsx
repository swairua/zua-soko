import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Wallet,
  Eye,
  AlertCircle,
  Calendar,
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

export default function ConsignmentsPage() {
  const { user, token } = useAuthStore();
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    proposedPricePerUnit: "",
    harvestDate: "",
    expectedDeliveryDate: "",
  });

  const categories = [
    "Vegetables",
    "Fruits",
    "Grains",
    "Leafy Greens",
    "Root Vegetables",
    "Herbs",
    "Cereals",
    "Legumes",
  ];

  const units = ["kg", "bunch", "bag", "crate", "piece", "liter"];

  useEffect(() => {
    fetchConsignments();
  }, []);

  const fetchConsignments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/farmer/consignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setConsignments(response.data.consignments);
    } catch (error) {
      console.error("Error fetching consignments:", error);
      toast.error("Failed to fetch consignments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.category ||
      !formData.quantity ||
      !formData.unit ||
      !formData.proposedPricePerUnit
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/farmer/consignments`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Consignment submitted successfully!");
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        quantity: "",
        unit: "",
        proposedPricePerUnit: "",
        harvestDate: "",
        expectedDeliveryDate: "",
      });
      fetchConsignments();
    } catch (error) {
      console.error("Error creating consignment:", error);
      toast.error("Failed to create consignment");
    }
  };

  const handleAcceptSuggestedPrice = async (consignmentId: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/farmer/consignments/${consignmentId}/accept-price`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Price accepted successfully!");
      fetchConsignments();
    } catch (error) {
      toast.error("Failed to accept suggested price");
    }
  };

  const calculateTotalValue = (consignment: Consignment) => {
    const price =
      consignment.finalPricePerUnit ||
      consignment.adminSuggestedPrice ||
      consignment.proposedPricePerUnit;
    return price * consignment.quantity;
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
                My Consignments
              </h1>
              <p className="text-gray-600 mt-1">
                Submit produce for approval and track your consignment status
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Consignment
            </button>
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
                  {consignments.filter((c) => c.status === "PENDING").length}
                </h3>
                <p className="text-gray-600 text-sm">Pending</p>
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
                    consignments.filter(
                      (c) =>
                        c.status === "APPROVED" ||
                        c.status === "DRIVER_ASSIGNED",
                    ).length
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
                    consignments.filter(
                      (c) =>
                        c.status === "IN_TRANSIT" || c.status === "DELIVERED",
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
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  KSh{" "}
                  {consignments
                    .filter(
                      (c) =>
                        c.status === "DRIVER_ASSIGNED" ||
                        c.status === "IN_TRANSIT" ||
                        c.status === "DELIVERED" ||
                        c.status === "COMPLETED",
                    )
                    .reduce((sum, c) => sum + calculateTotalValue(c), 0)
                    .toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">Total Earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consignments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Consignments
            </h2>
          </div>

          {consignments.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No consignments yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first consignment to start selling your produce
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Create Consignment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {consignments.map((consignment) => {
                const statusInfo =
                  statusConfig[consignment.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo?.icon || Package;

                return (
                  <div key={consignment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-8 h-8 text-gray-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {consignment.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {consignment.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                            </div>

                            {consignment.status === "PRICE_SUGGESTED" &&
                              consignment.adminSuggestedPrice && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                      Admin suggested a new price
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-blue-700">
                                      Suggested: KSh{" "}
                                      {consignment.adminSuggestedPrice} per{" "}
                                      {consignment.unit}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleAcceptSuggestedPrice(
                                          consignment.id,
                                        )
                                      }
                                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"
                                    >
                                      Accept Price
                                    </button>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-2">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo?.label || consignment.status}
                        </div>

                        <div className="text-sm text-gray-500">
                          Total: KSh{" "}
                          {calculateTotalValue(consignment).toLocaleString()}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(consignment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Consignment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Consignment
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Submit your produce for admin approval
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Fresh Organic Tomatoes - 100kg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your produce quality, farming methods, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select unit</option>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Price per Unit (KSh) *
                    </label>
                    <input
                      type="number"
                      value={formData.proposedPricePerUnit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proposedPricePerUnit: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harvestDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expectedDeliveryDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Submit Consignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
