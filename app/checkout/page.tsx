"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Smartphone,
  Truck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  county: string;
  town: string;
  address: string;
  notes: string;
}

interface PaymentMethod {
  type: "mpesa" | "cash_on_delivery";
  mpesaPhone?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const { state, clearCart, addItem } = useCart();
  const [step, setStep] = useState<"info" | "payment" | "confirmation">("info");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    county: "",
    town: "",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: "mpesa",
  });
  const [orderNumber, setOrderNumber] = useState<string>("");

  // Helper functions for step styling
  const getStepTextClass = (currentStep: string) => {
    if (currentStep === "payment") return "text-primary-600";
    if (currentStep === "confirmation") return "text-green-600";
    return "text-gray-400";
  };

  const getStepBgClass = (currentStep: string) => {
    if (currentStep === "payment") return "bg-primary-600 text-white";
    if (currentStep === "confirmation") return "bg-green-600 text-white";
    return "bg-gray-300 text-gray-600";
  };

  // Wait for cart to hydrate before showing empty cart message
  if (!state.isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Add demo items for testing if cart is empty
  const addDemoItems = () => {
    addItem({
      id: `cart-demo-1-${Date.now()}`,
      productId: "demo-1",
      name: "Organic Tomatoes",
      price: 130,
      unit: "kg",
      image: "/api/placeholder/300/200?text=Tomatoes",
      farmerName: "Jane Wanjiku",
      maxStock: 50,
      quantity: 2,
    });
    addItem({
      id: `cart-demo-2-${Date.now()}`,
      productId: "demo-2",
      name: "Fresh Spinach",
      price: 80,
      unit: "kg",
      image: "/api/placeholder/300/200?text=Spinach",
      farmerName: "John Kamau",
      maxStock: 30,
      quantity: 1,
    });
  };

  // Show empty cart message only after hydration
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before checking out.
          </p>
          <div className="space-x-4">
            <Link href="/marketplace" className="btn-primary">
              Continue Shopping
            </Link>
            <button
              onClick={addDemoItems}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Demo Items (Test)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee = 200; // Fixed delivery fee for demo
  const totalWithDelivery = state.totalAmount + deliveryFee;

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !customerInfo.firstName ||
      !customerInfo.lastName ||
      !customerInfo.phone ||
      !customerInfo.county ||
      !customerInfo.town ||
      !customerInfo.address
    ) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    // Validate phone number format (basic check)
    if (
      !customerInfo.phone.match(/^\+?254[0-9]{9}$/) &&
      !customerInfo.phone.match(/^07[0-9]{8}$/)
    ) {
      alert(
        "Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)",
      );
      return;
    }

    setStep("payment");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate payment method
    if (paymentMethod.type === "mpesa" && !paymentMethod.mpesaPhone) {
      alert("Please enter your M-Pesa phone number");
      return;
    }

    setIsProcessing(true);

    try {
      // Create customer account and process order
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerInfo,
          paymentMethod,
          cartItems: state.items,
          totalAmount: totalWithDelivery,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOrderNumber(result.orderNumber);
        setStep("confirmation");

        // Clear cart after successful order
        clearCart();
      } else {
        throw new Error("Order processing failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const counties = [
    "Nairobi",
    "Kiambu",
    "Machakos",
    "Kajiado",
    "Murang'a",
    "Nyeri",
    "Kirinyaga",
    "Nyandarua",
    "Meru",
    "Tharaka Nithi",
    "Embu",
    "Kitui",
    "Makueni",
    "Nakuru",
    "Uasin Gishu",
    "Trans Nzoia",
    "Kakamega",
    "Vihiga",
    "Bungoma",
    "Busia",
    "Siaya",
    "Kisumu",
    "Homa Bay",
    "Migori",
    "Kisii",
    "Nyamira",
    "Kericho",
    "Bomet",
    "Narok",
    "Laikipia",
    "Samburu",
    "Isiolo",
    "Marsabit",
    "Turkana",
    "West Pokot",
    "Baringo",
    "Elgeyo Marakwet",
    "Nandi",
    "Garissa",
    "Wajir",
    "Mandera",
    "Mombasa",
    "Kwale",
    "Kilifi",
    "Tana River",
    "Lamu",
    "Taita Taveta",
  ];

  if ((step as string) === "confirmation") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your order number is{" "}
              <span className="font-bold text-primary-600">#{orderNumber}</span>
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• We'll confirm your order within 2 hours</p>
                <p>• Farmers will prepare your fresh produce</p>
                <p>• Our driver will deliver to your location</p>
                {paymentMethod.type === "mpesa" && (
                  <p>• M-Pesa payment will be processed automatically</p>
                )}
                {paymentMethod.type === "cash_on_delivery" && (
                  <p>• Payment will be collected upon delivery</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/marketplace" className="btn-primary w-full">
                Continue Shopping
              </Link>
              <Link href="/" className="btn-secondary w-full">
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/marketplace"
            className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          <div
            className={`flex items-center ${step === "info" ? "text-primary-600" : "text-green-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "info" ? "bg-primary-600 text-white" : "bg-green-600 text-white"}`}
            >
              {step === "info" ? "1" : <CheckCircle className="h-5 w-5" />}
            </div>
            <span className="ml-2 font-medium">Customer Information</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div className={`flex items-center ${getStepTextClass(step)}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepBgClass(step)}`}
            >
              {(step as string) === "confirmation" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                "2"
              )}
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "info" && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h2>

                <form onSubmit={handleCustomerInfoSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+254712345678"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Delivery Address
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          County *
                        </label>
                        <select
                          required
                          value={customerInfo.county}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              county: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select County</option>
                          {counties.map((county) => (
                            <option key={county} value={county}>
                              {county}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Town/Area *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerInfo.town}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              town: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detailed Address *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Please provide detailed delivery instructions (building name, floor, landmarks, etc.)"
                        value={customerInfo.address}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any special instructions for delivery or preferences"
                        value={customerInfo.notes}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            notes: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full btn-primary">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h2>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Payment Options */}
                  <div className="space-y-4">
                    {/* M-Pesa Option */}
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod.type === "mpesa" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mpesa"
                          checked={paymentMethod.type === "mpesa"}
                          onChange={(e) =>
                            setPaymentMethod({
                              type: "mpesa",
                              mpesaPhone: customerInfo.phone,
                            })
                          }
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <h3 className="font-semibold">M-Pesa Payment</h3>
                            <p className="text-sm text-gray-600">
                              Pay securely with M-Pesa STK Push
                            </p>
                          </div>
                        </div>
                      </label>

                      {paymentMethod.type === "mpesa" && (
                        <div className="mt-4 pl-8">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            M-Pesa Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+254712345678"
                            value={
                              paymentMethod.mpesaPhone || customerInfo.phone
                            }
                            onChange={(e) =>
                              setPaymentMethod({
                                ...paymentMethod,
                                mpesaPhone: e.target.value,
                              })
                            }
                            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You'll receive an STK push notification to complete
                            payment
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery Option */}
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod.type === "cash_on_delivery" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash_on_delivery"
                          checked={paymentMethod.type === "cash_on_delivery"}
                          onChange={(e) =>
                            setPaymentMethod({ type: "cash_on_delivery" })
                          }
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <h3 className="font-semibold">Pay on Delivery</h3>
                            <p className="text-sm text-gray-600">
                              Pay with cash when your order arrives
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">
                          Important:
                        </p>
                        <p className="text-yellow-700">
                          By proceeding, you agree to create a Zuasoko customer
                          account with the information provided. This will allow
                          you to track your orders and enjoy faster checkout in
                          the future.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep("info")}
                      className="flex-1 btn-secondary"
                    >
                      Back to Information
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">{item.farmerName}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} {item.unit} × KES{" "}
                        {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({state.totalItems} items)</span>
                  <span>KES {state.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>KES {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>KES {totalWithDelivery.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
