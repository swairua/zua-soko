"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  farmerName: string;
  maxStock: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
  isHydrated: boolean;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: Omit<CartItem, "quantity"> & { quantity?: number };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "OPEN_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_HYDRATED" };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isOpen: false,
  isHydrated: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId,
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex];
        const newQuantity = Math.min(
          existingItem.quantity + (action.payload.quantity || 1),
          existingItem.maxStock,
        );

        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity }
            : item,
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          ...action.payload,
          quantity: Math.min(
            action.payload.quantity || 1,
            action.payload.maxStock,
          ),
        };
        newItems = [...state.items, newItem];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: Math.min(action.payload.quantity, item.maxStock),
              }
            : item,
        )
        .filter((item) => item.quantity > 0);

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      };

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      };

    case "LOAD_CART":
      const totalItems = action.payload.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const totalAmount = action.payload.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        ...state,
        items: action.payload,
        totalItems,
        totalAmount,
        isHydrated: true,
      };

    case "SET_HYDRATED":
      return {
        ...state,
        isHydrated: true,
      };

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("zuasoko-cart");
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: "LOAD_CART", payload: cartItems });
        } catch (error) {
          console.error("Error loading cart from localStorage:", error);
          dispatch({ type: "SET_HYDRATED" });
        }
      } else {
        dispatch({ type: "SET_HYDRATED" });
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("zuasoko-cart", JSON.stringify(state.items));
    }
  }, [state.items]);

  const addItem = (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
        openCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
