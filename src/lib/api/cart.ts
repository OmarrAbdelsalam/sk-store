// Cart API utilities for frontend-only store using localStorage
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

// Get cart for session
export const getCart = async (sessionId: string): Promise<LocalCart> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return getLocalCart();
};

// Add item to cart
export const addItem = async (item: Omit<CartItem, 'id'>, quantity = 1): Promise<LocalCart> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));
  return addToLocalCart(item, quantity);
};

// Add to cart (alias for addItem)
export const addToCart = addItem;

// Update item quantity
export const updateItemQuantity = async (itemId: string, quantity: number): Promise<LocalCart> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return updateCartItemQuantity(itemId, quantity);
};

// Delete item from cart
export const deleteItem = async (itemId: string): Promise<LocalCart> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return removeFromLocalCart(itemId);
};

// Clear entire cart
export const clearCart = async (): Promise<LocalCart> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return clearLocalCart();
};

// Apply discount code
export const applyDiscount = async (code: string): Promise<{ success: boolean; discountAmount?: number; message?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock discount validation
  const mockDiscounts: Record<string, number> = {
    'SAVE10': 10,
    'SAVE20': 20,
    'WELCOME': 15,
    'FIRST': 25,
  };
  
  const discountAmount = mockDiscounts[code.toUpperCase()];
  
  if (discountAmount) {
    applyDiscountToCart(code, discountAmount);
    return {
      success: true,
      discountAmount,
      message: `تم تطبيق خصم ${discountAmount}% بنجاح`,
    };
  } else {
    return {
      success: false,
      message: 'كود الخصم غير صحيح',
    };
  }
};

// Remove discount
export const removeDiscount = async (): Promise<LocalCart> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return removeDiscountFromCart();
};

// Get cart items count
export const getCartItemsCount = async (): Promise<number> => {
  const cart = getLocalCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

// Get cart total price
export const getCartTotalPrice = async (): Promise<number> => {
  const cart = getLocalCart();
  return cart.total;
};