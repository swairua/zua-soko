import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { formatMpesaPhone, validateKenyanPhone } from "../utils/mpesa";

export default function TestMpesaPage() {
  const [phoneNumber, setPhoneNumber] = useState("0712345678");
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const testRegistrationFee = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/registration-fee`,
        { phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Registration fee payment initiated!");
      console.log("Registration fee response:", response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Payment failed");
      console.error("Registration fee error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testWalletWithdrawal = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/withdraw`,
        { amount, phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Wallet withdrawal initiated!");
      console.log("Withdrawal response:", response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Withdrawal failed");
      console.error("Withdrawal error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testCheckoutPayment = async () => {
    setLoading(true);
    try {
      // Validate phone number
      const formattedPhone = formatMpesaPhone(phoneNumber);
      if (!validateKenyanPhone(formattedPhone)) {
        toast.error("Please enter a valid Kenyan phone number");
        return;
      }

      const response = await axios.post("/api/payments/stk-push", {
        phone: formattedPhone,
        amount: amount,
        orderId: "test-order-" + Date.now(),
        accountReference: "Test Payment",
        transactionDesc: "Test STK Push",
      });

      if (response.data.success) {
        toast.success("M-Pesa payment request sent!");
        console.log("STK Push response:", response.data);
      } else {
        toast.error("Failed to initiate payment");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "STK Push failed");
      console.error("STK Push error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testPhoneValidation = () => {
    const formatted = formatMpesaPhone(phoneNumber);
    const isValid = validateKenyanPhone(phoneNumber);

    toast(`Phone: ${phoneNumber} → ${formatted} (Valid: ${isValid})`, {
      icon: "ℹ️",
    });
    console.log("Phone validation:", {
      original: phoneNumber,
      formatted,
      isValid,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        M-Pesa Integration Test
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
              max="150000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={testPhoneValidation}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Validate Phone
          </button>

          <button
            onClick={testRegistrationFee}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Test Registration Fee
          </button>

          <button
            onClick={testWalletWithdrawal}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Test Withdrawal
          </button>

          <button
            onClick={testCheckoutPayment}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            Test STK Push
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Demo Configuration
        </h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>
            <strong>Environment:</strong> Sandbox
          </p>
          <p>
            <strong>Business Short Code:</strong> 174379
          </p>
          <p>
            <strong>Test Phone:</strong> 0712345678 (or any valid Kenyan number)
          </p>
          <p>
            <strong>Demo Credentials:</strong> Configured for development
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          How to Test
        </h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            1. <strong>Login:</strong> Use demo credentials to login as
            farmer/customer
          </p>
          <p>
            2. <strong>Registration Fee:</strong> Test farmer activation payment
            (KES 300)
          </p>
          <p>
            3. <strong>Wallet Withdrawal:</strong> Test farmer wallet withdrawal
          </p>
          <p>
            4. <strong>STK Push:</strong> Test direct M-Pesa payment request
          </p>
          <p>
            5. <strong>Checkout:</strong> Go to marketplace, add items, and
            checkout with M-Pesa
          </p>
        </div>
      </div>
    </div>
  );
}
