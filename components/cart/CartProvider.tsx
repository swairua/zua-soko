"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (produceId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  customerId,
}: {
  children: ReactNode;
  customerId?: string;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart?customerId=${customerId}`);
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (produceId: string, quantity: number) => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          produceId,
          quantity,
        }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await refreshCart();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await refreshCart();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    try {
      setIsLoading(true);
      const deletePromises = cart.items.map((item) =>
        fetch(`/api/cart/${item.id}`, { method: "DELETE" }),
      );
      await Promise.all(deletePromises);
      await refreshCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      refreshCart();
    }
  }, [customerId]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
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
