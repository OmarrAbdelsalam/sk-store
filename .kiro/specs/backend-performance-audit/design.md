# Design Document - Backend Performance Audit

## Overview

هذا المستند يوضح التصميم التفصيلي لإصلاح مشاكل الأداء والأمان في الـ Backend API. بعد مراجعة الكود الحالي، تم تحديد المشاكل الموجودة والحلول المقترحة لكل ملف.

## Architecture

### Current State Analysis

```
scrubstore-api/src/
├── config/          ✅ جيد - database.js, env.js, swagger.js
├── middleware/      ⚠️ يحتاج تحسين - بعض المشاكل في security و rateLimiter
├── models/          ✅ جيد - schemas.js
├── repositories/    ⚠️ يحتاج تحسين - N+1 queries في بعض الملفات
├── routes/          ✅ جيد - thin controllers
├── services/        ⚠️ يحتاج تحسين - race conditions في variant و order
└── utils/           ⚠️ يحتاج تحسين - cache invalidation
```

## Components and Interfaces

### 1. Database Layer Improvements

#### Current Issues Found:
- **variant.repository.js**: N+1 query في `findByProductId` - يستدعي query منفصل لكل variant
- **order.repository.js**: N+1 query في `findAllWithItems` - يستدعي `getOrderItems` لكل order
- **cart.repository.js**: N+1 query في `getCartWithItems` - يستدعي query منفصل لكل item

#### Solution Design:

```javascript
// variant.repository.js - Batch loading
findByProductId(productId, includeDeleted = false) {
  // Single query with LEFT JOIN instead of N+1
  const query = `
    SELECT pv.*, 
           GROUP_CONCAT(ov.id || '::' || ov.value_en || '::' || ov.value_ar || '::' || po.name_en || '::' || po.name_ar) as option_values_str
    FROM product_variants pv
    LEFT JOIN variant_option_values vov ON vov.variant_id = pv.id
    LEFT JOIN option_values ov ON vov.option_value_id = ov.id
    LEFT JOIN product_options po ON ov.option_id = po.id
    WHERE pv.product_id = ? ${includeDeleted ? '' : 'AND pv.deleted_at IS NULL'}
    GROUP BY pv.id
  `;
  // Parse option_values_str into array
}

// order.repository.js - Batch loading
findAllWithItems(options) {
  // Get all orders first
  const orders = this.db.prepare(dataQuery).all(...params, pageSize, offset);
  
  // Batch load all items in single query
  const orderIds = orders.map(o => o.id);
  const allItems = this.db.prepare(`
    SELECT oi.*, pv.sku, oi.order_id
    FROM order_items oi
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
  `).all(...orderIds);
  
  // Group items by order_id
  const itemsByOrder = groupBy(allItems, 'order_id');
  orders.forEach(order => {
    order.items = itemsByOrder[order.id] || [];
  });
}
```

### 2. Stock Locking Mechanism

#### Current Issues Found:
- **variant.service.js**: `checkAndDeductStock` ليس atomic - يمكن حدوث race condition
- **variant.repository.js**: `deductStock` يقرأ ثم يكتب - غير آمن للتزامن

#### Solution Design:

```javascript
// variant.repository.js - Atomic stock deduction
deductStockAtomic(variantId, quantity) {
  // Single atomic UPDATE with condition
  const result = this.db.prepare(`
    UPDATE product_variants 
    SET quantity = quantity - ?, updated_at = datetime('now')
    WHERE id = ? AND quantity >= ? AND deleted_at IS NULL
  `).run(quantity, variantId, quantity);
  
  if (result.changes === 0) {
    // Either not found or insufficient stock
    const current = this.findById(variantId);
    if (!current) throw new NotFoundError('Variant');
    throw new InsufficientStockError([{
      variant_id: variantId,
      requested: quantity,
      available: current.quantity
    }]);
  }
  
  return this.findById(variantId);
}

// variant.service.js - Batch atomic deduction
checkAndDeductStock(items) {
  // Validate all first
  for (const item of items) {
    const stock = variantRepository.checkStock(item.variant_id, item.quantity);
    if (!stock.available) {
      throw new InsufficientStockError([{
        variant_id: item.variant_id,
        requested: item.quantity,
        available: stock.current
      }]);
    }
  }
  
  // Deduct atomically - if any fails, previous deductions need rollback
  const deducted = [];
  try {
    for (const item of items) {
      variantRepository.deductStockAtomic(item.variant_id, item.quantity);
      deducted.push(item);
    }
  } catch (error) {
    // Rollback deducted items
    for (const item of deducted) {
      variantRepository.restoreStock(item.variant_id, item.quantity);
    }
    throw error;
  }
  
  return true;
}
```

### 3. Cache Invalidation Strategy

#### Current Issues Found:
- **product.repository.js**: `invalidateCache` موجود لكن لا يُستدعى بعد create/update/delete
- **queryCache.js**: لا يوجد stampede protection
- **quickPromo.service.js**: cache invalidation جيد لكن يحتاج تحسين

#### Solution Design:

```javascript
// queryCache.js - Add stampede protection
class QueryCache {
  constructor() {
    this.cache = new Map();
    this.locks = new Map(); // For stampede protection
    // ...
  }

  async getOrSetAsync(key, fn, ttlType = 'products_list') {
    const cached = this.get(key);
    if (cached !== null) return cached;
    
    // Check if another request is already fetching
    if (this.locks.has(key)) {
      // Wait for the other request
      return this.locks.get(key);
    }
    
    // Set lock
    const promise = Promise.resolve(fn());
    this.locks.set(key, promise);
    
    try {
      const value = await promise;
      this.set(key, value, ttlType);
      return value;
    } finally {
      this.locks.delete(key);
    }
  }

  // Stale-while-revalidate pattern
  getStale(key) {
    const item = this.cache.get(key);
    if (!item) return { value: null, stale: true };
    
    const isStale = Date.now() > item.expiresAt;
    return { value: item.value, stale: isStale };
  }
}

// product.repository.js - Auto-invalidate on mutations
create(data) {
  const result = super.create(data);
  this.invalidateCache(); // Add this
  return result;
}

update(id, data) {
  const result = super.update(id, data);
  this.invalidateCache(id); // Add this
  return result;
}

softDelete(id, deletedBy) {
  const result = super.softDelete(id, deletedBy);
  this.invalidateCache(id); // Add this
  return result;
}
```

### 4. Security Enhancements

#### Current Issues Found:
- **auth.service.js**: Password policy جيد (8 chars + uppercase) لكن يمكن تحسينه
- **security.js**: Brute force protection موجود ✅
- **rateLimiter.js**: Rate limiting موجود ✅

#### Solution Design:

```javascript
// auth.service.js - Enhanced password validation
validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('minimum 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('one number');
  
  if (errors.length > 0) {
    throw new ValidationError(`Password must contain: ${errors.join(', ')}`);
  }
  return true;
}

// JWT payload - minimize exposed data
generateAccessToken(user) {
  return jwt.sign(
    { 
      sub: user.id,  // Use 'sub' instead of 'userId'
      role: user.role 
      // Remove email from token
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}
```

### 5. Order Transaction Safety

#### Current Issues Found:
- **order.service.js**: Stock deduction happens before order creation - if order fails, stock is lost
- **idempotency.js**: Good implementation ✅

#### Solution Design:

```javascript
// order.service.js - Transaction-like behavior
create(sessionId, addressId, userId = null, customerEmail = null) {
  // 1. Validate cart
  const cart = cartRepository.getCartWithItems(sessionId);
  if (!cart.items || cart.items.length === 0) {
    throw new ValidationError('Cart is empty');
  }

  // 2. Validate address
  const address = addressRepository.findById(addressId);
  if (!address) throw new NotFoundError('Address');

  // 3. Prepare items and validate stock (without deducting)
  const orderItems = [];
  const stockItems = [];
  
  for (const item of cart.items) {
    // ... prepare items
    const stock = variantRepository.checkStock(item.variant_id, item.quantity);
    if (!stock.available) {
      throw new InsufficientStockError([{
        variant_id: item.variant_id,
        requested: item.quantity,
        available: stock.current
      }]);
    }
  }

  // 4. Calculate totals
  const subtotal = cart.items.reduce((sum, item) => sum + item.total_price, 0);
  const promotionResult = promotionService.applyPromotions(cart, sessionId);
  // ...

  // 5. Create order first (can fail without side effects)
  const order = orderRepository.createWithItems(orderData, orderItems);

  // 6. Deduct stock AFTER order is created
  try {
    variantService.checkAndDeductStock(stockItems);
  } catch (error) {
    // Rollback: Delete the order
    orderRepository.hardDelete(order.id);
    throw error;
  }

  // 7. Clear cart
  cartRepository.clearCart(cart.id);

  return order;
}
```

### 6. File Upload Improvements

#### Current Issues Found:
- **upload.routes.js**: Good security measures ✅
- Missing: Magic number validation for actual file content

#### Solution Design:

```javascript
// upload.routes.js - Add magic number validation
const MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF header
};

async function validateMagicNumber(filePath, expectedMime) {
  const buffer = Buffer.alloc(12);
  const fd = await fs.promises.open(filePath, 'r');
  await fd.read(buffer, 0, 12, 0);
  await fd.close();
  
  const expected = MAGIC_NUMBERS[expectedMime];
  if (!expected) return false;
  
  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) return false;
  }
  return true;
}

// In upload handler
router.post('/', authenticate, adminOnly, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Validate magic number
    const isValid = await validateMagicNumber(req.file.path, req.file.mimetype);
    if (!isValid) {
      // Delete the uploaded file
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'File content does not match declared type' 
      });
    }
    // ...
  } catch (error) {
    next(error);
  }
});
```

## Data Models

### Existing Models (No Changes Needed)
الـ Database schema الحالي جيد ومصمم بشكل صحيح. الجداول الرئيسية:

- `products`, `product_variants`, `product_options`, `option_values`
- `orders`, `order_items`
- `carts`, `cart_items`
- `users`, `refresh_tokens`
- `promotions`, `quick_promotions`
- `audit_logs`, `idempotency_keys`

### Recommended Indexes

```sql
-- Performance indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
```

## Error Handling

### Current Implementation (Good) ✅
- Custom error classes in `utils/errors.js`
- Centralized error handler in `middleware/errorHandler.js`
- Specific error codes for different scenarios

### Improvements Needed

```javascript
// Add correlation ID for request tracing
// middleware/correlationId.js
const { v4: uuidv4 } = require('uuid');

function correlationId(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.set('X-Correlation-ID', req.correlationId);
  next();
}

// Update error handler to include correlation ID
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] [${req.correlationId}] Error:`, {
    message: err.message,
    errorCode: err.errorCode,
    path: req.path,
    method: req.method
  });
  // ...
}
```

## Testing Strategy

### Unit Tests (Optional)
- Repository methods with mocked database
- Service business logic
- Validation schemas

### Integration Tests (Recommended)
- Order creation flow with stock deduction
- Authentication flow
- Cache invalidation

### Load Tests (Recommended)
- Concurrent order creation for same variant
- High traffic product listing
- Cache performance under load

## Files to Review and Fix

### Priority 1 - Critical (Race Conditions & Data Integrity)
1. `repositories/variant.repository.js` - Atomic stock operations
2. `services/variant.service.js` - Transaction-safe stock deduction
3. `services/order.service.js` - Order creation transaction

### Priority 2 - Performance (N+1 Queries)
4. `repositories/order.repository.js` - Batch loading order items
5. `repositories/cart.repository.js` - Optimize cart queries
6. `repositories/product.repository.js` - Cache invalidation calls

### Priority 3 - Security
7. `services/auth.service.js` - Password policy enhancement
8. `routes/upload.routes.js` - Magic number validation
9. `middleware/security.js` - Review and enhance

### Priority 4 - Observability
10. `utils/queryCache.js` - Stampede protection
11. `middleware/errorHandler.js` - Correlation ID
12. `index.js` - Graceful shutdown

### Priority 5 - Cleanup & Maintenance
13. `config/database.js` - Add missing indexes
14. Review all services for cache invalidation calls
