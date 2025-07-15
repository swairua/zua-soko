import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Truck,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Navigation,
  Phone,
  User,
  Package,
  AlertCircle,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface Assignment {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  finalPricePerUnit: number;
  status: string;
  images: string[];
  expectedDeliveryDate: string;
  farmer?: {
    name: string;
    phone: string;
    profile: any;
  };
  createdAt: string;
}

const statusConfig = {
  DRIVER_ASSIGNED: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    label: "Ready for Pickup",
    action: "Start Transport",
  },
  IN_TRANSIT: {
    color: "bg-blue-100 text-blue-800",
    icon: Navigation,
    label: "In Transit",
    action: "Mark as Delivered",
  },
  DELIVERED: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Delivered",
    action: null,
  },
};

export default function AssignmentsPage() {
  const { token } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentStatus = async (
    assignmentId: string,
    newStatus: string,
  ) => {
    setUpdatingStatus(assignmentId);

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/driver/assignments/${assignmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Assignment status updated successfully!");
      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment status:", error);
      toast.error("Failed to update assignment status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusUpdate = (assignment: Assignment) => {
    if (assignment.status === "DRIVER_ASSIGNED") {
      updateAssignmentStatus(assignment.id, "IN_TRANSIT");
    } else if (assignment.status === "IN_TRANSIT") {
      updateAssignmentStatus(assignment.id, "DELIVERED");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Assignments
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your transport assignments and deliveries
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Driver Dashboard</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {
                    assignments.filter((a) => a.status === "DRIVER_ASSIGNED")
                      .length
                  }
                </h3>
                <p className="text-gray-600 text-sm">Ready for Pickup</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Navigation className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {assignments.filter((a) => a.status === "IN_TRANSIT").length}
                </h3>
                <p className="text-gray-600 text-sm">In Transit</p>
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
                  {assignments.filter((a) => a.status === "DELIVERED").length}
                </h3>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Assignments
            </h2>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assignments yet
              </h3>
              <p className="text-gray-600">
                You'll see your transport assignments here when they are
                assigned to you
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignments.map((assignment) => {
                const statusInfo =
                  statusConfig[assignment.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo?.icon || Package;
                const totalValue =
                  assignment.finalPricePerUnit * assignment.quantity;

                return (
                  <div key={assignment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-8 h-8 text-gray-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {assignment.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {assignment.description}
                            </p>

                            {/* Assignment Details */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>
                                {assignment.quantity} {assignment.unit}
                              </span>
                              <span>•</span>
                              <span>{assignment.category}</span>
                              <span>•</span>
                              <span>
                                Value: KSh {totalValue.toLocaleString()}
                              </span>
                            </div>

                            {/* Farmer Contact Info */}
                            {assignment.farmer && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">
                                  Farmer Contact
                                </h4>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-700">
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{assignment.farmer.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <a
                                      href={`tel:${assignment.farmer.phone}`}
                                      className="hover:underline"
                                    >
                                      {assignment.farmer.phone}
                                    </a>
                                  </div>
                                  {assignment.farmer.profile?.county && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>
                                        {assignment.farmer.profile.county}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Delivery Info */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Expected:{" "}
                                  {new Date(
                                    assignment.expectedDeliveryDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-3">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo?.label || assignment.status}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          Assigned:{" "}
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </div>

                        {/* Action Button */}
                        {statusInfo?.action && (
                          <button
                            onClick={() => handleStatusUpdate(assignment)}
                            disabled={updatingStatus === assignment.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              assignment.status === "DRIVER_ASSIGNED"
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                          >
                            {updatingStatus === assignment.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                {assignment.status === "DRIVER_ASSIGNED" ? (
                                  <PlayCircle className="w-4 h-4" />
                                ) : (
                                  <StopCircle className="w-4 h-4" />
                                )}
                                {statusInfo.action}
                              </>
                            )}
                          </button>
                        )}

                        {assignment.status === "DELIVERED" && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Ready for warehouse processing
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transport Instructions */}
                    {assignment.status === "DRIVER_ASSIGNED" && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-700">
                            <p className="font-medium mb-1">
                              Transport Instructions:
                            </p>
                            <ul className="text-xs space-y-1">
                              <li>• Contact farmer to arrange pickup time</li>
                              <li>• Verify produce quality and quantity</li>
                              <li>• Handle with care during transport</li>
                              <li>
                                • Deliver to Main Warehouse, Nairobi Industrial
                                Area
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {assignment.status === "IN_TRANSIT" && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Navigation className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">
                              En Route to Warehouse
                            </p>
                            <p className="text-xs">
                              Mark as delivered once you arrive at the warehouse
                              and unload the produce.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
