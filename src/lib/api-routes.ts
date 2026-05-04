// API Routes for frontend-only store
// These routes are now mocked and don't connect to real backend

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export const API_ROUTES = {
  // Products
  products: {
    byId: (id: string | number) => `${BASE_URL}/api/products/${id}`,
    list: () => `${BASE_URL}/api/products`,
    search: () => `${BASE_URL}/api/products/search`,
  },
  
  // Orders
  orders: {
    create: () => `${BASE_URL}/api/orders`,
    bySessionId: (sessionId: string) => `${BASE_URL}/api/orders/session/${sessionId}`,
    byId: (id: string | number) => `${BASE_URL}/api/orders/${id}`,
  },
  
  // Reviews
  reviews: {
    create: () => `${BASE_URL}/api/reviews`,
    update: (id: string | number) => `${BASE_URL}/api/reviews/${id}`,
    byProduct: (productId: string | number) => `${BASE_URL}/api/reviews/product/${productId}`,
  },
  
  // Cart
  cart: {
    get: (sessionId: string) => `${BASE_URL}/api/cart/${sessionId}`,
    add: () => `${BASE_URL}/api/cart/add`,
    update: () => `${BASE_URL}/api/cart/update`,
    remove: () => `${BASE_URL}/api/cart/remove`,
    clear: (sessionId: string) => `${BASE_URL}/api/cart/${sessionId}/clear`,
  },
  
  // Shipping
  shipping: {
    calculate: () => `${BASE_URL}/api/shipping/calculate`,
    governorates: () => `${BASE_URL}/api/shipping/governorates`,
  },
  
  // Discounts
  discounts: {
    apply: () => `${BASE_URL}/api/discounts/apply`,
    remove: () => `${BASE_URL}/api/discounts/remove`,
  },
} as const;