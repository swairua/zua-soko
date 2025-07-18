import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Heart,
  MapPin,
  Clock,
  Tag,
} from "lucide-react";
import { useCart } from "../../store/cart";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface CartItemData {
  id: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  produce: {
    id: string;
    name: string;
    images: string[];
    pricePerUnit: number;
    stockQuantity: number;
    unit: string;
    category: string;
    farmer: {
      user: {
        firstName: string;
        lastName: string;
      };
      county: string;
    };
  };
}

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
    refreshCart,
  } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    setUpdating(itemId);
    try {
      if (newQuantity === 0) {
        removeFromCart(itemId);
      } else {
        updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      // Error is handled in the context
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?",
      )
    ) {
      try {
        removeFromCart(itemId);
      } catch (error) {
        // Error is handled in the context
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await clearCart();
      } catch (error) {
        // Error is handled in the context
      }
    }
  };

  const applyCoupon = () => {
    // Mock coupon application
    if (couponCode.toLowerCase() === "first10") {
      setAppliedCoupon({
        code: "FIRST10",
        discount: 10,
        type: "percentage",
      });
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } else if (couponCode.toLowerCase() === "save100") {
      setAppliedCoupon({
        code: "SAVE100",
        discount: 100,
        type: "fixed",
      });
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (subtotal: number) => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.discount) / 100;
    } else {
      return Math.min(appliedCoupon.discount, subtotal);
    }
  };

  const getDeliveryFee = (subtotal: number) => {
    return subtotal >= 1000 ? 0 : 150; // Free delivery over KES 1000
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/marketplace"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium inline-flex items-center"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalAmount;
  const discount = calculateDiscount(subtotal);
  const discountedSubtotal = subtotal - discount;
  const deliveryFee = getDeliveryFee(discountedSubtotal);
  const total = discountedSubtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        {cart.items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="space-y-6">
                {cart.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/api/placeholder/80/80?text=" +
                                encodeURIComponent(item.name);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            📦
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link
                              to={`/marketplace/product/${item.productId}`}
                              className="hover:text-primary-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                          </h3>

                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span>Fresh Produce</span>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.pricePerUnit)} / {item.unit}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity Controls and Total */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={
                              updating === item.id || item.quantity <= 1
                            }
                            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            min="1"
                            max={999}
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity !== item.quantity) {
                                handleQuantityChange(item.id, newQuantity);
                              }
                            }}
                            className="w-16 px-2 py-2 text-center border-0 focus:ring-0"
                            disabled={updating === item.id}
                          />

                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={updating === item.id}
                            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(
                              (item.pricePerUnit || 0) * (item.quantity || 0),
                            )}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-gray-600">
                              {item.quantity} ×{" "}
                              {formatPrice(item.pricePerUnit || 0)}
                            </div>
                          )}
                        </div>
                      </div>

                      {updating === item.id && (
                        <div className="mt-2 text-sm text-primary-600">
                          Updating...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link
              to="/marketplace"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {appliedCoupon.code}
                    <button
                      onClick={removeCoupon}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center">
                  Delivery Fee
                  {deliveryFee === 0 && (
                    <span className="ml-2 text-green-600 text-sm">(Free)</span>
                  )}
                </span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={applyCoupon}
                  disabled={!couponCode.trim()}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Apply
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Try: FIRST10 (10% off) or SAVE100 (KES 100 off)
              </p>
            </div>

            {/* Delivery Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4 mr-2" />
                <span>Estimated delivery: 1-2 business days</span>
              </div>
              <div className="text-xs text-gray-500">
                {deliveryFee === 0
                  ? "🎉 You qualify for free delivery!"
                  : `Spend ${formatPrice(1000 - discountedSubtotal)} more for free delivery`}
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium inline-flex items-center justify-center"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500">
                🔒 Secure checkout powered by M-Pesa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
