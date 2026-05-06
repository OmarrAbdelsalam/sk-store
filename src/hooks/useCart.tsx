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
  applyBogoToCart,
  removeBogoFromCart,
  applyFreeShippingToCart,
  removeFreeShippingFromCart,
  type CartItem,
  type LocalCart,
  type AppliedPromotion,
} from "@/lib/localStorage";
import { useActivePromotions } from "@/hooks/usePromotions";

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Omit<CartItem, "quantity" | "id">, quantityToAdd?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  refreshCart: () => Promise<void>;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
  discountCode?: string;
  discountAmount: number;
  bogoDiscount: number;
  freeShippingApplied: boolean;
  appliedPromotions: AppliedPromotion[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<LocalCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active promotions for BOGO and free-shipping auto-apply
  const { data: activePromotions = [] } = useActivePromotions();

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const localCart = getLocalCart();
        setCart(localCart);
      } catch (error) {
        console.error("Error loading cart:", error);
        const emptyCart: LocalCart = {
          id: "error-cart",
          sessionId: "error-session",
          items: [],
          subtotal: 0,
          discountAmount: 0,
          bogoDiscount: 0,
          freeShippingApplied: false,
          appliedPromotions: [],
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

  // ── BOGO auto-apply ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!cart?.items || activePromotions.length === 0) return;

    const bogoPromotions = activePromotions
      .filter((p) => p.promo_type === "buy_x_get_y_free")
      .sort((a, b) => b.priority - a.priority); // highest priority first

    let applied = false;

    for (const promo of bogoPromotions) {
      if (!promo.product_ids) continue;

      let eligibleProductIds: string[] = [];
      try {
        eligibleProductIds = JSON.parse(promo.product_ids);
      } catch {
        continue;
      }

      const eligibleItems = cart.items.filter((item) =>
        eligibleProductIds.includes(item.productId)
      );

      if (eligibleItems.length >= 2) {
        // Find cheapest eligible item by unit price
        const cheapest = eligibleItems.reduce((min, item) => {
          const price = parseFloat(String(item.price).replace(/[^\d.]/g, "")) || 0;
          const minPrice = parseFloat(String(min.price).replace(/[^\d.]/g, "")) || 0;
          return price < minPrice ? item : min;
        });

        const cheapestPrice =
          parseFloat(String(cheapest.price).replace(/[^\d.]/g, "")) || 0;

        const updatedCart = applyBogoToCart(promo.id, cheapestPrice, promo.name_en);
        setCart(updatedCart);
        applied = true;
        break; // only one BOGO at a time
      }
    }

    if (!applied && cart.bogoDiscount > 0) {
      const updatedCart = removeBogoFromCart();
      setCart(updatedCart);
    }
  }, [cart?.items, activePromotions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Free Shipping auto-apply ─────────────────────────────────────────────
  useEffect(() => {
    if (!cart) return;

    const freeShippingPromo = activePromotions.find(
      (p) => p.promo_type === "free_shipping_min_amount"
    );

    if (!freeShippingPromo) {
      if (cart.freeShippingApplied) {
        const updatedCart = removeFreeShippingFromCart();
        setCart(updatedCart);
      }
      return;
    }

    const threshold = freeShippingPromo.min_amount ?? 0;

    if (cart.subtotal >= threshold && !cart.freeShippingApplied) {
      const updatedCart = applyFreeShippingToCart(
        freeShippingPromo.id,
        freeShippingPromo.name_en,
        0 // shipping amount saved — will be calculated at checkout
      );
      setCart(updatedCart);
    } else if (cart.subtotal < threshold && cart.freeShippingApplied) {
      const updatedCart = removeFreeShippingFromCart();
      setCart(updatedCart);
    }
  }, [cart?.subtotal, activePromotions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cart actions ─────────────────────────────────────────────────────────

  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity" | "id">, quantityToAdd = 1) => {
      try {
        const updatedCart = addToLocalCart({ ...product, quantity: quantityToAdd }, quantityToAdd);
        setCart(updatedCart);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    try {
      const updatedCart = removeFromLocalCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  }, []);

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      try {
        const updatedCart = updateCartItemQuantity(itemId, quantity);
        setCart(updatedCart);
        return true;
      } catch (error) {
        console.error("Error updating quantity:", error);
        return false;
      }
    },
    []
  );

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

  const getSubtotal = useCallback(() => {
    return cart?.subtotal || 0;
  }, [cart]);

  const contextValue = useMemo(
    () => ({
      items: cart?.items || [],
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getSubtotal,
      refreshCart,
      applyDiscount,
      removeDiscount,
      discountCode: cart?.discountCode,
      discountAmount: cart?.discountAmount || 0,
      bogoDiscount: cart?.bogoDiscount || 0,
      freeShippingApplied: cart?.freeShippingApplied || false,
      appliedPromotions: cart?.appliedPromotions || [],
    }),
    [
      cart,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getSubtotal,
      refreshCart,
      applyDiscount,
      removeDiscount,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
