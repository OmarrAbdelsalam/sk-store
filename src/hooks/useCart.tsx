"use client"
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { getOrCreateSessionId } from "@/lib/session";
import { getCart, deleteItem, updateItemQuantity, clearCart as clearCartAPI } from "@/lib/api/cart";

interface CartItem {
  id: number; // productId
  name: string;
  price: string;
  image: string;
  quantity: number;
  itemId: number; // cartItemId from server
  colorId?: number;
  colorName?: string;
  sizeId?: number;
  sizeName?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity' | 'itemId'>, quantityToAdd?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load cart from server on mount
  const loadCartFromServer = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const cartData = await getCart(sessionId);
      
      if (cartData && cartData.items) {
        // Fetch product details for each item to get correct color photos
        const formattedItemsPromises = cartData.items.map(async (item: any) => {
          let selectedImage = '';
          
          // Try to get product details to find color-specific photo
          try {
            const productRes = await fetch(`https://scrubstore.runasp.net/api/Product/${item.productId}`);
            if (productRes.ok) {
              const productData = await productRes.json();
              const photos = productData.data?.photos || [];
              
              if (item.colorId && photos.length > 0) {
                // Find main photo for selected color
                const colorMainPhoto = photos.find((p: any) => 
                  p.colorId === item.colorId && p.isMain
                );
                
                if (colorMainPhoto) {
                  selectedImage = colorMainPhoto.imageUrl;
                } else {
                  // Find any photo for selected color
                  const colorPhoto = photos.find((p: any) => 
                    p.colorId === item.colorId
                  );
                  if (colorPhoto) {
                    selectedImage = colorPhoto.imageUrl;
                  }
                }
              }
            }
          } catch (error) {
            console.warn('Failed to fetch product details for color photo:', error);
          }
          
          // Fallback: use photos from cart API
          if (!selectedImage && item.photos) {
            const mainPhoto = item.photos.find((p: any) => p.isMain);
            selectedImage = mainPhoto?.imageUrl || item.photos[0]?.imageUrl || '';
          }
          
          return {
            id: item.productId,
            itemId: item.cartItemId,
            name: item.productNameEn || item.productNameAr || '',
            price: `${item.unitPrice} EGP`,
            image: selectedImage,
            quantity: item.quantity,
            colorId: item.colorId,
            colorName: item.colorNameEn || item.colorNameAr,
            sizeId: item.sizeId,
            sizeName: item.sizeName,
          };
        });
        
        const formattedItems = await Promise.all(formattedItemsPromises);
        setItems(formattedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartFromServer();
  }, [loadCartFromServer]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity' | 'itemId'>, quantityToAdd: number = 1) => {
    // This is called after API add, just refresh cart from server
    loadCartFromServer();
    
    setTimeout(() => {
      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة ${product.name} إلى السلة`,
        duration: 2000,
      });
    }, 0);
  }, [loadCartFromServer, toast]);

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      const sessionId = getOrCreateSessionId();
      
      // Remove from server first
      await deleteItem({ sessionId, itemId });
      console.log('Item removed from server cart');
      
      // Refresh cart from server
      await loadCartFromServer();
      
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج من السلة",
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to remove item from server:', error);
      toast({
        title: "فشل الحذف",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    }
  }, [loadCartFromServer, toast]);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      const sessionId = getOrCreateSessionId();
      
      // Update on server first
      await updateItemQuantity({ sessionId, itemId, quantity });
      console.log('Quantity updated on server');
      
      // Refresh cart from server
      await loadCartFromServer();
    } catch (error) {
      console.error('Failed to update quantity on server:', error);
      toast({
        title: "فشل التحديث",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    }
  }, [loadCartFromServer, removeFromCart, toast]);

  const clearCart = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      
      // Clear from server first
      await clearCartAPI(sessionId);
      console.log('Cart cleared from server');
      
      // Clear local state
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart from server:', error);
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
      const price = parseFloat(String(item.price).replace(/[^\d.]/g, ''));
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  }, [items]);

  const refreshCart = useCallback(async () => {
    await loadCartFromServer();
  }, [loadCartFromServer]);

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    refreshCart
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice, refreshCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};