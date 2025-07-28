import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { apiService } from "../services/api";

export interface CartItem {
  id: string;
  productId: number;
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

          // Validate product ID - now expecting real integer IDs
      console.log("🔍 Validating product ID:", newItem.productId, "Type:", typeof newItem.productId);

      // Handle different ID formats
      let productId;
      if (typeof newItem.productId === 'number') {
        productId = newItem.productId;
      } else if (typeof newItem.productId === 'string') {
        productId = parseInt(newItem.productId, 10);
      } else {
        productId = NaN;
      }

      if (!productId || isNaN(productId) || productId <= 0) {
        console.error("❌ Invalid product ID validation failed:", {
          originalId: newItem.productId,
          type: typeof newItem.productId,
          parsedId: productId,
          isNaN: isNaN(productId)
        });
        throw new Error("Invalid product ID");
      }

      // Ensure productId is a number
      const productId = Number(newItem.productId);
      console.log("🛒 Adding to cart - Product ID:", productId, "Type:", typeof productId);

          // Try to fetch latest product data from database
          let product;
          let fetchedFromApi = false;

          try {
            const productData = await apiService.getProduct(String(productId));
            if (productData && productData.product) {
              product = productData.product;
              fetchedFromApi = true;
              console.log("✅ Product data fetched from API successfully");
            }
          } catch (apiError) {
            console.warn("⚠️ Could not fetch product from API, using provided data:", apiError);
          }

          // Fallback to using the provided item data if API fails
          if (!product) {
            product = {
              id: productId,
              name: newItem.name,
              price_per_unit: newItem.pricePerUnit,
              unit: newItem.unit,
              stock_quantity: newItem.maxStock || 999,
              images: newItem.images || [],
              farmer_name: newItem.farmerName,
              farmer_county: newItem.farmerCounty,
              category: newItem.category
            };
            console.log("🔄 Using fallback product data:", product);
          }
          
          // Validate stock availability (skip validation if using fallback data)
          if (fetchedFromApi && product.stock_quantity <= 0) {
            toast.error("Product is out of stock");
            return;
          } else if (!fetchedFromApi) {
            // When using fallback data, show a warning but allow the addition
            console.log("⚠️ Using cached/fallback data - stock validation skipped");
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
              productId: productId,
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

        // Only remove items that are clearly broken (null/undefined IDs)
        const validItems = cart.items.filter(item => {
          const id = item.productId;

          // Only filter out clearly invalid items
          if (!id && id !== 0) {
            console.warn("🧹 Removing cart item with missing ID:", item.name);
            return false;
          }

          return true;
        });

        if (validItems.length !== cart.items.length) {
          console.log(`🧹 Cart cleanup: Removed ${cart.items.length - validItems.length} items with invalid IDs`);
          const totals = calculateTotals(validItems);
          set({ cart: { items: validItems, ...totals } });

          if (cart.items.length > validItems.length) {
            toast.error(`Removed ${cart.items.length - validItems.length} invalid items from cart`);
          }
        }

        await get().validateCartItems();
        const currentCart = get().cart;
        const totals = calculateTotals(currentCart.items);
        set({ cart: { ...currentCart, ...totals } });
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
              const productData = await apiService.getProduct(String(item.productId));
              
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
    isLoading: cartStore.isLoading,
    addToCart: async (product: any, quantity: number) => {
      console.log("🛒 Legacy addToCart called with:", { product, quantity });

      if (!product || !product.id) {
        console.error("❌ Product validation failed:", product);
        toast.error("Invalid product - cannot add to cart");
        return;
      }

      const cartItem = {
        productId: Number(product.id),
        name: product.name || "Unknown Product",
        pricePerUnit: Number(product.price_per_unit || product.pricePerUnit || 0),
        quantity: Math.max(1, Number(quantity) || 1),
        unit: product.unit || "kg",
        images: Array.isArray(product.images) ? product.images : [],
        maxStock: Number(product.stock_quantity || product.stockQuantity || 999),
        farmerName: product.farmer_name || product.farmerName || "Local Farmer",
        farmerCounty: product.farmer_county || product.farmerCounty || "Kenya",
        category: product.category || "General"
      };

      console.log("🛒 Prepared cart item:", cartItem);

      await cartStore.addToCart(cartItem);
    },
    removeFromCart: cartStore.removeFromCart,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    refreshCart: cartStore.refreshCart,
    repairCart: cartStore.validateCartItems,
    nuclearReset: cartStore.clearCart,
  };
};
