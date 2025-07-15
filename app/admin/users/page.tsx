"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Download,
  Mail,
  Phone,
  DollarSign,
} from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "FARMER" | "CUSTOMER" | "DRIVER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "PENDING_PAYMENT";
  createdAt: string;
  lastLogin?: string;
}

export default function UsersManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate loading users
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: "1",
          firstName: "Jane",
          lastName: "Wanjiku",
          email: "jane.wanjiku@example.com",
          phone: "+254712345678",
          role: "FARMER",
          status: "ACTIVE",
          createdAt: "2024-01-15T10:30:00Z",
          lastLogin: "2024-01-16T08:30:00Z",
        },
        {
          id: "2",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+254712345679",
          role: "CUSTOMER",
          status: "ACTIVE",
          createdAt: "2024-01-14T09:15:00Z",
          lastLogin: "2024-01-16T10:00:00Z",
        },
        {
          id: "3",
          firstName: "Peter",
          lastName: "Kimani",
          email: "peter.kimani@example.com",
          phone: "+254712345680",
          role: "DRIVER",
          status: "ACTIVE",
          createdAt: "2024-01-13T14:20:00Z",
          lastLogin: "2024-01-15T16:45:00Z",
        },
        {
          id: "4",
          firstName: "Mary",
          lastName: "Njeri",
          email: "mary.njeri@example.com",
          phone: "+254712345681",
          role: "FARMER",
          status: "PENDING_PAYMENT",
          createdAt: "2024-01-12T11:00:00Z",
        },
        {
          id: "5",
          firstName: "David",
          lastName: "Mwangi",
          email: "david.mwangi@example.com",
          phone: "+254712345682",
          role: "CUSTOMER",
          status: "SUSPENDED",
          createdAt: "2024-01-11T16:30:00Z",
          lastLogin: "2024-01-14T12:00:00Z",
        },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm),
      );
    }

    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    if (selectedStatus) {
      filtered = filtered.filter((user) => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: newStatus as any } : user,
      ),
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const handleInitiatePayment = (user: User) => {
    setSelectedUser(user);
    setShowPaymentModal(true);
  };

  const handleSendStkPush = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch("/api/payments/stk-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: selectedUser.phone,
          amount: 300,
          description: "Farmer Account Activation Fee",
          type: "ACTIVATION_FEE",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `STK push sent successfully to ${selectedUser.firstName} ${selectedUser.lastName}`,
        );
        setShowPaymentModal(false);
        setSelectedUser(null);
      } else {
        alert(data.error || "Failed to send STK push");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "FARMER":
        return "bg-green-100 text-green-800";
      case "CUSTOMER":
        return "bg-blue-100 text-blue-800";
      case "DRIVER":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
              <p className="text-gray-600 mt-2">
                Manage all users across the platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-secondary flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserX className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === "PENDING_PAYMENT").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === "SUSPENDED").length}
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="FARMER">Farmers</option>
              <option value="CUSTOMER">Customers</option>
              <option value="DRIVER">Drivers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedRole("");
                setSelectedStatus("");
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) =>
                          handleStatusChange(user.id, e.target.value)
                        }
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(
                          user.status,
                        )}`}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
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
                        {user.role === "FARMER" &&
                          user.status === "PENDING_PAYMENT" && (
                            <button
                              onClick={() => handleInitiatePayment(user)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Initiate Payment"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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

        {/* Payment Modal */}
        {showPaymentModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Initiate Activation Payment
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Send STK push to activate farmer account
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm">
                    <p>
                      <strong>Farmer:</strong> {selectedUser.firstName}{" "}
                      {selectedUser.lastName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedUser.phone}
                    </p>
                    <p>
                      <strong>Amount:</strong> KES 300
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedUser(null);
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
