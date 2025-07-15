"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartButton() {
  const { state, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-30 group"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {state.totalItems > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {state.totalItems > 99 ? "99+" : state.totalItems}
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {state.totalItems === 0
          ? "Cart is empty"
          : `${state.totalItems} item${state.totalItems !== 1 ? "s" : ""} in cart`}
      </div>
    </button>
  );
}
