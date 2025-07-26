import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { apiService } from "../services/api";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  images: string[];
  maxStock?: number;
  farmerName?: string;
  farmerCounty?: string;
  category?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartStore {
  cart: Cart;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  validateCartItems: () => Promise<void>;
}

const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

const calculateTotals = (items: CartItem[]): Pick<Cart, "totalItems" | "totalAmount"> => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.pricePerUnit || 0) * item.quantity,
    0,
  );
  return { totalItems, totalAmount };
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: initialCart,
      isLoading: false,

      addToCart: async (newItem) => {
        try {
          set({ isLoading: true });

          // Validate product ID
          if (!newItem.productId || newItem.productId === 'undefined' || newItem.productId === 'null') {
            throw new Error("Invalid product ID");
          }

          console.log("🛒 Adding to cart - Product ID:", newItem.productId, "Type:", typeof newItem.productId);

          // Fetch latest product data from database to ensure accuracy
          const productData = await apiService.getProduct(newItem.productId);

          if (!productData || !productData.product) {
            throw new Error("Product not found in database");
          }

          const product = productData.product;
          
          // Validate stock availability
          if (product.stock_quantity <= 0) {
            toast.error("Product is out of stock");
            return;
          }

          const { cart } = get();
          const existingItemIndex = cart.items.findIndex(
            (item) => item.productId === newItem.productId,
          );

          let updatedItems: CartItem[];

          if (existingItemIndex >= 0) {
            // Update existing item with fresh product data
            const existingItem = cart.items[existingItemIndex];
            const newQuantity = Math.min(
              existingItem.quantity + newItem.quantity,
              product.stock_quantity
            );
            
            if (newQuantity > product.stock_quantity) {
              toast.error(`Only ${product.stock_quantity} items available in stock`);
            }

            updatedItems = cart.items.map((item, index) =>
              index === existingItemIndex
                ? {
                    ...item,
                    quantity: newQuantity,
                    pricePerUnit: product.price_per_unit,
                    name: product.name,
                    unit: product.unit,
                    category: product.category,
                    maxStock: product.stock_quantity,
                    images: product.images || []
                  }
                : item,
            );
          } else {
            // Add new item with fresh product data
            const cartItem: CartItem = {
              id: `cart-${Date.now()}-${Math.random()}`,
              productId: newItem.productId,
              name: product.name,
              pricePerUnit: product.price_per_unit,
              quantity: Math.min(newItem.quantity, product.stock_quantity),
              unit: product.unit,
              category: product.category,
              maxStock: product.stock_quantity,
              images: product.images || [],
              farmerName: product.farmer_name || "Local Farmer",
              farmerCounty: product.farmer_county || "Kenya"
            };
            updatedItems = [...cart.items, cartItem];
          }

          const totals = calculateTotals(updatedItems);
          const updatedCart = {
            items: updatedItems,
            ...totals,
          };

          set({ cart: updatedCart });
          toast.success("Item added to cart!");
        } catch (error: any) {
          console.error("Error adding to cart:", error);
          console.log("Full error object:", {
            message: error.message,
            response: error.response,
            status: error.response?.status,
            data: error.response?.data,
            productId: newItem.productId
          });

          let userMessage = "Failed to add item to cart";

          if (error.response?.status === 400) {
            userMessage = "Invalid product - this item may no longer be available";
          } else if (error.response?.status === 404) {
            userMessage = "Product not found - this item may have been removed";
          } else if (error.message === "Invalid product ID") {
            userMessage = "Cannot add item - invalid product information";
          } else if (error.message === "Product not found in database") {
            userMessage = "Product no longer available in our inventory";
          } else if (error.message) {
            userMessage = error.message;
          }

          toast.error(userMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: (itemId) => {
        const { cart } = get();
        const updatedItems = cart.items.filter((item) => item.id !== itemId);
        const totals = calculateTotals(updatedItems);
        const updatedCart = {
          items: updatedItems,
          ...totals,
        };

        set({ cart: updatedCart });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 0) return;

        const { cart } = get();
        let updatedItems: CartItem[];

        if (quantity === 0) {
          updatedItems = cart.items.filter((item) => item.id !== itemId);
        } else {
          updatedItems = cart.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.min(quantity, item.maxStock || 999) }
              : item,
          );
        }

        const totals = calculateTotals(updatedItems);
        const updatedCart = {
          items: updatedItems,
          ...totals,
        };

        set({ cart: updatedCart });
      },

      clearCart: async () => {
        set({ cart: initialCart });
        toast.success("Cart cleared!");
      },

      refreshCart: async () => {
        const { cart } = get();
        await get().validateCartItems();
        const totals = calculateTotals(cart.items);
        set({ cart: { ...cart, ...totals } });
      },

      validateCartItems: async () => {
        try {
          set({ isLoading: true });
          const { cart } = get();
          
          if (cart.items.length === 0) return;

          const updatedItems: CartItem[] = [];
          let hasChanges = false;

          for (const item of cart.items) {
            try {
              // Fetch latest product data
              const productData = await apiService.getProduct(item.productId);
              
              if (productData && productData.product) {
                const product = productData.product;
                
                // Update item with latest data
                const updatedItem: CartItem = {
                  ...item,
                  name: product.name,
                  pricePerUnit: product.price_per_unit,
                  unit: product.unit,
                  category: product.category,
                  maxStock: product.stock_quantity,
                  images: product.images || [],
                  farmerName: product.farmer_name || item.farmerName,
                  farmerCounty: product.farmer_county || item.farmerCounty,
                  // Adjust quantity if it exceeds available stock
                  quantity: Math.min(item.quantity, product.stock_quantity)
                };

                // Check if anything changed
                if (
                  item.pricePerUnit !== product.price_per_unit ||
                  item.quantity > product.stock_quantity ||
                  item.name !== product.name
                ) {
                  hasChanges = true;
                }

                updatedItems.push(updatedItem);
              } else {
                // Product no longer exists
                hasChanges = true;
                console.log(`Product ${item.productId} no longer available`);
              }
            } catch (error) {
              // Keep original item if we can't fetch data
              console.error(`Error validating item ${item.productId}:`, error);
              updatedItems.push(item);
            }
          }

          if (hasChanges) {
            const totals = calculateTotals(updatedItems);
            const updatedCart = {
              items: updatedItems,
              ...totals,
            };
            set({ cart: updatedCart });
            
            const removedCount = cart.items.length - updatedItems.length;
            if (removedCount > 0) {
              toast.error(`${removedCount} unavailable item(s) removed from cart`);
            }
          }
        } catch (error) {
          console.error("Error validating cart items:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);

// Legacy compatibility for components using old cart structure
export const useCartStore = () => {
  const cartStore = useCart();
  
  return {
    items: cartStore.cart.items,
    totalItems: cartStore.cart.totalItems,
    totalAmount: cartStore.cart.totalAmount,
    addToCart: async (product: any, quantity: number) => {
      await cartStore.addToCart({
        productId: String(product.id),
        name: product.name,
        pricePerUnit: product.price_per_unit || product.pricePerUnit,
        quantity,
        unit: product.unit,
        images: product.images || [],
        maxStock: product.stock_quantity,
        farmerName: product.farmer_name,
        farmerCounty: product.farmer_county,
        category: product.category
      });
    },
    removeFromCart: cartStore.removeFromCart,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    refreshCart: cartStore.refreshCart,
    repairCart: cartStore.validateCartItems,
    nuclearReset: cartStore.clearCart,
  };
};
