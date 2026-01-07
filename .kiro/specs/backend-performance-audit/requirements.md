# Requirements Document

## Introduction

هذا المستند يوثق متطلبات مراجعة شاملة للـ Backend API (scrubstore-api) للكشف عن مشاكل الأداء والأمان والتصميم وإصلاحها. المراجعة تغطي جميع الملفات في المشروع وتقسمها إلى مهام منفصلة للمراجعة والإصلاح.

## Glossary

- **N+1 Query**: مشكلة أداء تحدث عند تنفيذ استعلام إضافي لكل عنصر في قائمة
- **Race Condition**: حالة تحدث عند وصول عمليتين متزامنتين لنفس المورد
- **Cache Invalidation**: عملية إزالة البيانات القديمة من الذاكرة المؤقتة
- **Idempotency**: ضمان أن تكرار نفس العملية يعطي نفس النتيجة
- **Stock Locking**: قفل المخزون لمنع البيع الزائد
- **TTL (Time To Live)**: مدة صلاحية البيانات في الكاش

## Requirements

### Requirement 1: Database & Query Performance

**User Story:** As a developer, I want to ensure all database queries are optimized, so that the API responds quickly under load.

#### Acceptance Criteria

1. WHEN a product list is requested, THE System SHALL return results using a single optimized query with JOINs instead of N+1 queries.
2. WHILE fetching order items, THE System SHALL use batch queries to load related data in a maximum of 2 database calls.
3. THE System SHALL have indexes on all foreign key columns and frequently queried fields (session_id, email, phone, created_at).
4. WHEN pagination is used, THE System SHALL use cursor-based pagination for large datasets instead of OFFSET.
5. THE System SHALL limit all unbounded queries to a maximum of 1000 records.

### Requirement 2: Stock Management & Race Conditions

**User Story:** As a store owner, I want inventory to be accurately tracked, so that I never oversell products.

#### Acceptance Criteria

1. WHEN multiple orders are placed simultaneously for the same variant, THE System SHALL use database-level locking to prevent overselling.
2. THE System SHALL implement atomic stock deduction using a single UPDATE query with WHERE quantity >= requested_quantity.
3. IF stock deduction fails due to insufficient quantity, THEN THE System SHALL return a clear error with available stock amount.
4. WHEN an order is cancelled or returned, THE System SHALL atomically restore the stock quantity.
5. THE System SHALL validate stock availability immediately before order creation, not just at cart addition.

### Requirement 3: Caching Strategy

**User Story:** As a developer, I want proper caching implementation, so that frequently accessed data is served quickly.

#### Acceptance Criteria

1. THE System SHALL implement cache invalidation when products, categories, or promotions are created, updated, or deleted.
2. WHEN cache is invalidated, THE System SHALL use targeted invalidation instead of clearing all cache.
3. THE System SHALL implement cache stampede protection using mutex locks or stale-while-revalidate pattern.
4. THE System SHALL have configurable TTL values for different data types (products: 5min, categories: 10min, promotions: 5min).
5. THE System SHALL expose cache hit/miss statistics via the health endpoint.

### Requirement 4: Authentication & Security

**User Story:** As a security-conscious developer, I want robust authentication, so that user accounts are protected.

#### Acceptance Criteria

1. THE System SHALL implement token rotation on every refresh token use.
2. THE System SHALL store refresh tokens with expiration and invalidate all tokens on password change.
3. THE System SHALL implement brute force protection limiting login attempts to 5 per 15 minutes per IP/email combination.
4. THE System SHALL use secure password hashing with bcrypt and minimum 12 rounds.
5. THE System SHALL not expose sensitive information in error messages or JWT payloads.
6. THE System SHALL implement rate limiting on all authentication endpoints (10 requests per minute).

### Requirement 5: Order & Payment Consistency

**User Story:** As a store owner, I want orders to be created reliably, so that no orders are lost or duplicated.

#### Acceptance Criteria

1. THE System SHALL require Idempotency-Key header for order creation to prevent duplicate orders.
2. WHEN order creation fails after stock deduction, THE System SHALL rollback the stock changes.
3. THE System SHALL validate cart prices against current product prices before order creation.
4. THE System SHALL implement order status state machine with valid transitions only.
5. THE System SHALL log all order state changes in audit logs with user ID and timestamp.

### Requirement 6: File Upload Security

**User Story:** As a developer, I want secure file uploads, so that malicious files cannot be uploaded.

#### Acceptance Criteria

1. THE System SHALL validate file MIME type and extension match before accepting uploads.
2. THE System SHALL generate random filenames to prevent path traversal attacks.
3. THE System SHALL limit file size to 10MB and implement request size limits.
4. THE System SHALL scan for double extensions and suspicious file patterns.
5. THE System SHALL serve uploaded files with proper Content-Type and X-Content-Type-Options headers.

### Requirement 7: Error Handling & Observability

**User Story:** As a developer, I want comprehensive error handling and logging, so that issues can be quickly identified and resolved.

#### Acceptance Criteria

1. THE System SHALL use structured logging with correlation IDs for request tracing.
2. THE System SHALL categorize errors with specific error codes (AUTH_*, CART_*, ORDER_*, etc.).
3. THE System SHALL not expose stack traces or internal details in production error responses.
4. THE System SHALL implement health check endpoint with database and cache status.
5. THE System SHALL log all failed operations with sufficient context for debugging.

### Requirement 8: API Design & Architecture

**User Story:** As a developer, I want clean API architecture, so that the codebase is maintainable and scalable.

#### Acceptance Criteria

1. THE System SHALL follow repository pattern separating data access from business logic.
2. THE System SHALL use service layer for all business logic, keeping routes thin.
3. THE System SHALL validate all input using Joi schemas before processing.
4. THE System SHALL use consistent response format across all endpoints.
5. THE System SHALL implement proper HTTP status codes (201 for create, 204 for delete, etc.).

### Requirement 9: Promotion & Discount Integrity

**User Story:** As a store owner, I want promotions to be applied correctly, so that customers get accurate discounts.

#### Acceptance Criteria

1. THE System SHALL prevent invalid discount stacking by applying promotions in priority order.
2. WHEN calculating "Buy X Get Y Free", THE System SHALL always charge for the highest-priced items.
3. THE System SHALL validate promotion date ranges and usage limits before applying.
4. THE System SHALL recalculate prices at checkout to prevent price manipulation.
5. THE System SHALL log all applied promotions with discount amounts in order records.

### Requirement 10: Memory & Resource Management

**User Story:** As a developer, I want efficient resource usage, so that the server remains stable under load.

#### Acceptance Criteria

1. THE System SHALL implement periodic cleanup for expired idempotency keys, sessions, and cache entries.
2. THE System SHALL use streaming for large file operations instead of loading into memory.
3. THE System SHALL limit concurrent database connections and implement connection pooling.
4. THE System SHALL implement request timeout of 30 seconds for all endpoints.
5. THE System SHALL handle graceful shutdown, completing in-flight requests before terminating.
