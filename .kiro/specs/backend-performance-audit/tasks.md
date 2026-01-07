# Implementation Plan

## Priority 1 - Critical (Race Conditions & Data Integrity)

- [x] 1. Fix atomic stock operations in variant.repository.js




  - [ ] 1.1 Implement `deductStockAtomic` method using single UPDATE with WHERE condition
    - Replace read-then-write pattern with atomic UPDATE
    - Add condition `WHERE quantity >= requested_quantity`

    - Return updated variant or throw InsufficientStockError
    - _Requirements: 2.1, 2.2, 2.3_




  - [ ] 1.2 Update `restoreStock` to use atomic increment
    - Use `SET quantity = quantity + ?` instead of read-then-write
    - _Requirements: 2.4_





- [ ] 2. Fix transaction-safe stock deduction in variant.service.js
  - [ ] 2.1 Update `checkAndDeductStock` to use atomic operations with rollback
    - Validate all items first
    - Deduct atomically with try-catch

    - Rollback on failure
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Fix order creation transaction in order.service.js
  - [ ] 3.1 Reorder operations: create order before stock deduction
    - Validate cart and address first




    - Calculate totals
    - Create order record
    - Deduct stock after order creation


    - Rollback order if stock deduction fails
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 3.2 Add price validation at checkout
    - Recalculate prices from current product data
    - Compare with cart prices
    - Reject if prices changed significantly
    - _Requirements: 5.3_

## Priority 2 - Performance (N+1 Queries)

- [ ] 4. Fix N+1 queries in order.repository.js
  - [ ] 4.1 Implement batch loading for order items
    - Get all order IDs first
    - Load all items in single query with IN clause
    - Group items by order_id in JavaScript
    - _Requirements: 1.1, 1.2_

- [x] 5. Fix N+1 queries in variant.repository.js

  - [x] 5.1 Optimize `findByProductId` to use single query with GROUP_CONCAT

    - Join variant_option_values, option_values, product_options
    - Parse concatenated string into array
    - _Requirements: 1.1, 1.2_



- [x] 6. Fix N+1 queries in cart.repository.js

  - [x] 6.1 Optimize `getCartWithItems` to batch load option values

    - Get all variant IDs from cart items
    - Load all option values in single query
    - Map to items in JavaScript
    - _Requirements: 1.1, 1.2_



- [x] 7. Add cache invalidation calls in product.repository.js

  - [x] 7.1 Call `invalidateCache` after create, update, softDelete, restore

    - Add invalidation in create method
    - Add invalidation in update method
    - Add invalidation in softDelete method
    - Add invalidation in restore method
    - _Requirements: 3.1, 3.2_

## Priority 3 - Caching Improvements

- [x] 8. Add stampede protection to queryCache.js



  - [x] 8.1 Implement mutex locks for concurrent requests

    - Add locks Map to track in-flight requests
    - Return existing promise if key is being fetched
    - Clean up lock after fetch completes
    - _Requirements: 3.3_
  - [x] 8.2 Add stale-while-revalidate pattern

    - Add `getStale` method returning value and stale flag
    - Allow serving stale data while revalidating
    - _Requirements: 3.3, 3.4_

## Priority 4 - Security Enhancements

- [x] 9. Enhance password validation in auth.service.js



  - [x] 9.1 Add lowercase and number requirements

    - Check for at least one lowercase letter
    - Check for at least one number
    - Return detailed error messages
    - _Requirements: 4.4_

- [x] 10. Add magic number validation in upload.routes.js



  - [x] 10.1 Implement file content validation

    - Define magic numbers for JPEG, PNG, GIF, WebP
    - Read first bytes of uploaded file
    - Compare with expected magic numbers
    - Delete file and return error if mismatch
    - _Requirements: 6.1, 6.2_

## Priority 5 - Observability

- [x] 11. Add correlation ID middleware


  - [x] 11.1 Create correlationId.js middleware


    - Generate UUID if not in request headers
    - Set X-Correlation-ID response header
    - Attach to request object
    - _Requirements: 7.1_

  - [x] 11.2 Update errorHandler.js to include correlation ID

    - Log correlation ID with errors
    - Include in error response for debugging
    - _Requirements: 7.1, 7.5_

  - [x] 11.3 Add middleware to index.js

    - Import and use correlation ID middleware
    - Place before other middleware
    - _Requirements: 7.1_

## Priority 6 - Database Indexes

- [x] 12. Add missing database indexes in database.js


  - [x] 12.1 Add performance indexes


    - idx_orders_session_id
    - idx_orders_status
    - idx_orders_created_at
    - idx_cart_items_cart_id
    - idx_product_variants_product_id
    - idx_product_images_product_id
    - idx_audit_logs_entity
    - idx_product_views_product_id
    - _Requirements: 1.3_

## Priority 7 - Graceful Shutdown

- [x] 13. Implement graceful shutdown in index.js


  - [x] 13.1 Add shutdown handlers


    - Listen for SIGTERM and SIGINT signals
    - Stop accepting new connections
    - Wait for in-flight requests to complete
    - Close database connection
    - Exit process
    - _Requirements: 10.5_

## Priority 8 - Query Limits

- [x] 14. Add query limits to base.repository.js




  - [x] 14.1 Implement maximum page size limit

    - Cap pageSize at 100 records
    - Add default limit for unbounded queries
    - _Requirements: 1.5_
