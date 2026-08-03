"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { track, saveCartSnapshot, type CartSnapshotItem } from "@/lib/track";
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

/** Cart prices are stored as display strings ("1250 EGP"), not numbers. */
function parsePrice(price: string | number): number {
  if (typeof price === "number") return price;
  return parseFloat(String(price).replace(/[^\d.]/g, "")) || 0;
}

function toSnapshotItems(items: CartItem[]): CartSnapshotItem[] {
  return items.map((item) => ({
    productId: item.productId,
    name: item.name,
    color: item.colorName,
    colorId: item.colorId,
    sizeId: item.sizeId,
    sizeName: item.sizeName,
    quantity: item.quantity,
    price: parsePrice(item.price),
    image: item.image,
  }));
}

const SNAPSHOT_DEBOUNCE_MS = 3000;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<LocalCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lets removeFromCart read the current items without taking `cart` as a
  // dependency, which would change the callback identity on every cart edit.
  const cartRef = useRef<LocalCart | null>(null);
  cartRef.current = cart;

  // Active promotions for BOGO and free-shipping auto-apply
  const { data: activePromotions = [] } = useActivePromotions();

  // ── Abandoned cart snapshot ──────────────────────────────────────────────
  // The cart only ever existed in localStorage, so an abandoned one was
  // invisible. Mirroring it server-side is what makes recovery possible at all.
  // Debounced because quantity steppers fire in bursts.
  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSnapshot = useRef(false);
  useEffect(() => {
    if (isLoading || !cart) return;

    // Don't create a row for every visitor who never added anything. Once a
    // cart has existed we keep reporting it, including when it drops back to
    // empty — that emptying is itself worth seeing.
    if (cart.items.length === 0 && !hasSnapshot.current) return;
    hasSnapshot.current = true;

    if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => {
      saveCartSnapshot({
        items: toSnapshotItems(cart.items),
        subtotal: cart.subtotal,
        promoCodeTried: cart.discountCode,
        stage: "cart",
      });
    }, SNAPSHOT_DEBOUNCE_MS);

    return () => {
      if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    };
  }, [cart, isLoading]);

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

        // Tracked here rather than in the product page so every entry point —
        // product detail, related products, anywhere else — is counted once.
        track("add_to_cart", {
          productId: product.productId,
          productName: product.name,
          colorName: product.colorName,
          quantity: quantityToAdd,
          value: parsePrice(product.price) * quantityToAdd,
        });
        // Dispatch event after a short delay so CartButton animates
        // AFTER the Add to Cart button has visually changed to "Added"
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("cart-item-added"));
          }, 400);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    try {
      // Read the item before it's gone — a removal is a price signal, and the
      // report needs to know which product it was.
      const removed = cartRef.current?.items.find((i) => i.id === itemId);

      const updatedCart = removeFromLocalCart(itemId);
      setCart(updatedCart);

      if (removed) {
        track("remove_from_cart", {
          productId: removed.productId,
          productName: removed.name,
          colorName: removed.colorName,
          quantity: removed.quantity,
          value: parsePrice(removed.price) * removed.quantity,
        });
      }
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
