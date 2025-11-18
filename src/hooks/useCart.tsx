"use client"
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mediscrub_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load from localStorage on initial render only
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  const { toast } = useToast();

  // Debounced save to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }, 300); // Debounce 300ms
    
    return () => clearTimeout(timeoutId);
  }, [items]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        setTimeout(() => {
          toast({
            title: "تم تحديث السلة",
            description: `تم زيادة كمية ${product.name}`,
            duration: 2000,
          });
        }, 0);
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        setTimeout(() => {
          toast({
            title: "تم إضافة المنتج",
            description: `تم إضافة ${product.name} إلى السلة`,
            duration: 2000,
          });
        }, 0);
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }, [toast]);

  const removeFromCart = useCallback((id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
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

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice]);

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