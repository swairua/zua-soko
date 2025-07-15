"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Package,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Edit,
  Send,
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
  farmer: {
    id: string;
    name: string;
    phone: string;
    county: string;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
      accuracy?: number;
      timestamp: string;
    };
  };
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

export default function ConsignmentsManagePage() {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [filteredConsignments, setFilteredConsignments] = useState<
    Consignment[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] =
    useState<Consignment | null>(null);
  const [showPriceSuggestionModal, setShowPriceSuggestionModal] =
    useState(false);
  const [priceSuggestionForm, setPriceSuggestionForm] = useState({
    consignmentId: "",
    suggestedPrice: 0,
    message: "",
  });

  useEffect(() => {
    // Simulate loading consignments
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
          farmer: {
            id: "FARM001",
            name: "Jane Wanjiku",
            phone: "+254712345678",
            county: "Kiambu",
            location: {
              latitude: -1.2921,
              longitude: 36.8219,
              address: "Thika Road, Kiambu County",
              accuracy: 10,
              timestamp: "2024-01-16T07:25:00Z",
            },
          },
          status: "PENDING",
          images: ["/api/placeholder/300/200?text=Tomatoes"],
          submittedAt: "2024-01-16T07:30:00Z",
        },
        {
          id: "CONS002",
          productName: "Fresh Spinach",
          category: "Vegetables",
          description: "Locally grown spinach, pesticide-free",
          quantity: 30,
          unit: "bunches",
          pricePerUnit: 50,
          totalValue: 1500,
          farmer: {
            id: "FARM002",
            name: "Peter Mwangi",
            phone: "+254712345679",
            county: "Nakuru",
            location: {
              latitude: -0.3031,
              longitude: 36.08,
              address: "Nakuru Town, Nakuru County",
              accuracy: 15,
              timestamp: "2024-01-16T06:40:00Z",
            },
          },
          status: "APPROVED",
          images: ["/api/placeholder/300/200?text=Spinach"],
          submittedAt: "2024-01-16T06:45:00Z",
          reviewedAt: "2024-01-16T08:00:00Z",
          reviewedBy: "Admin",
        },
        {
          id: "CONS003",
          productName: "Sweet Carrots",
          category: "Vegetables",
          description: "Sweet and crunchy carrots, perfect for cooking",
          quantity: 75,
          unit: "kg",
          pricePerUnit: 80,
          totalValue: 6000,
          farmer: {
            id: "FARM003",
            name: "Mary Njeri",
            phone: "+254712345680",
            county: "Meru",
            location: {
              latitude: 0.0469,
              longitude: 37.6506,
              address: "Meru Town, Meru County",
              accuracy: 8,
              timestamp: "2024-01-15T16:15:00Z",
            },
          },
          status: "REJECTED",
          images: ["/api/placeholder/300/200?text=Carrots"],
          submittedAt: "2024-01-15T16:20:00Z",
          reviewedAt: "2024-01-16T09:00:00Z",
          reviewedBy: "Admin",
          rejectionReason:
            "Quality standards not met - images show damaged produce",
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
          farmer: {
            id: "FARM004",
            name: "David Kimeu",
            phone: "+254712345681",
            county: "Machakos",
            location: {
              latitude: -1.5177,
              longitude: 37.2634,
              address: "Machakos Town, Machakos County",
              accuracy: 12,
              timestamp: "2024-01-15T14:05:00Z",
            },
          },
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
      ];
      setConsignments(mockConsignments);
      setFilteredConsignments(mockConsignments);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = consignments;

    if (searchTerm) {
      filtered = filtered.filter(
        (consignment) =>
          consignment.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          consignment.farmer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          consignment.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(
        (consignment) => consignment.status === selectedStatus,
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (consignment) => consignment.category === selectedCategory,
      );
    }

    setFilteredConsignments(filtered);
  }, [consignments, searchTerm, selectedStatus, selectedCategory]);

  const handleApprove = (id: string) => {
    setConsignments((prev) =>
      prev.map((consignment) =>
        consignment.id === id
          ? {
              ...consignment,
              status: "APPROVED" as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Admin",
            }
          : consignment,
      ),
    );
  };

  const handleReject = (id: string, reason: string) => {
    setConsignments((prev) =>
      prev.map((consignment) =>
        consignment.id === id
          ? {
              ...consignment,
              status: "REJECTED" as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Admin",
              rejectionReason: reason,
            }
          : consignment,
      ),
    );
  };

  const handleViewDetails = (consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setShowDetailsModal(true);
  };

  const handleSuggestPrice = (consignment: Consignment) => {
    setPriceSuggestionForm({
      consignmentId: consignment.id,
      suggestedPrice: consignment.pricePerUnit,
      message: "",
    });
    setShowPriceSuggestionModal(true);
  };

  const handleSubmitPriceSuggestion = () => {
    if (!priceSuggestionForm.suggestedPrice || !priceSuggestionForm.message) {
      alert("Please fill in all fields");
      return;
    }

    setConsignments((prev) =>
      prev.map((consignment) =>
        consignment.id === priceSuggestionForm.consignmentId
          ? {
              ...consignment,
              status: "PRICE_SUGGESTION_SENT" as const,
              suggestedPrice: priceSuggestionForm.suggestedPrice,
              suggestedBy: "Admin",
              suggestedAt: new Date().toISOString(),
              priceMessage: priceSuggestionForm.message,
              priceHistory: [
                ...(consignment.priceHistory || []),
                {
                  suggestedBy: "ADMIN" as const,
                  price: priceSuggestionForm.suggestedPrice,
                  timestamp: new Date().toISOString(),
                  message: priceSuggestionForm.message,
                  status: "PENDING" as const,
                },
              ],
            }
          : consignment,
      ),
    );

    setShowPriceSuggestionModal(false);
    setPriceSuggestionForm({
      consignmentId: "",
      suggestedPrice: 0,
      message: "",
    });
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
                Manage Consignments
              </h1>
              <p className="text-gray-600 mt-2">
                Review and approve product consignments from farmers
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consignments.filter((c) => c.status === "REJECTED").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search consignments..."
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PRICE_SUGGESTION_SENT">
                Price Suggestion Sent
              </option>
              <option value="PRICE_NEGOTIATION">Price Negotiation</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("");
                setSelectedCategory("");
              }}
              className="btn-secondary"
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
                    <span className="ml-1">{consignment.status}</span>
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {consignment.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {consignment.farmer.name} • {consignment.farmer.county}
                  </div>
                  {consignment.farmer.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {consignment.farmer.location.address}
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${consignment.farmer.location.latitude},${consignment.farmer.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View Map
                      </a>
                    </div>
                  )}
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

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleViewDetails(consignment)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>

                  <div className="flex space-x-2">
                    {consignment.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleSuggestPrice(consignment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Suggest Price"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(consignment.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleReject(
                              consignment.id,
                              "Quality standards not met",
                            )
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {consignment.status === "REJECTED" &&
                  consignment.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong>{" "}
                        {consignment.rejectionReason}
                      </p>
                    </div>
                  )}

                {consignment.status === "PRICE_SUGGESTION_SENT" &&
                  consignment.suggestedPrice && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Price Suggestion:</strong> KES{" "}
                        {consignment.suggestedPrice}/{consignment.unit}
                      </p>
                      {consignment.priceMessage && (
                        <p className="text-sm text-blue-600 mt-1">
                          {consignment.priceMessage}
                        </p>
                      )}
                      <p className="text-xs text-blue-500 mt-1">
                        Waiting for farmer's response
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
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedConsignment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Consignment Details
                    </h3>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Product Name
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedConsignment.productName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedConsignment.category}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedConsignment.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedConsignment.quantity}{" "}
                          {selectedConsignment.unit}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price per Unit
                        </label>
                        <p className="text-sm text-gray-900">
                          KES {selectedConsignment.pricePerUnit}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Total Value
                        </label>
                        <p className="text-sm text-gray-900">
                          KES {selectedConsignment.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Farmer Information
                      </label>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-900">
                          {selectedConsignment.farmer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedConsignment.farmer.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedConsignment.farmer.county}
                        </p>
                        {selectedConsignment.farmer.location && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Farm Location
                                </p>
                                <p className="text-sm text-gray-600">
                                  {selectedConsignment.farmer.location.address}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Lat:{" "}
                                  {selectedConsignment.farmer.location.latitude.toFixed(
                                    6,
                                  )}
                                  , Lng:{" "}
                                  {selectedConsignment.farmer.location.longitude.toFixed(
                                    6,
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Accuracy: ±
                                  {selectedConsignment.farmer.location.accuracy}
                                  m
                                </p>
                              </div>
                              <a
                                href={`https://maps.google.com/?q=${selectedConsignment.farmer.location.latitude},${selectedConsignment.farmer.location.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-sm"
                              >
                                View on Map
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                    {selectedConsignment.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => {
                            handleReject(
                              selectedConsignment.id,
                              "Quality standards not met",
                            );
                            setShowDetailsModal(false);
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            handleApprove(selectedConsignment.id);
                            setShowDetailsModal(false);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Suggestion Modal */}
        {showPriceSuggestionModal && (
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
                      Suggest Price
                    </h3>
                    <button
                      onClick={() => setShowPriceSuggestionModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Price
                      </label>
                      <p className="text-sm text-gray-600">
                        KES {priceSuggestionForm.suggestedPrice} per unit
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suggested Price (KES)
                      </label>
                      <input
                        type="number"
                        value={priceSuggestionForm.suggestedPrice}
                        onChange={(e) =>
                          setPriceSuggestionForm({
                            ...priceSuggestionForm,
                            suggestedPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter suggested price"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message to Farmer
                      </label>
                      <textarea
                        value={priceSuggestionForm.message}
                        onChange={(e) =>
                          setPriceSuggestionForm({
                            ...priceSuggestionForm,
                            message: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Explain the reason for the price suggestion..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowPriceSuggestionModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitPriceSuggestion}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Suggestion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
