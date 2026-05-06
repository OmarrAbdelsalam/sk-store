// API Routes for frontend-only store
const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

export const API_ROUTES = {
  // Orders
  orders: {
    create: () => `${BASE_URL}/api/orders`,
    bySessionId: (sessionId: string) => `${BASE_URL}/api/orders/session/${sessionId}`,
    byId: (id: string | number) => `${BASE_URL}/api/orders/${id}`,
  },
  // Products
  products: {
    byId: (id: string | number) => `${BASE_URL}/api/products/${id}`,
  },
  // Reviews
  reviews: {
    create: () => `${BASE_URL}/api/reviews`,
    update: (id: string | number) => `${BASE_URL}/api/reviews/${id}`,
  }
} as const;