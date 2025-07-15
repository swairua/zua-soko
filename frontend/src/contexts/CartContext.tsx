import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth";

// Types
interface CartItem {
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
    farmer: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

interface Cart {
  id: string;
  customerId: string;
  totalItems: number;
  totalAmount: number;
  items: CartItem[];
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
}

interface CartContextType extends CartState {
  addToCart: (produceId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Initial state
const initialState: CartState = {
  cart: null,
  isLoading: false,
};

// Action types
type CartAction =
  | { type: "CART_START" }
  | { type: "CART_SUCCESS"; payload: Cart }
  | { type: "CART_ERROR" }
  | { type: "CART_CLEAR" };

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "CART_START":
      return { ...state, isLoading: true };
    case "CART_SUCCESS":
      return {
        ...state,
        isLoading: false,
        cart: action.payload,
      };
    case "CART_ERROR":
      return { ...state, isLoading: false };
    case "CART_CLEAR":
      return { ...state, cart: null };
    default:
      return state;
  }
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuthStore();

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.role === "CUSTOMER") {
      refreshCart();
    } else {
      dispatch({ type: "CART_CLEAR" });
    }
  }, [isAuthenticated, user]);

  const refreshCart = async () => {
    if (!isAuthenticated || user?.role !== "CUSTOMER") return;

    try {
      dispatch({ type: "CART_START" });
      const response = await axios.get("/api/cart");
      dispatch({ type: "CART_SUCCESS", payload: response.data });
    } catch (error) {
      dispatch({ type: "CART_ERROR" });
      console.error("Failed to fetch cart:", error);
    }
  };

  const addToCart = async (produceId: string, quantity: number) => {
    if (!isAuthenticated || user?.role !== "CUSTOMER") {
      toast.error("Please login as a customer to add items to cart");
      return;
    }

    try {
      dispatch({ type: "CART_START" });
      const response = await axios.post("/api/cart/items", {
        produceId,
        quantity,
      });
      dispatch({ type: "CART_SUCCESS", payload: response.data });
      toast.success("Item added to cart!");
    } catch (error: any) {
      dispatch({ type: "CART_ERROR" });
      const message =
        error.response?.data?.error || "Failed to add item to cart";
      toast.error(message);
      throw error;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: "CART_START" });
      await axios.put(`/api/cart/items/${itemId}`, { quantity });
      await refreshCart();
      toast.success("Cart updated!");
    } catch (error: any) {
      dispatch({ type: "CART_ERROR" });
      const message =
        error.response?.data?.error || "Failed to update cart item";
      toast.error(message);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: "CART_START" });
      await axios.delete(`/api/cart/items/${itemId}`);
      await refreshCart();
      toast.success("Item removed from cart!");
    } catch (error: any) {
      dispatch({ type: "CART_ERROR" });
      const message =
        error.response?.data?.error || "Failed to remove item from cart";
      toast.error(message);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: "CART_START" });
      await axios.delete("/api/cart");
      await refreshCart();
      toast.success("Cart cleared!");
    } catch (error: any) {
      dispatch({ type: "CART_ERROR" });
      const message = error.response?.data?.error || "Failed to clear cart";
      toast.error(message);
      throw error;
    }
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
