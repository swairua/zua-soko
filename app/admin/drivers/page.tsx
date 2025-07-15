"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Truck,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  vehicleRegistration: string;
  county: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  rating: number;
  completedDeliveries: number;
  joinedAt: string;
  lastActive?: string;
  isVerified: boolean;
}

export default function DriversManagePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate loading drivers
    setTimeout(() => {
      const mockDrivers: Driver[] = [
        {
          id: "DRV001",
          firstName: "James",
          lastName: "Kiprotich",
          email: "james.kiprotich@example.com",
          phone: "+254712345678",
          licenseNumber: "DL001234567",
          vehicleType: "Pickup Truck",
          vehicleRegistration: "KCA 123X",
          county: "Nairobi",
          status: "ACTIVE",
          rating: 4.8,
          completedDeliveries: 156,
          joinedAt: "2024-01-10T10:30:00Z",
          lastActive: "2024-01-16T14:30:00Z",
          isVerified: true,
        },
        {
          id: "DRV002",
          firstName: "Mary",
          lastName: "Achieng",
          email: "mary.achieng@example.com",
          phone: "+254712345679",
          licenseNumber: "DL001234568",
          vehicleType: "Van",
          vehicleRegistration: "KCB 456Y",
          county: "Kisumu",
          status: "ACTIVE",
          rating: 4.6,
          completedDeliveries: 89,
          joinedAt: "2024-01-08T09:15:00Z",
          lastActive: "2024-01-16T11:20:00Z",
          isVerified: true,
        },
        {
          id: "DRV003",
          firstName: "Peter",
          lastName: "Mutua",
          email: "peter.mutua@example.com",
          phone: "+254712345680",
          licenseNumber: "DL001234569",
          vehicleType: "Motorcycle",
          vehicleRegistration: "KCC 789Z",
          county: "Machakos",
          status: "INACTIVE",
          rating: 4.2,
          completedDeliveries: 34,
          joinedAt: "2024-01-05T16:45:00Z",
          lastActive: "2024-01-14T08:00:00Z",
          isVerified: false,
        },
        {
          id: "DRV004",
          firstName: "Grace",
          lastName: "Wanjiku",
          email: "grace.wanjiku@example.com",
          phone: "+254712345681",
          licenseNumber: "DL001234570",
          vehicleType: "Pickup Truck",
          vehicleRegistration: "KCD 012A",
          county: "Kiambu",
          status: "SUSPENDED",
          rating: 3.8,
          completedDeliveries: 67,
          joinedAt: "2024-01-03T12:20:00Z",
          lastActive: "2024-01-13T16:30:00Z",
          isVerified: true,
        },
      ];
      setDrivers(mockDrivers);
      setFilteredDrivers(mockDrivers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = drivers;

    if (searchTerm) {
      filtered = filtered.filter(
        (driver) =>
          driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.phone.includes(searchTerm) ||
          driver.vehicleRegistration
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((driver) => driver.status === selectedStatus);
    }

    setFilteredDrivers(filtered);
  }, [drivers, searchTerm, selectedStatus]);

  const handleStatusChange = (driverId: string, newStatus: string) => {
    setDrivers((prev) =>
      prev.map((driver) =>
        driver.id === driverId
          ? { ...driver, status: newStatus as any }
          : driver,
      ),
    );
  };

  const handleVerifyDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((driver) =>
        driver.id === driverId
          ? { ...driver, isVerified: !driver.isVerified }
          : driver,
      ),
    );
  };

  const handleDeleteDriver = (driverId: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      setDrivers((prev) => prev.filter((driver) => driver.id !== driverId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "INACTIVE":
        return <Clock className="h-4 w-4" />;
      case "SUSPENDED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
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
                Manage Drivers
              </h1>
              <p className="text-gray-600 mt-2">
                Manage delivery drivers and their performance
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Drivers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.length}
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
                <p className="text-sm font-medium text-gray-600">
                  Active Drivers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter((d) => d.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drivers.filter((d) => d.isVerified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    drivers.reduce((sum, d) => sum + d.rating, 0) /
                    drivers.length
                  ).toFixed(1)}
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
                placeholder="Search drivers..."
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
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

        {/* Drivers Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Drivers ({filteredDrivers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
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
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {driver.firstName[0]}
                              {driver.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {driver.firstName} {driver.lastName}
                            </div>
                            {driver.isVerified && (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {driver.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {driver.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {driver.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {driver.county}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.vehicleType}
                        </div>
                        <div className="text-sm text-gray-600">
                          {driver.vehicleRegistration}
                        </div>
                        <div className="text-sm text-gray-600">
                          License: {driver.licenseNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          {renderStars(driver.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {driver.rating}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {driver.completedDeliveries} deliveries
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={driver.status}
                        onChange={(e) =>
                          handleStatusChange(driver.id, e.target.value)
                        }
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(
                          driver.status,
                        )}`}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyDriver(driver.id)}
                          className={`p-2 rounded ${
                            driver.isVerified
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            driver.isVerified
                              ? "Remove Verification"
                              : "Verify Driver"
                          }
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No drivers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
