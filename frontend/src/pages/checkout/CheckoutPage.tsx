import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  Truck,
  UserPlus,
} from "lucide-react";
import { useCart } from "../../store/cart";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";
import {
  formatMpesaPhone,
  validateKenyanPhone,
  pollPaymentStatus,
} from "../../utils/mpesa";

interface CheckoutFormData {
  // Customer Information
  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  // Delivery Address
  county: string;
  subCounty: string;
  ward: string;
  street: string;
  buildingName: string;
  deliveryInstructions: string;

  // Payment
  paymentMethod: "MPESA" | "COD";
  mpesaPhone: string;

  // Guest Registration
  createAccount: boolean;
  password: string;
}

interface CartSummary {
  totalItems: number;
  totalAmount: number;
  deliveryFee: number;
  grandTotal: number;
  items: any[];
  unavailableItems: any[];
  isReadyForCheckout: boolean;
}

const kenyanCounties = [
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Nakuru",
  "Machakos",
  "Kajiado",
  "Murang'a",
  "Nyeri",
  "Meru",
  "Embu",
  "Tharaka-Nithi",
  "Kirinyaga",
  "Nyandarua",
  "Laikipia",
  "Samburu",
  "Trans-Nzoia",
  "Uasin-Gishu",
  "Elgeyo-Marakwet",
  "Nandi",
  "Baringo",
  "Kericho",
  "Bomet",
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
  "Narok",
  "Turkana",
  "West Pokot",
  "Isiolo",
  "Marsabit",
  "Mandera",
  "Wajir",
  "Garissa",
  "Tana River",
  "Lamu",
  "Taita-Taveta",
  "Kwale",
  "Kilifi",
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cartStore = useCart();
  const { cart, clearCart, refreshCart, removeFromCart, validateCartItems } = cartStore;
  const { user, isAuthenticated, loginWithData } = useAuthStore();
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Review, 3: Payment, 4: Confirmation
  const [orderResult, setOrderResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      paymentMethod: "MPESA",
      mpesaPhone: user?.phone || "",
      createAccount: !isAuthenticated, // Default to true for guests
      password: "",
    },
  });

  const watchPaymentMethod = watch("paymentMethod");
  const watchCounty = watch("county");
  const watchCreateAccount = watch("createAccount");

  useEffect(() => {
    // Check cart validity and fetch summary
    fetchCartSummary();
  }, []); // Only run once on mount

  const fetchCartSummary = async () => {
    try {
      setLoading(true);

      console.log("🛒 CHECKOUT - Current cart state:", cart);
      console.log("🛒 CHECKOUT - Cart items detail:", cart.items);

      // Validate cart first
      await validateCartItems();

      // Check if cart is empty after validation
      if (cart.items.length === 0) {
        console.log("🛒 CHECKOUT - Cart is empty, redirecting to marketplace");
        toast.error("Your cart is empty. Please add items from the marketplace.");
        navigate("/marketplace");
        return;
      }

      // Check if items have valid prices
      const itemsWithInvalidPrices = cart.items.filter(item => !item.pricePerUnit || item.pricePerUnit <= 0);
      if (itemsWithInvalidPrices.length > 0) {
        console.warn("🛒 CHECKOUT - Items with invalid prices found:", itemsWithInvalidPrices.length);

        // Show warning to user but don't remove items here - let user decide
<<<<<<< HEAD
        toast.error(`${itemsWithInvalidPrices.length} items have pricing issues. Please review your cart.`);
=======
        toast.warning(`${itemsWithInvalidPrices.length} items have pricing issues. Please review your cart.`);
>>>>>>> origin/main
      }

      // Use local cart data from Zustand store
      const deliveryFee = cart.totalAmount > 2000 ? 0 : 300;
      const cartData = {
        items: cart.items,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        isReadyForCheckout: cart.items.length > 0,
        deliveryFee,
        subtotal: cart.totalAmount,
        total: cart.totalAmount + deliveryFee,
        grandTotal: cart.totalAmount + deliveryFee,
        unavailableItems: [],
      };

      console.log("🛒 CHECKOUT - Final cart data:", cartData);
      setCartSummary(cartData);

      // Check if cart is empty
      if (cart.totalItems === 0) {
        toast.error("Your cart is empty");
        navigate("/marketplace");
        return;
      }
    } catch (error) {
      console.error("Failed to load cart summary:", error);
      toast.error("Failed to load cart summary");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cartSummary) return;

    setSubmitting(true);
    try {
      const orderData = {
        items: cartSummary.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.pricePerUnit,
        })),
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          address: `${data.street}, ${data.ward}, ${data.subCounty}, ${data.county}`,
          county: data.county,
          buildingName: data.buildingName,
          deliveryInstructions: data.deliveryInstructions,
        },
        paymentMethod: data.paymentMethod,
        mpesaPhone:
          data.paymentMethod === "MPESA" ? data.mpesaPhone : undefined,
        deliveryFee: cartSummary.deliveryFee,
        totalAmount: cartSummary.grandTotal,
      };

      const response = await axios.post("/api/orders", orderData);
      setOrderResult(response.data);

      // If payment method is M-Pesa, initiate STK push
      if (data.paymentMethod === "MPESA" && data.mpesaPhone) {
        try {
          // Validate phone number
          const formattedPhone = formatMpesaPhone(data.mpesaPhone);
          if (!validateKenyanPhone(formattedPhone)) {
            toast.error("Please enter a valid Kenyan phone number");
            return;
          }

          toast("Initiating M-Pesa payment...", { icon: "ℹ️" });

          const stkResponse = await axios.post("/api/payments/stk-push", {
            phone: formattedPhone,
            amount: cartSummary.grandTotal,
            orderId: response.data.orderId,
            accountReference: `Order-${response.data.orderId}`,
            transactionDesc: `Payment for order ${response.data.orderId}`,
          });

          if (stkResponse.data.success) {
            toast.success(
              "M-Pesa payment request sent! Please check your phone.",
            );

            // Poll for payment status
            try {
              toast("Waiting for payment confirmation...", { icon: "ℹ️" });
              const paymentResult = await pollPaymentStatus(
                stkResponse.data.transactionId,
              );

              if (paymentResult.success) {
                toast.success("Payment completed successfully!");
                // Update order status or refresh data here
              } else {
                toast.error(
                  `Payment ${paymentResult.status.toLowerCase()}. Please try again.`,
                );
              }
            } catch (pollError) {
              console.error("Payment polling error:", pollError);
              toast("Payment initiated. Status will be updated shortly.", {
                icon: "⚠️",
              });
            }
          } else {
            toast.error("Failed to initiate M-Pesa payment");
          }
        } catch (mpesaError) {
          console.error("M-Pesa STK push error:", mpesaError);
          toast.error("Failed to process M-Pesa payment");
        }
      }

      // Handle guest registration if requested
      if (!isAuthenticated && data.createAccount && data.password) {
        try {
          const registrationData = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            password: data.password,
            county: data.county,
            role: "CUSTOMER",
          };

          const registerResponse = await axios.post(
            "/api/auth/register",
            registrationData,
          );

          if (registerResponse.data.success) {
            // Auto-login the newly registered user
            const { user, token } = registerResponse.data;
            loginWithData(user, token);
            toast.success("Account created and logged in successfully!");
          }
        } catch (registrationError: any) {
          console.error("Failed to create account:", registrationError);
          // Don't fail the order if registration fails, just show a warning
          toast.error(
            "Order placed successfully, but failed to create account. You can register later.",
          );
        }
      }

      // Clear cart after successful order
      await clearCart();

      setStep(4); // Go to confirmation step
      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Failed to create order:", error);
      const message = error.response?.data?.error || "Failed to place order";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartSummary || cartSummary.totalItems === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No items to checkout
          </h1>
          <p className="text-gray-600 mb-6">
            Your cart is empty or items are unavailable
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Check if cart has zero values issue
  const hasZeroValueIssue = cartSummary.totalAmount === 0 && cartSummary.items.length > 0;

  if (hasZeroValueIssue) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cart Contains Invalid Items
          </h1>
          <p className="text-gray-600 mb-4">
            Your cart contains items with Ksh 0 pricing data. This happens when items were added before system updates.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">What you need to do:</h3>
            <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Clear your current cart (items with Ksh 0 prices)</li>
              <li>Visit the marketplace to see current products with correct prices</li>
              <li>Add fresh products to your cart</li>
            </ol>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                clearCart();
                toast.success("Cart cleared! You can now add products with correct prices.");
                navigate("/marketplace");
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors mr-4"
            >
              Clear Cart & Go to Marketplace
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Marketplace (Keep Cart)
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            The marketplace has products with correct prices (Ksh 85, Ksh 120, etc.)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

          {/* Force Fix Button if issues detected */}
          {cart.items.some(item => !item.pricePerUnit || item.pricePerUnit <= 0) && (
            <button
              onClick={() => {
                console.log("🛒 FORCE FIX - Nuclear reset and redirecting");
                clearCart();
                toast.success("Cart completely reset! Redirecting to marketplace...");
                setTimeout(() => {
                  window.location.href = '/marketplace'; // Force full page reload
                }, 1000);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center animate-pulse"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              🚨 Force Fix Cart
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-6">
          <div className="flex items-center">
            {[
              { step: 1, title: "Information" },
              { step: 2, title: "Review" },
              { step: 3, title: "Payment" },
              { step: 4, title: "Confirmation" },
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div
                  className={`flex items-center ${
                    step >= item.step ? "text-primary-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step >= item.step
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {step > item.step ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">{item.title}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step > item.step ? "bg-primary-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {step === 4 ? (
        // Confirmation Step
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h2>

            {orderResult && (
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Order Number:</p>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  {orderResult.order?.orderNumber || orderResult.order?.id}
                </p>

                <p className="text-gray-600 mb-2">Total Amount:</p>
                <p className="text-2xl font-bold text-primary-600 mb-6">
                  {formatPrice(cartSummary.grandTotal)}
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center text-blue-700 mb-2">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-medium">Estimated Delivery</span>
                  </div>
                  <p className="text-blue-600">1-2 business days</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                View Order Status
              </button>

              <button
                onClick={() => navigate("/marketplace")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Information */}
              {step >= 1 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center mb-6">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Customer Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        {...register("firstName", {
                          required: "First name is required",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        {...register("lastName", {
                          required: "Last name is required",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^(\+254|0)[7-9]\d{8}$/,
                            message: "Please enter a valid Kenyan phone number",
                          },
                        })}
                        placeholder="+254712345678"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        {...register("email", {
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          },
                        })}
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Registration */}
              {step >= 1 && !isAuthenticated && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-center mb-4">
                    <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Create Account (Optional)
                    </h2>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        {...register("createAccount")}
                        type="checkbox"
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Create an account to track your orders and save delivery
                        addresses
                      </span>
                    </label>
                  </div>

                  {watchCreateAccount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        {...register("password", {
                          required: watchCreateAccount
                            ? "Password is required"
                            : false,
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        type="password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter password for your new account"
                        disabled={step > 1}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Address */}
              {step >= 1 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center mb-6">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Delivery Address
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <select
                        {...register("county", {
                          required: "County is required",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      >
                        <option value="">Select County</option>
                        {kenyanCounties.map((county) => (
                          <option key={county} value={county}>
                            {county}
                          </option>
                        ))}
                      </select>
                      {errors.county && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.county.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub-County *
                      </label>
                      <input
                        {...register("subCounty", {
                          required: "Sub-county is required",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                      {errors.subCounty && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.subCounty.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ward *
                      </label>
                      <input
                        {...register("ward", { required: "Ward is required" })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                      {errors.ward && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ward.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street/Road *
                      </label>
                      <input
                        {...register("street", {
                          required: "Street is required",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                      {errors.street && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.street.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building/House Name
                      </label>
                      <input
                        {...register("buildingName")}
                        placeholder="Optional: Building name, house number, apartment, etc."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Instructions
                      </label>
                      <textarea
                        {...register("deliveryInstructions")}
                        rows={3}
                        placeholder="Optional: Special delivery instructions, landmarks, etc."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={step > 1}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {step >= 2 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center mb-6">
                    <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        {...register("paymentMethod")}
                        type="radio"
                        value="MPESA"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        disabled={step > 2}
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-700">
                        M-Pesa STK Push
                      </label>
                    </div>

                    {watchPaymentMethod === "MPESA" && (
                      <div className="ml-7">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          M-Pesa Phone Number *
                        </label>
                        <input
                          {...register("mpesaPhone", {
                            required:
                              watchPaymentMethod === "MPESA"
                                ? "M-Pesa phone number is required"
                                : false,
                            pattern: {
                              value: /^(\+254|0)[7-9]\d{8}$/,
                              message:
                                "Please enter a valid Kenyan phone number",
                            },
                          })}
                          placeholder="+254712345678"
                          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          disabled={step > 2}
                        />
                        {errors.mpesaPhone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.mpesaPhone.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        {...register("paymentMethod")}
                        type="radio"
                        value="COD"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        disabled={step > 2}
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-700">
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                {step > 1 && step < 4 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Previous
                  </button>
                )}

                {step < 3 && (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium ml-auto"
                  >
                    Next
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium ml-auto"
                  >
                    {submitting ? "Placing Order..." : "Place Order"}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cartSummary.items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/api/placeholder/48/48?text=" +
                                encodeURIComponent(item.name);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            📦
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} × {formatPrice(item.pricePerUnit || 0)}
                        </p>
                      </div>

                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(
                          (item.pricePerUnit || 0) * (item.quantity || 0),
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>{formatPrice(cartSummary.totalAmount)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center">
                      Delivery Fee
                      {cartSummary.deliveryFee === 0 && (
                        <span className="ml-2 text-green-600 text-sm">
                          (Free)
                        </span>
                      )}
                    </span>
                    <span>{formatPrice(cartSummary.deliveryFee)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(cartSummary.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Truck className="w-4 h-4 mr-2" />
                    <span>Estimated delivery: 1-2 business days</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Orders placed before 3 PM are processed the same day
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
