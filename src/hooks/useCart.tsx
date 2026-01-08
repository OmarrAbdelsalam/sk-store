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
import { getOrCreateSessionId } from "@/lib/session";
import {
  getCart,
  deleteItem,
  updateItemQuantity,
  clearCart as clearCartAPI,
} from "@/lib/api/cart";

interface CartItem {
  id: number; // productId
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: string;
  image: string;
  quantity: number;
  itemId: number; // cartItemId from server
  colorId?: number;
  colorName?: string;
  colorNameAr?: string;
  colorNameEn?: string;
  sizeId?: number;
  sizeName?: string;
  availableStock?: number; // الكمية المتاحة في المخزون
  isMaxStock?: boolean; // هل وصل للحد الأقصى
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Omit<CartItem, "quantity" | "itemId">, quantityToAdd?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from server on mount
  const loadCartFromServer = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const cartData = await getCart(sessionId);

      if (cartData && cartData.items) {
        const formattedItems: CartItem[] = cartData.items.map((item: any) => {
          let selectedImage = "";

          // Priority 1: Find photo for selected color (using colorEn/colorAr from API)
          if (item.colorNameEn && item.photos) {
            // Try to find main photo for selected color
            const colorMainPhoto = item.photos.find(
              (p: any) =>
                (p.colorEn === item.colorNameEn || p.colorAr === item.colorNameAr) && p.isMain
            );

            if (colorMainPhoto) {
              selectedImage = colorMainPhoto.imageUrl;
            } else {
              // Try to find any photo for selected color
              const colorPhoto = item.photos.find(
                (p: any) => p.colorEn === item.colorNameEn || p.colorAr === item.colorNameAr
              );
              if (colorPhoto) {
                selectedImage = colorPhoto.imageUrl;
              }
            }
          }

          // Priority 2: If no color-specific photo, use main photo
          if (!selectedImage && item.photos) {
            const mainPhoto = item.photos.find((p: any) => p.isMain);
            selectedImage = mainPhoto?.imageUrl || item.photos[0]?.imageUrl || "";
          }

          return {
            id: item.productId,
            itemId: item.cartItemId,
            name: item.productNameEn || item.productNameAr || "",
            nameAr: item.productNameAr || "",
            nameEn: item.productNameEn || "",
            price: `${item.unitPrice} EGP`,
            image: selectedImage,
            quantity: item.quantity,
            colorId: item.colorId,
            colorName: item.colorNameEn || item.colorNameAr,
            colorNameAr: item.colorNameAr,
            colorNameEn: item.colorNameEn,
            sizeId: item.sizeId,
            sizeName: item.sizeName,
            availableStock: item.availableStock ?? item.stock ?? item.availableQuantity,
          };
        });

        setItems(formattedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error loading cart from server:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartFromServer();
  }, [loadCartFromServer]);

  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity" | "itemId">, quantityToAdd: number = 1) => {
      // This is called after API add, just refresh cart from server
      loadCartFromServer();
    },
    [loadCartFromServer]
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      try {
        const sessionId = getOrCreateSessionId();

        // Remove from server first
        await deleteItem({ sessionId, itemId });
        console.log("Item removed from server cart");

        // Refresh cart from server
        await loadCartFromServer();
      } catch (error) {
        console.error("Failed to remove item from server:", error);
      }
    },
    [loadCartFromServer]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number): Promise<boolean> => {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return true;
      }

      // الحصول على الـ item الحالي
      const currentItem = items.find((item) => item.itemId === itemId);
      if (!currentItem) return false;

      const maxStock = currentItem.availableStock;

      // لو عندنا الـ stock ومحاول يزود أكتر منه، نوقف فوراً
      if (maxStock !== undefined && quantity > maxStock) {
        setItems((prev) =>
          prev.map((item) =>
            item.itemId === itemId ? { ...item, quantity: maxStock, isMaxStock: true } : item
          )
        );
        return false;
      }

      // حفظ الكمية القديمة للـ rollback
      const previousQuantity = currentItem.quantity;

      // Optimistic Update - نحدث الـ UI فوراً
      setItems((prev) =>
        prev.map((item) =>
          item.itemId === itemId ? { ...item, quantity, isMaxStock: false } : item
        )
      );

      try {
        const sessionId = getOrCreateSessionId();

        // API call في الخلفية
        const result = await updateItemQuantity({ sessionId, itemId, quantity });

        if (!result.success) {
          // لو فشل بسبب المخزون
          if (result.stockError) {
            // لو السيرفر رجع الكمية المتاحة، نستخدمها
            if (result.availableQuantity !== undefined) {
              setItems((prev) =>
                prev.map((item) =>
                  item.itemId === itemId
                    ? {
                        ...item,
                        quantity: result.availableQuantity!,
                        isMaxStock: true,
                        availableStock: result.availableQuantity,
                      }
                    : item
                )
              );
            } else {
              // نرجع للكمية القديمة ونعلم إنه وصل للحد الأقصى
              setItems((prev) =>
                prev.map((item) =>
                  item.itemId === itemId
                    ? {
                        ...item,
                        quantity: previousQuantity,
                        isMaxStock: true,
                        availableStock: previousQuantity,
                      }
                    : item
                )
              );
            }
          } else {
            // Rollback لو فشل لسبب تاني
            setItems((prev) =>
              prev.map((item) =>
                item.itemId === itemId ? { ...item, quantity: previousQuantity } : item
              )
            );
          }
          return false;
        }

        // لو نجح ووصل للـ stock، نعلمه
        if (maxStock !== undefined && quantity >= maxStock) {
          setItems((prev) =>
            prev.map((item) =>
              item.itemId === itemId ? { ...item, isMaxStock: true } : item
            )
          );
        }

        return true;
      } catch (error) {
        // Rollback لو حصل error
        setItems((prev) =>
          prev.map((item) =>
            item.itemId === itemId ? { ...item, quantity: previousQuantity } : item
          )
        );
        console.error("Failed to update quantity on server:", error);
        return false;
      }
    },
    [items, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();

      // Clear from server first
      await clearCartAPI(sessionId);
      console.log("Cart cleared from server");

      // Clear local state
      setItems([]);
    } catch (error) {
      console.error("Failed to clear cart from server:", error);
      // Clear local state anyway
      setItems([]);
    }
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => {
      if (!item.price) return total;
      const price = parseFloat(String(item.price).replace(/[^\d.]/g, ""));
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  }, [items]);

  const refreshCart = useCallback(async () => {
    await loadCartFromServer();
  }, [loadCartFromServer]);

  const value = useMemo(
    () => ({
      items,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      refreshCart,
    }),
    [
      items,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      refreshCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};