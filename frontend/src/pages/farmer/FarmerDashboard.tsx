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
  Phone,
  CreditCard,
  Upload,
  Image as ImageIcon,
  Trash2,
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
    date: string;
  }>;
}

// Wallet Section Component with STK Withdrawal
function WalletSection({ wallet, token }: { wallet: any, token: string | null }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!withdrawAmount || !withdrawPhone) {
      toast.error("Please fill in all fields");
      return;
    }

    if (parseFloat(withdrawAmount) < 10) {
      toast.error("Minimum withdrawal amount is KSh 10");
      return;
    }

    if (parseFloat(withdrawAmount) > (wallet?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setIsWithdrawing(true);

    try {
      const authToken = localStorage.getItem("authToken") || token;

      await axios.post("/api/wallet/withdraw", {
        amount: parseFloat(withdrawAmount),
        phone: withdrawPhone
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      toast.success("STK withdrawal request sent! Check your phone.");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawPhone("");
    } catch (error: any) {
      console.error("❌ Withdrawal error:", error);
      toast.error(error.response?.data?.error || "Failed to process withdrawal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Withdraw
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Current Balance</h3>
        <p className="text-3xl font-bold text-green-600">
          KSh {wallet?.balance?.toLocaleString() || 0}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Available for withdrawal
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="divide-y">
          {wallet?.transactions?.map((transaction: any) => (
            <div key={transaction.id} className="p-6 flex justify-between items-center">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              <div className={`text-lg font-semibold ${
                transaction.type === "CREDIT" ? "text-green-600" : "text-red-600"
              }`}>
                {transaction.type === "CREDIT" ? "+" : "-"}KSh {transaction.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STK Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  STK Withdrawal
                </h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KSh) *
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max={wallet?.balance || 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter amount to withdraw"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: KSh {wallet?.balance?.toLocaleString() || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="+254712345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  STK push will be sent to this number
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You will receive an STK push on your phone to complete the withdrawal.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isWithdrawing ? "Processing..." : "Send STK Push"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FarmerDashboard() {
  const { user, token } = useAuthStore();
  const [activeSection, setActiveSection] = useState("overview");
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stats, setStats] = useState({
    totalConsignments: 0,
    pendingConsignments: 0,
    completedConsignments: 0,
    totalEarnings: 0,
  });

  const fetchDashboardData = async () => {
    try {
      console.log("🔄 Fetching farmer dashboard data...");

      const [consignmentsRes, walletRes, notificationsRes] = await Promise.all([
        axios.get(`/api/consignments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Safely extract data from API responses
      const consignmentsData = Array.isArray(consignmentsRes.data.consignments)
        ? consignmentsRes.data.consignments
        : [];

      const walletData = walletRes.data.wallet || {
        balance: 0,
        transactions: [],
      };

      setConsignments(consignmentsData);
      setWallet(walletData);
      setNotifications(notificationsRes.data.notifications || []);

      // Calculate stats
      const totalConsignments = consignmentsData.length;
      const pendingConsignments = consignmentsData.filter(
        (c: Consignment) => c.status === "PENDING",
      ).length;
      const completedConsignments = consignmentsData.filter(
        (c: Consignment) => c.status === "COMPLETED",
      ).length;

      const totalEarnings = walletData.transactions
        .filter((t: any) => t.type === "CREDIT")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      setStats({
        totalConsignments,
        pendingConsignments,
        completedConsignments,
        totalEarnings,
      });

      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const menuItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "consignments", label: "Consignments", icon: Package },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const canSubmitConsignments =
    user?.registrationFeePaid || user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Farmer Dashboard</h2>
            <p className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</p>
          </div>

          <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                    activeSection === item.id
                      ? "bg-green-50 text-green-600 border-r-2 border-green-600"
                      : "text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
                <p className="text-gray-600">Here's your farming business overview.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
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

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pendingConsignments}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.completedConsignments}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        KSh {stats.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveSection("consignments")}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Submit New Consignment
                    </button>
                    <button
                      onClick={() => setActiveSection("wallet")}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Check Wallet
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "consignments" && (
            <ConsignmentsSection
              consignments={consignments}
              onRefresh={fetchDashboardData}
              canSubmit={canSubmitConsignments}
              showPaymentModal={showPaymentModal}
              setShowPaymentModal={setShowPaymentModal}
            />
          )}

          {activeSection === "wallet" && (
            <WalletSection wallet={wallet} token={token} />
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={user?.firstName || ""}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={user?.lastName || ""}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={user?.phone || ""}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Consignments Section Component with Image Upload
function ConsignmentsSection({
  consignments,
  onRefresh,
  canSubmit,
  showPaymentModal,
  setShowPaymentModal,
}: any) {
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
    images: [],
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file size (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error("Only image files are allowed");
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please pay the registration fee first");
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken = localStorage.getItem("authToken") || token;

      if (!authToken) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      console.log("🔐 Submitting with token:", authToken.substring(0, 20) + "...");
      
      // Convert images to base64
      const imageUrls = [];
      for (const file of selectedImages) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64);
      }
      
      const payload = {
        product_name: formData.title,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price_per_unit: parseFloat(formData.bidPricePerUnit),
        notes: formData.description,
        location: formData.location,
        harvest_date: formData.harvestDate,
        expiry_date: formData.expiryDate,
        images: imageUrls,
      };
      
      await axios.post("/api/consignments", payload, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

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
        images: [],
      });
      setSelectedImages([]);
      setImagePreviews([]);
      onRefresh();
    } catch (error: any) {
      console.error("❌ Error submitting consignment:", error);
      toast.error(error.response?.data?.error || "Failed to submit consignment");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                You must pay the KES 300 registration fee before submitting consignments.
              </span>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="ml-3 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Consignment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Fresh Organic Tomatoes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Legumes">Legumes</option>
                    <option value="Herbs">Herbs</option>
                    <option value="Root Crops">Root Crops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="pieces">Pieces</option>
                    <option value="bunches">Bunches</option>
                    <option value="bags">Bags</option>
                    <option value="crates">Crates</option>
                    <option value="tonnes">Tonnes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bid Price per Unit (KSh) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.bidPricePerUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, bidPricePerUnit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 120.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Nakuru, Kenya"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, harvestDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Describe your produce quality, farming methods, organic certification, etc."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Optional)
                </label>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Add Images
                      </div>
                    </label>
                    <span className="text-sm text-gray-500">
                      Max 5 images, 5MB each (JPG, PNG, GIF)
                    </span>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No images uploaded yet</p>
                      <p className="text-sm text-gray-400">Images help buyers see your produce quality</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estimated Total */}
              {formData.quantity && formData.bidPricePerUnit && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">Estimated Total Value:</span>
                    <span className="text-green-900 font-bold text-lg">
                      KSh {(parseFloat(formData.quantity) * parseFloat(formData.bidPricePerUnit)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Consignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consignments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            All Consignments ({consignments.length})
          </h3>
        </div>
        <div className="divide-y">
          {consignments.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No consignments yet
              </h3>
              <p className="text-gray-600">
                Submit your first consignment to start selling your produce.
              </p>
            </div>
          ) : (
            consignments.map((consignment) => (
              <div key={consignment.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{consignment.title}</h4>
                    <p className="text-gray-600 mt-1">{consignment.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{consignment.quantity} {consignment.unit}</span>
                      <span>KSh {consignment.bidPricePerUnit}/unit</span>
                      <span>{consignment.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consignment.status)}`}>
                      {consignment.status}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(consignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
