"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  getLocalCart,
  addToLocalCart,
  updateCartItemQuantity,
  removeFromLocalCart,
  clearLocalCart,
  applyDiscountToCart,
  removeDiscountFromCart,
  type CartItem,
  type LocalCart,
} from "@/lib/localStorage";

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Omit<CartItem, "quantity" | "id">, quantityToAdd?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  refreshCart: () => Promise<void>;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
  discountCode?: string;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<LocalCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const localCart = getLocalCart();
        setCart(localCart);
      } catch (error) {
        console.error("Error loading cart:", error);
        // Create empty cart on error
        const emptyCart: LocalCart = {
          id: 'error-cart',
          sessionId: 'error-session',
          items: [],
          subtotal: 0,
          discountAmount: 0,
          total: 0,
          updatedAt: new Date().toISOString(),
        };
        setCart(emptyCart);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const addToCart = useCallback((product: Omit<CartItem, "quantity" | "id">, quantityToAdd = 1) => {
    try {
      const updatedCart = addToLocalCart({ ...product, quantity: quantityToAdd }, quantityToAdd);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    try {
      const updatedCart = removeFromLocalCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const updatedCart = updateCartItemQuantity(itemId, quantity);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error("Error updating quantity:", error);
      return false;
    }
  }, []);

  const clearCart = useCallback(() => {
    try {
      const updatedCart = clearLocalCart();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const localCart = getLocalCart();
      setCart(localCart);
    } catch (error) {
      console.error("Error refreshing cart:", error);
    }
  }, []);

  const applyDiscount = useCallback((code: string, amount: number) => {
    try {
      const updatedCart = applyDiscountToCart(code, amount);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error applying discount:", error);
    }
  }, []);

  const removeDiscount = useCallback(() => {
    try {
      const updatedCart = removeDiscountFromCart();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing discount:", error);
    }
  }, []);

  const getTotalItems = useCallback(() => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  }, [cart]);

  const getTotalPrice = useCallback(() => {
    return cart?.total || 0;
  }, [cart]);

  const contextValue = useMemo(() => ({
    items: cart?.items || [],
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refreshCart,
    applyDiscount,
    removeDiscount,
    discountCode: cart?.discountCode,
    discountAmount: cart?.discountAmount || 0,
  }), [
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refreshCart,
    applyDiscount,
    removeDiscount,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
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

