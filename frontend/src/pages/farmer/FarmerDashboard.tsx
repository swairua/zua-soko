import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import {
  TrendingUp,
  Package,
  Wallet,
  Settings,
  Users,
  BarChart3,
  ShoppingCart,
  Bell,
  Menu,
  X,
  Plus,
  Eye,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Consignment {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  bidPricePerUnit: number;
  finalPricePerUnit?: number;
  status: string;
  location: string;
  harvestDate: string;
  expiryDate: string;
  images: string[];
  createdAt: string;
  adminNotes?: string;
}

interface Wallet {
  id: string;
  balance: number;
  transactions: Array<{
    id: string;
    type: "CREDIT" | "DEBIT";
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function FarmerDashboard() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConsignments: 0,
    pendingConsignments: 0,
    completedConsignments: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [consignmentsRes, walletRes, notificationsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/consignments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setConsignments(consignmentsRes.data);
      setWallet(walletRes.data);
      setNotifications(notificationsRes.data);

      // Calculate stats
      const totalConsignments = consignmentsRes.data.length;
      const pendingConsignments = consignmentsRes.data.filter(
        (c: Consignment) => c.status === "PENDING",
      ).length;
      const completedConsignments = consignmentsRes.data.filter(
        (c: Consignment) => c.status === "COMPLETED",
      ).length;
      const totalEarnings =
        walletRes.data.balance +
        walletRes.data.transactions
          .filter((t: any) => t.type === "DEBIT")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

      setStats({
        totalConsignments,
        pendingConsignments,
        completedConsignments,
        totalEarnings,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (amount: number, phoneNumber: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/withdraw`,
        { amount, phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(
        "Withdrawal initiated! Check your phone for M-Pesa prompt.",
      );
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Withdrawal failed");
    }
  };

  const handlePayRegistrationFee = async (phoneNumber: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/registration-fee`,
        { phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(
        "Registration fee payment initiated! Check your phone for M-Pesa prompt.",
      );
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Payment failed");
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "consignments", label: "Consignments", icon: Package },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PRICE_SUGGESTED: "bg-blue-100 text-blue-800",
      DRIVER_ASSIGNED: "bg-indigo-100 text-indigo-800",
      IN_TRANSIT: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-cyan-100 text-cyan-800",
      COMPLETED: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      REJECTED: X,
      PRICE_SUGGESTED: DollarSign,
      DRIVER_ASSIGNED: Truck,
      IN_TRANSIT: Truck,
      DELIVERED: CheckCircle,
      COMPLETED: CheckCircle,
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Farmer Dashboard
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSection === item.id
                    ? "bg-green-50 text-green-600 border-r-2 border-green-600"
                    : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.county}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-3"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 capitalize">
                {activeSection}
              </h1>
            </div>

            {!user?.registrationFeePaid && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">
                    Registration fee required
                  </span>
                  <button
                    onClick={() => {
                      const phone = prompt("Enter your M-Pesa phone number:");
                      if (phone) handlePayRegistrationFee(phone);
                    }}
                    className="ml-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Pay KES 300
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Consignments
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalConsignments}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pendingConsignments}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.completedConsignments}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Wallet className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Wallet Balance
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        KES {wallet?.balance?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveSection("consignments")}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={!user?.registrationFeePaid}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Submit Consignment
                  </button>

                  <button
                    onClick={() => setActiveSection("wallet")}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Manage Wallet
                  </button>

                  <button
                    onClick={() => setActiveSection("consignments")}
                    className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Consignments
                  </button>
                </div>
              </div>

              {/* Recent consignments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Consignments
                  </h3>
                </div>
                <div className="p-6">
                  {consignments.slice(0, 5).map((consignment) => (
                    <div
                      key={consignment.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <img
                          src={consignment.images[0] || "/placeholder.jpg"}
                          alt={consignment.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {consignment.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {consignment.quantity} {consignment.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consignment.status)}`}
                        >
                          {getStatusIcon(consignment.status)}
                          <span className="ml-1">
                            {consignment.status.replace("_", " ")}
                          </span>
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          KES{" "}
                          {consignment.finalPricePerUnit ||
                            consignment.bidPricePerUnit}
                          /kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "consignments" && (
            <ConsignmentsSection
              consignments={consignments}
              onRefresh={fetchDashboardData}
              canSubmit={user?.registrationFeePaid || false}
            />
          )}

          {activeSection === "wallet" && (
            <WalletSection
              wallet={wallet}
              onWithdraw={handleWithdraw}
              onRefresh={fetchDashboardData}
            />
          )}

          {activeSection === "notifications" && (
            <NotificationsSection
              notifications={notifications}
              onRefresh={fetchDashboardData}
            />
          )}

          {activeSection === "profile" && <ProfileSection user={user} />}
        </div>
      </div>
    </div>
  );
}

// Consignments Section Component
function ConsignmentsSection({ consignments, onRefresh, canSubmit }: any) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    bidPricePerUnit: "",
    location: "",
    harvestDate: "",
    expiryDate: "",
    images: [""],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please pay the registration fee first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/consignments`,
        {
          ...formData,
          quantity: parseFloat(formData.quantity),
          bidPricePerUnit: parseFloat(formData.bidPricePerUnit),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Consignment submitted successfully!");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "Vegetables",
        quantity: "",
        unit: "kg",
        bidPricePerUnit: "",
        location: "",
        harvestDate: "",
        expiryDate: "",
        images: [""],
      });
      onRefresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to submit consignment",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Consignments</h2>
        <button
          onClick={() => setShowForm(true)}
          disabled={!canSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Submit New Consignment
        </button>
      </div>

      {!canSubmit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">
              You must pay the KES 300 registration fee before submitting
              consignments.
            </span>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submit New Consignment
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Fresh Tomatoes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Legumes">Legumes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="tonnes">Tonnes</option>
                    <option value="bags">Bags</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bid Price per Unit (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.bidPricePerUnit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bidPricePerUnit: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Nakuru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        harvestDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Describe your produce quality, farming methods, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.images[0]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      images: [e.target.value],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consignments list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Consignments ({consignments.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {consignments.map((consignment: Consignment) => (
            <div key={consignment.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={consignment.images[0] || "/placeholder.jpg"}
                    alt={consignment.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {consignment.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {consignment.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">
                        {consignment.quantity} {consignment.unit}
                      </span>
                      <span className="text-sm text-gray-600">
                        KES {consignment.bidPricePerUnit}/{consignment.unit}
                      </span>
                      <span className="text-sm text-gray-600">
                        {consignment.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consignment.status)}`}
                  >
                    {getStatusIcon(consignment.status)}
                    <span className="ml-1">
                      {consignment.status.replace("_", " ")}
                    </span>
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(consignment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {consignment.adminNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Admin Notes:</strong> {consignment.adminNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wallet Section Component
function WalletSection({ wallet, onWithdraw, onRefresh }: any) {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (amount < 10) {
      toast.error("Minimum withdrawal amount is KES 10");
      return;
    }

    if (amount > wallet.balance) {
      toast.error("Insufficient balance");
      return;
    }

    await onWithdraw(amount, withdrawPhone);
    setShowWithdrawForm(false);
    setWithdrawAmount("");
    setWithdrawPhone("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Wallet</h2>
          <button
            onClick={() => setShowWithdrawForm(true)}
            disabled={!wallet?.balance || wallet.balance < 10}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Withdraw Funds
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Available Balance</h3>
          <p className="text-3xl font-bold">
            KES {wallet?.balance?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {showWithdrawForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Withdraw Funds
                </h3>
                <button
                  onClick={() => setShowWithdrawForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KES)
                </label>
                <input
                  type="number"
                  min="10"
                  max={wallet?.balance || 0}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter amount"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: KES 10 | Available: KES{" "}
                  {wallet?.balance?.toLocaleString() || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="+254712345678"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {wallet?.transactions?.map((transaction: any) => (
            <div
              key={transaction.id}
              className="p-6 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "CREDIT"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {transaction.type === "CREDIT" ? (
                    <TrendingUp className={`w-5 h-5 text-green-600`} />
                  ) : (
                    <TrendingUp
                      className={`w-5 h-5 text-red-600 transform rotate-180`}
                    />
                  )}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                    {new Date(transaction.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.type === "CREDIT"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "CREDIT" ? "+" : "-"}KES{" "}
                  {transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Notifications Section Component
function NotificationsSection({ notifications, onRefresh }: any) {
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onRefresh();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`p-6 ${notification.isRead ? "bg-white" : "bg-blue-50"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-700 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No notifications yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Section Component
function ProfileSection({ user }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="ml-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600">{user?.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <p className="text-gray-900 capitalize">{user?.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County
            </label>
            <p className="text-gray-900">{user?.county}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Status
            </label>
            <div className="flex items-center">
              {user?.registrationFeePaid ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Paid
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Fee Required
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Status
            </label>
            <div className="flex items-center">
              {user?.verified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions (already defined above)
function getStatusColor(status: string) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    PRICE_SUGGESTED: "bg-blue-100 text-blue-800",
    DRIVER_ASSIGNED: "bg-indigo-100 text-indigo-800",
    IN_TRANSIT: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-cyan-100 text-cyan-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

function getStatusIcon(status: string) {
  const icons = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: X,
    PRICE_SUGGESTED: DollarSign,
    DRIVER_ASSIGNED: Truck,
    IN_TRANSIT: Truck,
    DELIVERED: CheckCircle,
    COMPLETED: CheckCircle,
  };
  const Icon = icons[status as keyof typeof icons] || AlertCircle;
  return <Icon className="w-4 h-4" />;
}
