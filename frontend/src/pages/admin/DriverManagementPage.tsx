import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import {
  Truck,
  AlertTriangle,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  X,
  MessageSquare,
  Phone,
  User,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface DriverIssue {
  id: string;
  driver_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  type: string;
  description: string;
  delivery_id?: string;
  delivery_title?: string;
  severity: string;
  status: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

interface DriverEarnings {
  id: string;
  name: string;
  phone: string;
  totalDeliveries: number;
  totalEarnings: number;
  monthEarnings: number;
}

export default function DriverManagementPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"issues" | "earnings">("issues");
  const [issues, setIssues] = useState<DriverIssue[]>([]);
  const [earnings, setEarnings] = useState<DriverEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<DriverIssue | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  useEffect(() => {
    if (activeTab === "issues") {
      fetchDriverIssues();
    } else {
      fetchDriverEarnings();
    }
  }, [activeTab]);

  const fetchDriverIssues = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/driver-issues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setIssues(response.data.issues);
      }
    } catch (error) {
      console.error("Failed to fetch driver issues:", error);
      toast.error("Failed to load driver issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverEarnings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/driver-earnings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setEarnings(response.data.drivers);
      }
    } catch (error) {
      console.error("Failed to fetch driver earnings:", error);
      toast.error("Failed to load driver earnings");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    if (!adminResponse.trim()) {
      toast.error("Please provide a response");
      return;
    }

    try {
      const response = await axios.put(
        `/api/admin/driver-issues/${issueId}/resolve`,
        { response: adminResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Issue resolved successfully");
        setSelectedIssue(null);
        setAdminResponse("");
        fetchDriverIssues();
      } else {
        toast.error(response.data.message || "Failed to resolve issue");
      }
    } catch (error) {
      console.error("Failed to resolve issue:", error);
      toast.error("Failed to resolve issue");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "OPEN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Driver Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage driver issues and track earnings
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Driver Portal</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: "issues", label: "Driver Issues", icon: AlertTriangle },
                { id: "earnings", label: "Driver Earnings", icon: DollarSign },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "issues" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-red-900">
                          Open Issues
                        </p>
                        <p className="text-2xl font-bold text-red-900">
                          {(Array.isArray(issues) ? issues : []).filter((i) => i.status === "OPEN").length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-900">
                          Resolved Issues
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {(Array.isArray(issues) ? issues : []).filter((i) => i.status === "RESOLVED").length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-orange-900">
                          Critical Issues
                        </p>
                        <p className="text-2xl font-bold text-orange-900">
                          {
                            (Array.isArray(issues) ? issues : []).filter(
                              (i) => i.severity === "critical" && i.status === "OPEN"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      All Driver Issues
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Driver
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Severity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(Array.isArray(issues) ? issues : []).map((issue) => (
                          <tr key={issue.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-8 h-8 text-gray-400" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {issue.first_name} {issue.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {issue.phone}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {issue.type.replace("_", " ")}
                              </div>
                              {issue.delivery_title && (
                                <div className="text-sm text-gray-500">
                                  Delivery: {issue.delivery_title}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                                  issue.severity
                                )}`}
                              >
                                {issue.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  issue.status
                                )}`}
                              >
                                {issue.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(issue.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedIssue(issue)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "earnings" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Truck className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-900">
                          Active Drivers
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {(Array.isArray(earnings) ? earnings : []).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-900">
                          Total Earnings
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          KES{" "}
                          {(Array.isArray(earnings) ? earnings : [])
                            .reduce((sum, d) => sum + (d?.totalEarnings || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-900">
                          This Month
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          KES{" "}
                          {(Array.isArray(earnings) ? earnings : [])
                            .reduce((sum, d) => sum + (d?.monthEarnings || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Driver Earnings Overview
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Driver
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Deliveries
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month Earnings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Earnings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(Array.isArray(earnings) ? earnings : []).map((driver) => (
                          <tr key={driver.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-8 h-8 text-gray-400" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {driver.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {driver.phone}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {driver.totalDeliveries}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              KES {driver.monthEarnings.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              KES {driver.totalEarnings.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  toast("Payment processing would be implemented here", {
                                    icon: "ℹ️",
                                  });
                                }}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Process Payment
                              </button>
                              <button
                                onClick={() => {
                                  toast("Driver details view would open here", {
                                    icon: "ℹ️",
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issue Details Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Issue Details
                  </h3>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Driver
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedIssue.first_name} {selectedIssue.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <p className="text-sm text-gray-900">{selectedIssue.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Issue Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedIssue.type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Severity
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                        selectedIssue.severity
                      )}`}
                    >
                      {selectedIssue.severity}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedIssue.description}
                  </p>
                </div>

                {selectedIssue.delivery_title && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Related Delivery
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedIssue.delivery_title}
                    </p>
                  </div>
                )}

                {selectedIssue.status === "OPEN" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Response
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Provide your response or resolution..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {selectedIssue.admin_response && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Admin Response
                    </label>
                    <p className="text-sm text-gray-900 mt-1 p-3 bg-green-50 rounded-lg">
                      {selectedIssue.admin_response}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                {selectedIssue.status === "OPEN" && (
                  <button
                    onClick={() => handleResolveIssue(selectedIssue.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Resolve Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
