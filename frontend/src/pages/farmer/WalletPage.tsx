import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface WalletData {
  id: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  mpesaPhone: string;
}

interface Transaction {
  id: string;
  type: "CREDIT" | "WITHDRAWAL";
  amount: number;
  description: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionId?: string;
  createdAt: string;
}

export default function WalletPage() {
  const { token } = useAuthStore();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchWallet();
    // In a real app, you'd also fetch transaction history
    setTransactions([
      {
        id: "1",
        type: "CREDIT",
        amount: 6500,
        description: "Payment for Organic Tomatoes consignment",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        type: "WITHDRAWAL",
        amount: 3000,
        description: "M-Pesa withdrawal",
        status: "COMPLETED",
        transactionId: "MP1234567890",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        type: "CREDIT",
        amount: 2500,
        description: "Payment for Fresh Spinach consignment",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/farmer/wallet`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setWallet(response.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Failed to fetch wallet information");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!wallet || amount > wallet.balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (amount < 100) {
      toast.error("Minimum withdrawal amount is KSh 100");
      return;
    }

    setWithdrawing(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/farmer/wallet/withdraw`,
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(
        `Withdrawal successful! Transaction ID: ${response.data.transactionId}`,
      );
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      fetchWallet();

      // Add transaction to local state
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: "WITHDRAWAL",
        amount,
        description: "M-Pesa withdrawal",
        status: "COMPLETED",
        transactionId: response.data.transactionId,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error(error.response?.data?.error || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Wallet Not Found
          </h2>
          <p className="text-gray-600">Your wallet hasn't been set up yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-1">
            Manage your earnings and withdrawals
          </p>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Available Balance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Available Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  KSh {wallet.balance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={wallet.balance < 100}
              className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Withdraw to M-Pesa
            </button>
          </div>

          {/* Pending Balance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Balance
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  KSh {wallet.pendingBalance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              From pending consignments
            </p>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Earned
                </p>
                <p className="text-2xl font-bold text-green-600">
                  KSh {wallet.totalEarned.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Lifetime earnings</p>
          </div>

          {/* Total Withdrawn */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Withdrawn
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  KSh {wallet.totalWithdrawn.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">All-time withdrawals</p>
          </div>
        </div>

        {/* M-Pesa Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">M-Pesa Account</h3>
              <p className="text-sm text-gray-600">
                Withdrawals will be sent to this number
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-lg text-gray-900">
            {wallet.mpesaPhone}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction History
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-600">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          transaction.type === "CREDIT"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {transaction.type === "CREDIT" ? (
                          <ArrowDownLeft
                            className={`w-5 h-5 ${
                              transaction.type === "CREDIT"
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900">
                          {transaction.type === "CREDIT"
                            ? "Payment Received"
                            : "M-Pesa Withdrawal"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {transaction.description}
                        </p>
                        {transaction.transactionId && (
                          <p className="text-xs text-gray-500 font-mono">
                            ID: {transaction.transactionId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "CREDIT"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {transaction.type === "CREDIT" ? "+" : "-"}KSh{" "}
                        {transaction.amount.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        {transaction.status === "COMPLETED" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {transaction.status === "PENDING" && (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span
                          className={`text-xs ${
                            transaction.status === "COMPLETED"
                              ? "text-green-600"
                              : transaction.status === "PENDING"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Withdraw to M-Pesa
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Send money to your M-Pesa account
                </p>
              </div>

              <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Number
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-gray-900">
                    {wallet.mpesaPhone}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter amount"
                    min="100"
                    max={wallet.balance}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available balance: KSh {wallet.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Minimum withdrawal: KSh 100
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">M-Pesa STK Push</p>
                      <p>
                        You will receive an STK push notification on your phone
                        to confirm this transaction.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={withdrawing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={withdrawing}
                  >
                    {withdrawing ? "Processing..." : "Withdraw"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
