# API Routes - دليل الاستخدام السريع

## الملف المركزي
📁 `src/lib/api-routes.ts`

## الاستخدام

### 1. Import
```typescript
import { API_ROUTES, API_HEADERS, CACHE_CONFIG } from "@/lib/api-routes";
```

### 2. استخدام Routes

#### Products
```typescript
// List products
const url = API_ROUTES.products.list(page, pageSize);
const res = await fetch(url, { next: CACHE_CONFIG.products });

// Get by ID
const url = API_ROUTES.products.byId(123);

// Filter
const url = API_ROUTES.products.filter({
  minPrice: 100,
  maxPrice: 500,
  categoryId: "abc",
  page: 1,
  pageSize: 12,
});
```

#### Cart
```typescript
// Get cart
const url = API_ROUTES.cart.get(sessionId);

// Add item
const url = API_ROUTES.cart.add();
await fetch(url, {
  method: "POST",
  headers: API_HEADERS,
  body: JSON.stringify(data),
});

// Apply discount
const url = API_ROUTES.cart.applyDiscount(sessionId, "CODE123");
await fetch(url, { method: "POST" });
```

#### Orders
```typescript
// Create order
const url = API_ROUTES.orders.create();
await fetch(url, {
  method: "POST",
  headers: API_HEADERS,
  body: JSON.stringify(orderData),
});

// Get user orders
const url = API_ROUTES.orders.bySessionId(sessionId);
```

#### Reviews
```typescript
// Get product reviews
const url = API_ROUTES.reviews.byProduct(productId);

// Create review
const url = API_ROUTES.reviews.create();
await fetch(url, {
  method: "POST",
  headers: API_HEADERS,
  body: JSON.stringify(reviewData),
});
```

## Cache Configurations

```typescript
CACHE_CONFIG.products    // { revalidate: 300 }  - 5 minutes
CACHE_CONFIG.categories  // { revalidate: 3600 } - 1 hour
CACHE_CONFIG.colors      // { revalidate: 3600 } - 1 hour
CACHE_CONFIG.cart        // { cache: 'no-store' }
CACHE_CONFIG.orders      // { cache: 'no-store' }
CACHE_CONFIG.reviews     // { revalidate: 600 }  - 10 minutes
```

## Default Headers

```typescript
API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
}
```

## إضافة Route جديد

```typescript
// في api-routes.ts
export const API_ROUTES = {
  // ... existing routes
  
  myNewFeature: {
    list: () => `${API_BASE}/api/MyFeature`,
    byId: (id: number) => `${API_BASE}/api/MyFeature/${id}`,
  },
}
```

## ⚠️ لا تفعل

❌ **لا تستخدم URLs مباشرة:**
```typescript
// ❌ خطأ
const url = "https://scrubstore.runasp.net/api/Product";
```

✅ **استخدم API_ROUTES:**
```typescript
// ✅ صحيح
const url = API_ROUTES.products.list();
```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE=https://scrubstore.runasp.net
```

أو للتطوير المحلي:
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```
