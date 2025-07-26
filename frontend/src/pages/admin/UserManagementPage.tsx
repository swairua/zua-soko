import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface User {
  id: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  profile?: any;
  createdAt: string;
}

const roleColors = {
  ADMIN: "bg-red-100 text-red-800",
  FARMER: "bg-green-100 text-green-800",
  CUSTOMER: "bg-blue-100 text-blue-800",
  DRIVER: "bg-purple-100 text-purple-800",
  AGENT: "bg-yellow-100 text-yellow-800",
};

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  SUSPENDED: "bg-orange-100 text-orange-800",
  BLOCKED: "bg-red-100 text-red-800",
};

export default function UserManagementPage() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    "activate" | "suspend" | "block" | "delete"
  >("activate");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("📊 Fetching users from real API");
      const response = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const apiUsers = response.data.users.map((user: any) => ({
          id: user.id,
          phone: user.phone,
          email: user.email || '',
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.verified ? "ACTIVE" : "PENDING",
          createdAt: user.created_at,
          profile: {
            county: user.county,
          },
        }));
        console.log(`📊 Loaded ${apiUsers.length} users from API`);
        setUsers(apiUsers);
      } else {
        throw new Error("API response not successful");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    setActionType(action as any);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedUser) return;

    try {
      // In a real app, this would make an API call
      let newStatus = selectedUser.status;
      let message = "";

      switch (actionType) {
        case "activate":
          newStatus = "ACTIVE";
          message = "User activated successfully";
          break;
        case "suspend":
          newStatus = "SUSPENDED";
          message = "User suspended successfully";
          break;
        case "block":
          newStatus = "BLOCKED";
          message = "User blocked successfully";
          break;
        case "delete":
          setUsers(users.filter((u) => u.id !== selectedUser.id));
          toast.success("User deleted successfully");
          setShowActionModal(false);
          return;
      }

      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: newStatus } : u,
        ),
      );

      toast.success(message);
      setShowActionModal(false);
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  // Ensure users is always an array to prevent filter errors
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserStats = () => {
    const total = safeUsers.length;
    const active = safeUsers.filter((u) => u.status === "ACTIVE").length;
    const pending = safeUsers.filter((u) => u.status === "PENDING").length;
    const blocked = safeUsers.filter(
      (u) => u.status === "BLOCKED" || u.status === "SUSPENDED",
    ).length;

    return { total, active, pending, blocked };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage platform users and their permissions
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.total}
                </h3>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.active}
                </h3>
                <p className="text-gray-600 text-sm">Active Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.pending}
                </h3>
                <p className="text-gray-600 text-sm">Pending Approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.blocked}
                </h3>
                <p className="text-gray-600 text-sm">Blocked/Suspended</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="FARMER">Farmer</option>
                <option value="CUSTOMER">Customer</option>
                <option value="DRIVER">Driver</option>
                <option value="AGENT">Agent</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
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
                {(Array.isArray(filteredUsers) ? filteredUsers : []).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.profile?.farmName && (
                            <div className="text-sm text-gray-500">
                              {user.profile.farmName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          roleColors[user.role as keyof typeof roleColors] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[
                            user.status as keyof typeof statusColors
                          ] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {user.status === "PENDING" && (
                          <button
                            onClick={() => handleUserAction(user, "activate")}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                        {user.status === "ACTIVE" && (
                          <button
                            onClick={() => handleUserAction(user, "suspend")}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status !== "BLOCKED" && (
                          <button
                            onClick={() => handleUserAction(user, "block")}
                            className="text-red-600 hover:text-red-900"
                          >
                            Block
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

        {/* Action Modal */}
        {showActionModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirm Action
                </h2>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to {actionType} user "
                  {selectedUser.firstName} {selectedUser.lastName}"?
                </p>

                {actionType === "delete" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm">
                      <strong>Warning:</strong> This action cannot be undone.
                      All user data will be permanently deleted.
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeAction}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      actionType === "delete"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                  >
                    Confirm {actionType}
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
