import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import axios from "axios";
import toast from "react-hot-toast";

interface UnpaidFarmer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  county: string;
  registrationFeePaid: boolean;
  registeredAt: string;
  daysSinceRegistration: number;
  gracePeriodRemaining: number;
  lastPaymentAttempt?: string;
  consignmentCount: number;
}

interface FeeSettings {
  farmerRegistrationFee: number;
  registrationFeeEnabled: boolean;
  gracePeriodDays: number;
}

export default function RegistrationFeesPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [unpaidFarmers, setUnpaidFarmers] = useState<UnpaidFarmer[]>([]);
  const [filteredFarmers, setFilteredFarmers] = useState<UnpaidFarmer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [feeSettings, setFeeSettings] = useState<FeeSettings>({
    farmerRegistrationFee: 300,
    registrationFeeEnabled: true,
    gracePeriodDays: 7,
  });

  const [stats, setStats] = useState({
    totalUnpaid: 0,
    withinGracePeriod: 0,
    overdue: 0,
    totalOutstanding: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterFarmers();
  }, [searchTerm, filterStatus, unpaidFarmers]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("💰 Fetching unpaid farmers data");

      // Fetch settings first
      const settingsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (
        settingsResponse.data.success &&
        settingsResponse.data.settings.fees
      ) {
        setFeeSettings(settingsResponse.data.settings.fees);
      }

      // Fetch unpaid farmers
      const farmersResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/registration-fees/unpaid`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (farmersResponse.data.success) {
        const farmersData = farmersResponse.data.farmers;
        setUnpaidFarmers(farmersData);

        // Calculate stats
        const totalUnpaid = farmersData.length;
        const withinGracePeriod = farmersData.filter(
          (f: UnpaidFarmer) => f.gracePeriodRemaining > 0,
        ).length;
        const overdue = farmersData.filter(
          (f: UnpaidFarmer) => f.gracePeriodRemaining <= 0,
        ).length;
        const totalOutstanding =
          farmersData.length * feeSettings.farmerRegistrationFee;

        setStats({ totalUnpaid, withinGracePeriod, overdue, totalOutstanding });

        console.log("✅ Unpaid farmers loaded:", farmersData);
      }
    } catch (error) {
      console.error("❌ Error fetching unpaid farmers:", error);

      // Demo data fallback
      const demoFarmers = [
        {
          id: "farmer-001",
          firstName: "John",
          lastName: "Kimani",
          email: "john@example.com",
          phone: "+254712345678",
          county: "Nakuru",
          registrationFeePaid: false,
          registeredAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          daysSinceRegistration: 5,
          gracePeriodRemaining: 2,
          consignmentCount: 0,
        },
        {
          id: "farmer-002",
          firstName: "Mary",
          lastName: "Wanjiku",
          email: "mary@example.com",
          phone: "+254723456789",
          county: "Meru",
          registrationFeePaid: false,
          registeredAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          daysSinceRegistration: 10,
          gracePeriodRemaining: -3,
          consignmentCount: 2,
        },
        {
          id: "farmer-003",
          firstName: "Peter",
          lastName: "Mwangi",
          email: "peter@example.com",
          phone: "+254734567890",
          county: "Kiambu",
          registrationFeePaid: false,
          registeredAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          daysSinceRegistration: 3,
          gracePeriodRemaining: 4,
          consignmentCount: 1,
        },
      ];

      setUnpaidFarmers(demoFarmers);
      setStats({
        totalUnpaid: 3,
        withinGracePeriod: 2,
        overdue: 1,
        totalOutstanding: 900,
      });

      toast.error("Failed to fetch data, showing demo");
    } finally {
      setLoading(false);
    }
  };

  const filterFarmers = () => {
    let filtered = unpaidFarmers.filter((farmer) => {
      const matchesSearch =
        farmer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone.includes(searchTerm) ||
        farmer.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "grace" && farmer.gracePeriodRemaining > 0) ||
        (filterStatus === "overdue" && farmer.gracePeriodRemaining <= 0);

      return matchesSearch && matchesFilter;
    });

    setFilteredFarmers(filtered);
  };

  const handleSTKPush = async (farmer: UnpaidFarmer) => {
    try {
      console.log(`💳 Initiating STK push for farmer ${farmer.id}`);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/registration-fees/stk-push`,
        {
          farmer_id: farmer.id,
          phone_number: farmer.phone,
          amount: feeSettings.farmerRegistrationFee,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success(
          `STK push sent to ${farmer.firstName} ${farmer.lastName}`,
        );

        // Update the farmer's last payment attempt
        setUnpaidFarmers((prev) =>
          prev.map((f) =>
            f.id === farmer.id
              ? { ...f, lastPaymentAttempt: new Date().toISOString() }
              : f,
          ),
        );
      } else {
        toast.error(response.data.message || "Failed to send STK push");
      }
    } catch (error: any) {
      console.error("❌ STK push error:", error);
      toast.error(error.response?.data?.message || "Failed to send STK push");
    }
  };

  const handleBulkSTKPush = async () => {
    if (!confirm(`Send STK push to all ${filteredFarmers.length} farmers?`))
      return;

    try {
      const promises = filteredFarmers.map((farmer) => handleSTKPush(farmer));
      await Promise.all(promises);
      toast.success(`STK push sent to ${filteredFarmers.length} farmers`);
    } catch (error) {
      toast.error("Some STK pushes failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-green-600" />
          <span>Loading registration fees data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Registration Fees Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage farmer registration fees and payment collection
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              {filteredFarmers.length > 0 && (
                <button
                  onClick={handleBulkSTKPush}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Bulk STK Push</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fee Settings Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <CreditCard className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-800">
                Current Fee Settings
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Registration Fee:{" "}
                <strong>
                  KSh {feeSettings.farmerRegistrationFee.toLocaleString()}
                </strong>{" "}
                • Grace Period:{" "}
                <strong>{feeSettings.gracePeriodDays} days</strong> • Status:{" "}
                <strong>
                  {feeSettings.registrationFeeEnabled ? "Enabled" : "Disabled"}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.totalUnpaid}
                </h3>
                <p className="text-gray-600 text-sm">Unpaid Farmers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.withinGracePeriod}
                </h3>
                <p className="text-gray-600 text-sm">Within Grace Period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.overdue}
                </h3>
                <p className="text-gray-600 text-sm">Overdue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  KSh {stats.totalOutstanding.toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">Total Outstanding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search farmers by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Farmers</option>
                  <option value="grace">Within Grace Period</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Farmers List */}
          <div className="p-6">
            {filteredFarmers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No unpaid farmers found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "All farmers have paid their registration fees"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {farmer.firstName} {farmer.lastName}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              farmer.gracePeriodRemaining > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {farmer.gracePeriodRemaining > 0
                              ? `${farmer.gracePeriodRemaining} days remaining`
                              : `${Math.abs(farmer.gracePeriodRemaining)} days overdue`}
                          </span>
                          {farmer.consignmentCount > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {farmer.consignmentCount} consignments
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{farmer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{farmer.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Registered {farmer.daysSinceRegistration} days ago
                            </span>
                          </div>
                        </div>

                        {farmer.lastPaymentAttempt && (
                          <div className="mt-2 text-sm text-gray-500">
                            Last STK push:{" "}
                            {new Date(
                              farmer.lastPaymentAttempt,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="text-right mb-2 sm:mb-0 sm:mr-4">
                          <p className="font-semibold text-gray-900">
                            KSh{" "}
                            {feeSettings.farmerRegistrationFee.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Registration Fee
                          </p>
                        </div>

                        <button
                          onClick={() => handleSTKPush(farmer)}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send STK Push</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
