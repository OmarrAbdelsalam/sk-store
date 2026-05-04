// Local Storage Utilities for Frontend-Only Store
// Replaces backend session and cart management

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: string; // Changed from number to string to match UI expectations
  image: string;
  quantity: number;
  colorId?: string;
  colorName?: string;
  colorNameAr?: string;
  colorNameEn?: string;
  sizeId?: string;
  sizeName?: string;
  availableStock?: number;
  isMaxStock?: boolean;
}

export interface LocalCart {
  id: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  updatedAt: string;
}

export interface LocalOrder {
  id: string;
  orderNumber: string;
  sessionId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  shippingInfo: {
    fullName: string;
    email?: string;
    phone: string;
    city: string;
    area: string;
    details?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Session Management
export const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return 'server-session';
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Cart Management
export const getLocalCart = (): LocalCart => {
  if (typeof window === 'undefined') {
    return {
      id: 'default',
      sessionId: 'server-session',
      items: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const sessionId = getOrCreateSessionId();
  const cartData = localStorage.getItem(`cart_${sessionId}`);
  
  if (cartData) {
    try {
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Error parsing cart data:', error);
    }
  }

  // Return empty cart
  const emptyCart: LocalCart = {
    id: `cart_${sessionId}`,
    sessionId,
    items: [],
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    updatedAt: new Date().toISOString(),
  };

  saveLocalCart(emptyCart);
  return emptyCart;
};

export const saveLocalCart = (cart: LocalCart): void => {
  if (typeof window === 'undefined') return;
  
  cart.updatedAt = new Date().toISOString();
  localStorage.setItem(`cart_${cart.sessionId}`, JSON.stringify(cart));
};

export const addToLocalCart = (item: Omit<CartItem, 'id'>, quantity = 1): LocalCart => {
  const cart = getLocalCart();
  
  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    i => i.productId === item.productId && 
         i.colorId === item.colorId && 
         i.sizeId === item.sizeId
  );

  if (existingItemIndex >= 0) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    const newItem: CartItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quantity,
    };
    cart.items.push(newItem);
  }

  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum, item) => {
    const priceStr = item.price || '0';
    const price = parseFloat(String(priceStr).replace(/[^\d.]/g, '')) || 0;
    return sum + (price * item.quantity);
  }, 0);
  cart.total = cart.subtotal - cart.discountAmount;

  saveLocalCart(cart);
  return cart;
};

export const updateCartItemQuantity = (itemId: string, quantity: number): LocalCart => {
  const cart = getLocalCart();
  const itemIndex = cart.items.findIndex(i => i.id === itemId);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => {
      const priceStr = item.price || '0';
      const price = parseFloat(String(priceStr).replace(/[^\d.]/g, '')) || 0;
      return sum + (price * item.quantity);
    }, 0);
    cart.total = cart.subtotal - cart.discountAmount;

    saveLocalCart(cart);
  }

  return cart;
};

export const removeFromLocalCart = (itemId: string): LocalCart => {
  return updateCartItemQuantity(itemId, 0);
};

export const clearLocalCart = (): LocalCart => {
  const cart = getLocalCart();
  cart.items = [];
  cart.subtotal = 0;
  cart.discountAmount = 0;
  cart.discountCode = undefined;
  cart.total = 0;
  
  saveLocalCart(cart);
  return cart;
};

export const applyDiscountToCart = (discountCode: string, discountAmount: number): LocalCart => {
  const cart = getLocalCart();
  cart.discountCode = discountCode;
  cart.discountAmount = discountAmount;
  cart.total = Math.max(0, cart.subtotal - cart.discountAmount);
  
  saveLocalCart(cart);
  return cart;
};

export const removeDiscountFromCart = (): LocalCart => {
  const cart = getLocalCart();
  cart.discountCode = undefined;
  cart.discountAmount = 0;
  cart.total = cart.subtotal;
  
  saveLocalCart(cart);
  return cart;
};

// Order Management
export const getLocalOrders = (): LocalOrder[] => {
  if (typeof window === 'undefined') return [];
  
  const sessionId = getOrCreateSessionId();
  const ordersData = localStorage.getItem(`orders_${sessionId}`);
  
  if (ordersData) {
    try {
      return JSON.parse(ordersData);
    } catch (error) {
      console.error('Error parsing orders data:', error);
    }
  }
  
  return [];
};

export const saveLocalOrder = (order: LocalOrder): void => {
  if (typeof window === 'undefined') return;
  
  const orders = getLocalOrders();
  const existingIndex = orders.findIndex(o => o.id === order.id);
  
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.push(order);
  }
  
  const sessionId = getOrCreateSessionId();
  localStorage.setItem(`orders_${sessionId}`, JSON.stringify(orders));
};

export const createLocalOrder = (shippingInfo: LocalOrder['shippingInfo']): LocalOrder => {
  const cart = getLocalCart();
  const orderNumber = `ORD-${Date.now()}`;
  
  const order: LocalOrder = {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderNumber,
    sessionId: cart.sessionId,
    status: 'pending',
    items: [...cart.items],
    subtotal: cart.subtotal,
    discountAmount: cart.discountAmount,
    shippingCost: 50, // Fixed shipping cost for demo
    total: cart.total + 50,
    shippingInfo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveLocalOrder(order);
  clearLocalCart(); // Clear cart after order
  
  return order;
};

export const getLocalOrderById = (orderId: string): LocalOrder | null => {
  const orders = getLocalOrders();
  return orders.find(o => o.id === orderId) || null;
};

// Reviews Management (stored locally)
export interface LocalReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const getLocalReviews = (productId?: string): LocalReview[] => {
  if (typeof window === 'undefined') return [];
  
  const reviewsData = localStorage.getItem('product_reviews');
  let reviews: LocalReview[] = [];
  
  if (reviewsData) {
    try {
      reviews = JSON.parse(reviewsData);
    } catch (error) {
      console.error('Error parsing reviews data:', error);
    }
  }
  
  if (productId) {
    return reviews.filter(r => r.productId === productId);
  }
  
  return reviews;
};

export const saveLocalReview = (review: Omit<LocalReview, 'id' | 'createdAt'>): LocalReview => {
  if (typeof window === 'undefined') {
    return { ...review, id: 'temp', createdAt: new Date().toISOString() };
  }
  
  const reviews = getLocalReviews();
  const newReview: LocalReview = {
    ...review,
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  reviews.push(newReview);
  localStorage.setItem('product_reviews', JSON.stringify(reviews));
  
  return newReview;
};

// Wishlist Management
export const getLocalWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const wishlistData = localStorage.getItem('wishlist');
  if (wishlistData) {
    try {
      return JSON.parse(wishlistData);
    } catch (error) {
      console.error('Error parsing wishlist data:', error);
    }
  }
  
  return [];
};

export const addToLocalWishlist = (productId: string): string[] => {
  if (typeof window === 'undefined') return [];
  
  const wishlist = getLocalWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }
  
  return wishlist;
};

export const removeFromLocalWishlist = (productId: string): string[] => {
  if (typeof window === 'undefined') return [];
  
  const wishlist = getLocalWishlist();
  const updatedWishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  
  return updatedWishlist;
};

export const isInLocalWishlist = (productId: string): boolean => {
  return getLocalWishlist().includes(productId);
};