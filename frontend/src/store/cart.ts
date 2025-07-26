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
  repairCart: () => void;
  nuclearReset: () => void;
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
        console.log("🛒 addToCart called with:", { product, quantity });
        const state = get();
        const safeQuantity = safeNumber(quantity);
        // Handle both pricePerUnit and price_per_unit field names
        const priceValue = product.pricePerUnit || product.price_per_unit || 0;
        const safePrice = safeNumber(priceValue);

        console.log("🛒 Processed values:", {
          safeQuantity,
          safePrice,
          priceValue,
          productPrice: product.pricePerUnit,
          productPriceAlt: product.price_per_unit
        });

        if (safePrice <= 0) {
          console.error("🛒 ERROR: Product price is 0 or invalid!", { product, priceValue, safePrice });
          return;
        }

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
            productId: String(product.id || `product-${Date.now()}`),
            name: product.name || "Unknown Product",
            pricePerUnit: safePrice,
            quantity: safeQuantity,
            images: Array.isArray(product.images) ? product.images : [],
            unit: product.unit || "kg",
          };

          console.log("🛒 Adding new cart item:", newItem);

          const updatedItems = [...state.items, newItem];
          const totalItems = updatedItems.reduce(
            (sum, item) => sum + safeNumber(item.quantity),
            0,
          );
          const totalAmount = updatedItems.reduce(
            (sum, item) => {
              const itemTotal = safeNumber(item.pricePerUnit) * safeNumber(item.quantity);
              return sum + itemTotal;
            },
            0,
          );

          console.log("🛒 Cart updated - Total items:", totalItems, "Total amount:", totalAmount);

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
        // Clear localStorage to ensure complete reset
        try {
          localStorage.removeItem('cart-storage');
        } catch (e) {
          console.warn("Could not clear cart storage:", e);
        }

        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });

        console.log("🛒 Cart completely cleared and storage reset");
      },

      refreshCart: () => {
        const state = get();
        console.log("🛒 refreshCart - Current items:", state.items);

        // Auto-remove zero price items during refresh
        const validItems = state.items.filter(item => {
          const hasValidPrice = item.pricePerUnit && item.pricePerUnit > 0;
          if (!hasValidPrice) {
            console.warn("🛒 refreshCart - Auto-removing zero price item:", item);
            return false;
          }
          return true;
        });

        const totalItems = validItems.reduce(
          (sum, item) => sum + safeNumber(item.quantity),
          0,
        );
        const totalAmount = validItems.reduce(
          (sum, item) => {
            const itemPrice = safeNumber(item.pricePerUnit);
            const itemQuantity = safeNumber(item.quantity);
            const itemTotal = itemPrice * itemQuantity;
            console.log("🛒 refreshCart item:", {
              name: item.name,
              price: itemPrice,
              quantity: itemQuantity,
              total: itemTotal
            });
            return sum + itemTotal;
          },
          0,
        );

        console.log("🛒 refreshCart - Calculated totals:", {
          originalItems: state.items.length,
          validItems: validItems.length,
          totalItems,
          totalAmount
        });

        set({
          items: validItems,
          totalItems,
          totalAmount,
        });
      },

      repairCart: () => {
        const state = get();
        console.log("🛒 repairCart - Checking cart items:", state.items);

        // Remove items with invalid prices or quantities
        const validItems = state.items.filter(item => {
          const hasValidPrice = item.pricePerUnit && Number(item.pricePerUnit) > 0;
          const hasValidQuantity = item.quantity && Number(item.quantity) > 0;
          const hasValidName = item.name && item.name.trim().length > 0;

          const isValid = hasValidPrice && hasValidQuantity && hasValidName;

          if (!isValid) {
            console.warn("🛒 repairCart - Removing invalid item:", {
              item,
              hasValidPrice,
              hasValidQuantity,
              hasValidName,
              priceValue: item.pricePerUnit,
              quantityValue: item.quantity
            });
            return false;
          }
          return true;
        });

        // Recalculate totals
        const totalItems = validItems.reduce(
          (sum, item) => sum + safeNumber(item.quantity),
          0,
        );
        const totalAmount = validItems.reduce(
          (sum, item) => sum + safeNumber(item.pricePerUnit) * safeNumber(item.quantity),
          0,
        );

        console.log("🛒 repairCart - Repaired cart:", {
          originalItems: state.items.length,
          validItems: validItems.length,
          totalItems,
          totalAmount
        });

        set({
          items: validItems,
          totalItems,
          totalAmount,
        });
      },

      nuclearReset: () => {
        console.log("🛒 NUCLEAR RESET - Completely destroying cart data");

        // Clear all possible storage keys
        try {
          localStorage.removeItem('cart-storage');
          localStorage.removeItem('cart');
          localStorage.removeItem('zustand-cart');
          sessionStorage.removeItem('cart-storage');
          sessionStorage.removeItem('cart');
        } catch (e) {
          console.warn("Storage clear error:", e);
        }

        // Reset state completely
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });

        console.log("🛒 NUCLEAR RESET - Complete. Cart should be empty.");
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
    repairCart: cartStore.repairCart,
    nuclearReset: cartStore.nuclearReset,
    isLoading: false, // For compatibility
  };
};
