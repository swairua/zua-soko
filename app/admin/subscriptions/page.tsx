"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface Subscription {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerEmail?: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "OVERDUE";
  paymentMethod: "MPESA" | "MANUAL";
  transactionId?: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
  paidAt?: string;
  dueDate: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    Subscription[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showStkModal, setShowStkModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  useEffect(() => {
    // Simulate loading subscriptions
    setTimeout(() => {
      const mockSubscriptions: Subscription[] = [
        {
          id: "1",
          farmerId: "f1",
          farmerName: "Mary Njeri",
          farmerPhone: "+254712345681",
          farmerEmail: "mary.njeri@example.com",
          amount: 300,
          status: "PENDING",
          paymentMethod: "MPESA",
          createdAt: "2024-01-12T11:00:00Z",
          dueDate: "2024-01-19T11:00:00Z",
        },
        {
          id: "2",
          farmerId: "f2",
          farmerName: "John Kiprotich",
          farmerPhone: "+254712345682",
          amount: 300,
          status: "PAID",
          paymentMethod: "MPESA",
          transactionId: "MP1234567890",
          mpesaReceiptNumber: "P12345678",
          createdAt: "2024-01-10T09:30:00Z",
          paidAt: "2024-01-10T10:15:00Z",
          dueDate: "2024-01-17T09:30:00Z",
        },
        {
          id: "3",
          farmerId: "f3",
          farmerName: "Grace Wambui",
          farmerPhone: "+254712345683",
          farmerEmail: "grace.wambui@example.com",
          amount: 300,
          status: "OVERDUE",
          paymentMethod: "MPESA",
          createdAt: "2024-01-05T14:20:00Z",
          dueDate: "2024-01-12T14:20:00Z",
        },
        {
          id: "4",
          farmerId: "f4",
          farmerName: "Peter Mwangi",
          farmerPhone: "+254712345684",
          amount: 300,
          status: "FAILED",
          paymentMethod: "MPESA",
          transactionId: "MP1234567891",
          createdAt: "2024-01-08T16:00:00Z",
          dueDate: "2024-01-15T16:00:00Z",
        },
      ];
      setSubscriptions(mockSubscriptions);
      setFilteredSubscriptions(mockSubscriptions);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = subscriptions;

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.farmerPhone.includes(searchTerm) ||
          (sub.farmerEmail &&
            sub.farmerEmail.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((sub) => sub.status === selectedStatus);
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, selectedStatus]);

  const handleInitiatePayment = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowStkModal(true);
  };

  const handleSendStkPush = async () => {
    if (!selectedSubscription) return;

    try {
      const response = await fetch("/api/payments/stk-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: selectedSubscription.farmerPhone,
          amount: 300,
          description: "Farmer Account Activation Fee",
          type: "ACTIVATION_FEE",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `STK push sent successfully to ${selectedSubscription.farmerName}`,
        );
        // Update subscription status to processing
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === selectedSubscription.id
              ? {
                  ...sub,
                  status: "PENDING" as const,
                  transactionId: data.transactionId,
                }
              : sub,
          ),
        );
        setShowStkModal(false);
        setSelectedSubscription(null);
      } else {
        alert(data.error || "Failed to send STK push");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "OVERDUE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "FAILED":
        return <XCircle className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Farmer Subscriptions
              </h1>
              <p className="text-gray-600 mt-2">
                Manage farmer activation payments and subscriptions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.filter((s) => s.status === "PAID").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.filter((s) => s.status === "PENDING").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.filter((s) => s.status === "OVERDUE").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                KES{" "}
                {subscriptions
                  .filter((s) => s.status === "PAID")
                  .reduce((sum, s) => sum + s.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Revenue
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                KES{" "}
                {subscriptions
                  .filter((s) => s.status === "PENDING")
                  .reduce((sum, s) => sum + s.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Overdue Revenue
              </p>
              <p className="text-2xl font-bold text-orange-600">
                KES{" "}
                {subscriptions
                  .filter((s) => s.status === "OVERDUE")
                  .reduce((sum, s) => sum + s.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("");
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Subscriptions ({filteredSubscriptions.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.farmerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {subscription.farmerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {subscription.farmerPhone}
                        </div>
                        {subscription.farmerEmail && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {subscription.farmerEmail}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        KES {subscription.amount.toLocaleString()}
                      </div>
                      {subscription.mpesaReceiptNumber && (
                        <div className="text-xs text-gray-500">
                          Receipt: {subscription.mpesaReceiptNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          subscription.status,
                        )}`}
                      >
                        {getStatusIcon(subscription.status)}
                        <span className="ml-1">{subscription.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(subscription.dueDate).toLocaleDateString()}
                      </div>
                      {subscription.paidAt && (
                        <div className="text-xs text-green-600">
                          Paid:{" "}
                          {new Date(subscription.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        {(subscription.status === "PENDING" ||
                          subscription.status === "FAILED" ||
                          subscription.status === "OVERDUE") && (
                          <button
                            onClick={() => handleInitiatePayment(subscription)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Send STK Push"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* STK Push Modal */}
        {showStkModal && selectedSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Send STK Push Payment
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Send M-Pesa STK push to collect activation fee
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm">
                    <p>
                      <strong>Farmer:</strong> {selectedSubscription.farmerName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedSubscription.farmerPhone}
                    </p>
                    <p>
                      <strong>Amount:</strong> KES {selectedSubscription.amount}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedSubscription.status}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowStkModal(false);
                      setSelectedSubscription(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSendStkPush} className="btn-primary">
                    Send STK Push
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
