"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  DollarSign,
  Check,
  X,
  Edit,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sprout,
  Calendar,
  User,
} from "lucide-react";

interface Consignment {
  id: string;
  productName: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "PRICE_SUGGESTION_SENT"
    | "PRICE_NEGOTIATION";
  images: string[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  priceHistory?: Array<{
    suggestedBy: "ADMIN" | "FARMER";
    price: number;
    timestamp: string;
    message?: string;
    status: "PENDING" | "ACCEPTED" | "COUNTER_OFFER";
  }>;
  suggestedPrice?: number;
  suggestedBy?: string;
  suggestedAt?: string;
  priceMessage?: string;
}

export default function FarmerConsignmentsPage() {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [filteredConsignments, setFilteredConsignments] = useState<
    Consignment[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceResponseModal, setShowPriceResponseModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] =
    useState<Consignment | null>(null);
  const [priceResponse, setPriceResponse] = useState({
    action: "accept" as "accept" | "counter" | "reject",
    counterPrice: 0,
    message: "",
  });

  useEffect(() => {
    // Simulate loading farmer's consignments
    setTimeout(() => {
      const mockConsignments: Consignment[] = [
        {
          id: "CONS001",
          productName: "Organic Tomatoes",
          category: "Vegetables",
          description:
            "Fresh organic tomatoes, Grade A quality, harvested this morning",
          quantity: 100,
          unit: "kg",
          pricePerUnit: 120,
          totalValue: 12000,
          status: "PENDING",
          images: ["/api/placeholder/300/200?text=Tomatoes"],
          submittedAt: "2024-01-16T07:30:00Z",
        },
        {
          id: "CONS004",
          productName: "Green Beans",
          category: "Vegetables",
          description: "Fresh green beans, tender and crisp",
          quantity: 50,
          unit: "kg",
          pricePerUnit: 150,
          totalValue: 7500,
          status: "PRICE_SUGGESTION_SENT",
          images: ["/api/placeholder/300/200?text=Green+Beans"],
          submittedAt: "2024-01-15T14:10:00Z",
          suggestedPrice: 180,
          suggestedBy: "Admin",
          suggestedAt: "2024-01-16T10:30:00Z",
          priceMessage:
            "Market rate suggests a higher price. Would you consider this adjustment?",
          priceHistory: [
            {
              suggestedBy: "ADMIN",
              price: 180,
              timestamp: "2024-01-16T10:30:00Z",
              message:
                "Market rate suggests a higher price. Would you consider this adjustment?",
              status: "PENDING",
            },
          ],
        },
        {
          id: "CONS005",
          productName: "Fresh Spinach",
          category: "Vegetables",
          description: "Locally grown spinach, pesticide-free",
          quantity: 30,
          unit: "bunches",
          pricePerUnit: 50,
          totalValue: 1500,
          status: "APPROVED",
          images: ["/api/placeholder/300/200?text=Spinach"],
          submittedAt: "2024-01-16T06:45:00Z",
          reviewedAt: "2024-01-16T08:00:00Z",
          reviewedBy: "Admin",
        },
      ];
      setConsignments(mockConsignments);
      setFilteredConsignments(mockConsignments);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = consignments;

    if (searchTerm) {
      filtered = filtered.filter((consignment) =>
        consignment.productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(
        (consignment) => consignment.status === selectedStatus,
      );
    }

    setFilteredConsignments(filtered);
  }, [consignments, searchTerm, selectedStatus]);

  const handlePriceResponse = (consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setPriceResponse({
      action: "accept",
      counterPrice: consignment.suggestedPrice || consignment.pricePerUnit,
      message: "",
    });
    setShowPriceResponseModal(true);
  };

  const handleSubmitPriceResponse = () => {
    if (!selectedConsignment) return;

    if (
      priceResponse.action === "counter" &&
      (!priceResponse.counterPrice || !priceResponse.message)
    ) {
      alert("Please provide a counter price and message");
      return;
    }

    setConsignments((prev) =>
      prev.map((consignment) =>
        consignment.id === selectedConsignment.id
          ? {
              ...consignment,
              status:
                priceResponse.action === "accept"
                  ? "APPROVED"
                  : ("PRICE_NEGOTIATION" as const),
              pricePerUnit:
                priceResponse.action === "accept"
                  ? consignment.suggestedPrice || consignment.pricePerUnit
                  : priceResponse.counterPrice,
              totalValue:
                priceResponse.action === "accept"
                  ? (consignment.suggestedPrice || consignment.pricePerUnit) *
                    consignment.quantity
                  : priceResponse.counterPrice * consignment.quantity,
              priceHistory: [
                ...(consignment.priceHistory || []),
                {
                  suggestedBy: "FARMER" as const,
                  price:
                    priceResponse.action === "accept"
                      ? consignment.suggestedPrice || consignment.pricePerUnit
                      : priceResponse.counterPrice,
                  timestamp: new Date().toISOString(),
                  message:
                    priceResponse.message ||
                    (priceResponse.action === "accept"
                      ? "Price accepted"
                      : "Counter offer"),
                  status:
                    priceResponse.action === "accept"
                      ? "ACCEPTED"
                      : ("COUNTER_OFFER" as const),
                },
              ],
            }
          : consignment,
      ),
    );

    setShowPriceResponseModal(false);
    setSelectedConsignment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PRICE_SUGGESTION_SENT":
        return "bg-blue-100 text-blue-800";
      case "PRICE_NEGOTIATION":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "PRICE_SUGGESTION_SENT":
        return <DollarSign className="h-4 w-4" />;
      case "PRICE_NEGOTIATION":
        return <Edit className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/farmer/dashboard" className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
                alt="Zuasoko Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Zuasoko Farmer
              </span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                href="/farmer/dashboard"
                className="text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <Link
                href="/farmer/consignments"
                className="text-primary-600 font-medium"
              >
                My Consignments
              </Link>
              <Link
                href="/auth/logout"
                className="text-gray-700 hover:text-primary-600"
              >
                Logout
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Consignments</h1>
          <p className="text-gray-600 mt-2">
            Track your product submissions and respond to price suggestions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Consignments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {consignments.length}
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
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {consignments.filter((c) => c.status === "PENDING").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Price Suggestions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    consignments.filter(
                      (c) => c.status === "PRICE_SUGGESTION_SENT",
                    ).length
                  }
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consignments.filter((c) => c.status === "APPROVED").length}
                </p>
              </div>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PRICE_SUGGESTION_SENT">
                Price Suggestion Received
              </option>
              <option value="PRICE_NEGOTIATION">Price Negotiation</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("");
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Consignments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredConsignments.map((consignment) => (
            <div
              key={consignment.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Product Image */}
              <div className="h-48 bg-gray-200">
                <img
                  src={consignment.images[0]}
                  alt={consignment.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {consignment.productName}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      consignment.status,
                    )}`}
                  >
                    {getStatusIcon(consignment.status)}
                    <span className="ml-1">
                      {consignment.status.replace(/_/g, " ")}
                    </span>
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {consignment.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    {consignment.quantity} {consignment.unit}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    KES {consignment.pricePerUnit}/{consignment.unit} • Total:
                    KES {consignment.totalValue.toLocaleString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(consignment.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Price Suggestion Alert */}
                {consignment.status === "PRICE_SUGGESTION_SENT" &&
                  consignment.suggestedPrice && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">
                            Price Suggestion Received
                          </h4>
                          <p className="text-sm text-blue-600">
                            New Price: KES {consignment.suggestedPrice}/
                            {consignment.unit}
                          </p>
                          {consignment.priceMessage && (
                            <p className="text-xs text-blue-600 mt-1">
                              {consignment.priceMessage}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handlePriceResponse(consignment)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                  )}

                {/* Rejection Reason */}
                {consignment.status === "REJECTED" &&
                  consignment.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong>{" "}
                        {consignment.rejectionReason}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {filteredConsignments.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No consignments found
            </h3>
            <p className="text-gray-600">
              {consignments.length === 0
                ? "You haven't submitted any products yet."
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}

        {/* Price Response Modal */}
        {showPriceResponseModal && selectedConsignment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Respond to Price Suggestion
                    </h3>
                    <button
                      onClick={() => setShowPriceResponseModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Product:</strong>{" "}
                        {selectedConsignment.productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Your Price:</strong> KES{" "}
                        {selectedConsignment.pricePerUnit}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Suggested Price:</strong> KES{" "}
                        {selectedConsignment.suggestedPrice}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Response
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="accept"
                            checked={priceResponse.action === "accept"}
                            onChange={(e) =>
                              setPriceResponse({
                                ...priceResponse,
                                action: "accept",
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">
                            Accept suggested price
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="counter"
                            checked={priceResponse.action === "counter"}
                            onChange={(e) =>
                              setPriceResponse({
                                ...priceResponse,
                                action: "counter",
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Make counter offer</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="reject"
                            checked={priceResponse.action === "reject"}
                            onChange={(e) =>
                              setPriceResponse({
                                ...priceResponse,
                                action: "reject",
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Keep original price</span>
                        </label>
                      </div>
                    </div>

                    {priceResponse.action === "counter" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Counter Price (KES)
                        </label>
                        <input
                          type="number"
                          value={priceResponse.counterPrice}
                          onChange={(e) =>
                            setPriceResponse({
                              ...priceResponse,
                              counterPrice: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter your counter price"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={priceResponse.message}
                        onChange={(e) =>
                          setPriceResponse({
                            ...priceResponse,
                            message: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Add any additional notes..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowPriceResponseModal(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitPriceResponse}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
