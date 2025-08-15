import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  pricePerUnit: number;
  quantity: number;
  images: string[];
  unit: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => void;
}

// Helper function to ensure valid numbers
const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addToCart: (product, quantity) => {
        const state = get();
        const safeQuantity = safeNumber(quantity);
        // Handle both price naming conventions
        const safePrice = safeNumber(product.pricePerUnit || product.price_per_unit);

        if (safeQuantity <= 0) return;

        const existingItem = state.items.find(
          (item) => item.productId === product.id,
        );

        if (existingItem) {
          // Update existing item
          const updatedItems = state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: safeNumber(item.quantity) + safeQuantity }
              : item,
          );
          const totalItems = updatedItems.reduce(
            (sum, item) => sum + safeNumber(item.quantity),
            0,
          );
          const totalAmount = updatedItems.reduce(
            (sum, item) =>
              sum + safeNumber(item.pricePerUnit) * safeNumber(item.quantity),
            0,
          );

          set({
            items: updatedItems,
            totalItems,
            totalAmount,
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id || `product-${Date.now()}`,
            name: product.name || "Unknown Product",
            pricePerUnit: safePrice,
            quantity: safeQuantity,
            images: Array.isArray(product.images) ? product.images : [],
            unit: product.unit || "kg",
          };

          const updatedItems = [...state.items, newItem];
          const totalItems = updatedItems.reduce(
            (sum, item) => sum + safeNumber(item.quantity),
            0,
          );
          const totalAmount = updatedItems.reduce(
            (sum, item) =>
              sum + safeNumber(item.pricePerUnit) * safeNumber(item.quantity),
            0,
          );

          set({
            items: updatedItems,
            totalItems,
            totalAmount,
          });
        }
      },

      removeFromCart: (itemId) => {
        const state = get();
        const updatedItems = state.items.filter((item) => item.id !== itemId);
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + safeNumber(item.quantity),
          0,
        );
        const totalAmount = updatedItems.reduce(
          (sum, item) =>
            sum + safeNumber(item.pricePerUnit) * safeNumber(item.quantity),
          0,
        );

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      updateQuantity: (itemId, quantity) => {
        const state = get();
        const safeQuantity = safeNumber(quantity);

        if (safeQuantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        const updatedItems = state.items.map((item) =>
          item.id === itemId ? { ...item, quantity: safeQuantity } : item,
        );
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + safeNumber(item.quantity),
          0,
        );
        const totalAmount = updatedItems.reduce(
          (sum, item) =>
            sum + safeNumber(item.pricePerUnit) * safeNumber(item.quantity),
          0,
        );

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });
      },

      refreshCart: () => {
        const state = get();

        // Check if there are any items with invalid prices
        const invalidItems = state.items.filter(item => safeNumber(item.pricePerUnit) <= 0);

        let itemsToUse = state.items;

        // Only filter if there are actually invalid items to avoid unnecessary array recreation
        if (invalidItems.length > 0) {
          console.warn("🛒 Removing cart items with invalid prices:", invalidItems.length);
          itemsToUse = state.items.filter(item => safeNumber(item.pricePerUnit) > 0);
        }

        const totalItems = itemsToUse.reduce(
          (sum, item) => sum + safeNumber(item.quantity),
          0,
        );
        const totalAmount = itemsToUse.reduce(
          (sum, item) =>
            sum + safeNumber(item.pricePerUnit) * safeNumber(item.quantity),
          0,
        );

        // Only update state if something actually changed
        if (
          itemsToUse.length !== state.items.length ||
          totalItems !== state.totalItems ||
          totalAmount !== state.totalAmount
        ) {
          set({
            items: itemsToUse,
            totalItems,
            totalAmount,
          });
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount,
      }),
    },
  ),
);

// Create a compatibility object for components expecting the old cart structure
export const useCart = () => {
  const cartStore = useCartStore();

  return {
    cart: {
      items: cartStore.items,
      totalItems: cartStore.totalItems,
      totalAmount: cartStore.totalAmount,
    },
    addToCart: cartStore.addToCart,
    removeFromCart: cartStore.removeFromCart,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    refreshCart: cartStore.refreshCart,
    isLoading: false, // For compatibility
  };
};
