"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function FarmerActivationPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const phone = searchParams.get("phone");
    if (phone) {
      setPhoneNumber(phone);
    }
  }, [searchParams]);

  const handleStkPush = async () => {
    if (!phoneNumber) {
      setError("Please enter your phone number");
      return;
    }

    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number");
      return;
    }

    setIsLoading(true);
    setError("");
    setPaymentStatus("processing");

    try {
      const response = await fetch("/api/payments/stk-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount: 300,
          description: "Farmer Account Activation Fee",
          type: "ACTIVATION_FEE",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTransactionId(data.transactionId);
        // Poll for payment status
        pollPaymentStatus(data.transactionId);
      } else {
        setError(data.error || "Failed to initiate payment");
        setPaymentStatus("failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setPaymentStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (txId: string) => {
    const maxAttempts = 30; // 3 minutes with 6-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/status/${txId}`);
        const data = await response.json();

        if (data.status === "COMPLETED") {
          setPaymentStatus("success");
          setTimeout(() => {
            router.push("/farmer/dashboard");
          }, 3000);
        } else if (data.status === "FAILED" || data.status === "CANCELLED") {
          setPaymentStatus("failed");
          setError(data.message || "Payment failed");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 6000); // Poll every 6 seconds
        } else {
          setPaymentStatus("failed");
          setError("Payment timeout. Please try again.");
        }
      } catch (err) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 6000);
        } else {
          setPaymentStatus("failed");
          setError("Unable to verify payment status");
        }
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
            alt="Zuasoko Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Activate Your Farmer Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pay KES 300 activation fee to complete your registration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {paymentStatus === "idle" && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  M-Pesa Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 input-field"
                  placeholder="+254712345678"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Payment Instructions
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Click "Pay with M-Pesa" button below</li>
                        <li>Check your phone for the M-Pesa PIN prompt</li>
                        <li>Enter your M-Pesa PIN to complete payment</li>
                        <li>Wait for confirmation message</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <button
                  onClick={handleStkPush}
                  disabled={isLoading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {isLoading
                    ? "Initiating Payment..."
                    : "Pay KES 300 with M-Pesa"}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Registration
                </button>
              </div>
            </div>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Processing Payment
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Please complete the payment on your phone. Check your phone
                  for the M-Pesa PIN prompt.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Transaction ID: {transactionId}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  This page will automatically redirect when payment is
                  completed.
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Successful!
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Your farmer account has been activated. You will be redirected
                  to your dashboard shortly.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Transaction ID: {transactionId}
                </p>
              </div>
              <button
                onClick={() => router.push("/farmer/dashboard")}
                className="btn-primary"
              >
                Continue to Dashboard
              </button>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="text-center space-y-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Failed
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {error ||
                    "There was an issue processing your payment. Please try again."}
                </p>
                {transactionId && (
                  <p className="text-xs text-gray-500 mt-2">
                    Transaction ID: {transactionId}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setPaymentStatus("idle");
                    setError("");
                    setTransactionId("");
                  }}
                  className="w-full btn-primary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full btn-secondary"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
