# Requirements Document

## Introduction

This document defines the requirements for building a generic, reusable, and professional e-commerce backend API based on the OpenAPI 3.0.1 specification. The API will be implemented using Node.js with Express and a SQLite database, designed to support any type of online store (fashion, electronics, accessories, etc.) and ready for future frontend or mobile integrations. The system focuses on modularity, scalability, and clean separation of concerns while using only free and open-source tools.

## Glossary

- **Ecommerce_API**: The Node.js/Express backend server implementing all e-commerce functionality
- **JWT**: JSON Web Token used for user authentication
- **Refresh_Token**: Token used to renew access tokens without re-authentication
- **RBAC**: Role-Based Access Control system for managing user permissions
- **Session_ID**: Unique identifier for tracking guest user carts and orders
- **Product_Variant**: A specific combination of product options (e.g., Size: Large + Color: Blue)
- **Product_Option**: Custom attribute group such as Size, Color, Material, or any custom attribute
- **Option_Value**: A specific value within an option group (e.g., "Red" in Color option)
- **Bundle**: A group of products sold together at a fixed or discounted price
- **Promotion**: Automatic discount rule applied without codes based on conditions
- **Social_Proof**: Marketing videos or testimonials showcasing customer experiences
- **Order_Lifecycle**: The status progression of an order from Pending to Delivered/Cancelled/Returned
- **Soft_Delete**: Marking records as deleted without physical removal from database

---

## Requirement 1: Project Setup & Server Configuration

**User Story:** As a developer, I want a properly configured backend project, so that I can run and develop the API locally with industry-standard tooling.

### Acceptance Criteria

1. THE Ecommerce_API SHALL use Node.js with Express framework for HTTP handling
2. THE Ecommerce_API SHALL use SQLite database for data persistence
3. THE Ecommerce_API SHALL run on a configurable port with default value of 3000
4. THE Ecommerce_API SHALL support CORS for cross-origin requests from any frontend
5. THE Ecommerce_API SHALL parse JSON request bodies up to 10MB in size
6. THE Ecommerce_API SHALL load sensitive configuration from environment variables
7. THE Ecommerce_API SHALL provide health check endpoint at GET /api/health

---

## Requirement 2: Authentication & Authorization (RBAC)

**User Story:** As a user, I want secure authentication with JWT tokens, so that I can access protected features safely.

**User Story:** As an admin, I want role-based access control, so that only authorized users can perform administrative actions.

### Acceptance Criteria

1. WHEN a POST request is sent to /api/Authentication/Register with email, username, and password, THE Ecommerce_API SHALL create a new user account
2. WHEN a POST request is sent to /api/Authentication/Login with valid credentials, THE Ecommerce_API SHALL return JWT access token and Refresh_Token
3. WHEN a POST request is sent to /api/Authentication/ChangePassword with valid current password, THE Ecommerce_API SHALL update the user password
4. WHEN a POST request is sent to /api/Authentication/refreshToken with valid Refresh_Token, THE Ecommerce_API SHALL return a new access token
5. THE Ecommerce_API SHALL validate passwords with minimum 8 characters and at least one uppercase letter
6. IF invalid credentials are provided during login, THEN THE Ecommerce_API SHALL return 401 Unauthorized response
7. THE Ecommerce_API SHALL support two roles: Admin and User
8. WHILE a request lacks Admin role, THE Ecommerce_API SHALL return 403 Forbidden for admin-only endpoints
9. THE Ecommerce_API SHALL include user role in JWT token claims

---

## Requirement 3: Global Validation & Error Handling

**User Story:** As a developer, I want predictable and consistent API responses, so that I can handle errors uniformly across all clients.

### Acceptance Criteria

1. THE Ecommerce_API SHALL validate all incoming requests via middleware before processing
2. THE Ecommerce_API SHALL enforce required fields, enum values, and numeric ranges on all inputs
3. THE Ecommerce_API SHALL return errors in unified format: `{ "success": false, "message": "string", "errorCode": "MODULE_CODE" }`
4. THE Ecommerce_API SHALL use appropriate HTTP status codes: 400 for validation, 401 for auth, 403 for forbidden, 404 for not found, 500 for server errors
5. IF validation fails on any request, THEN THE Ecommerce_API SHALL return 400 with specific field error messages
6. THE Ecommerce_API SHALL log all errors with timestamp and request context for debugging

---

## Requirement 4: Product Management

**User Story:** As an admin, I want full control over products with CRUD operations, so that I can maintain the product catalog efficiently.

### Acceptance Criteria

1. WHEN a GET request is sent to /api/Product with pageNumber and pageSize, THE Ecommerce_API SHALL return paginated product list
2. WHEN a GET request is sent to /api/Product/{id}, THE Ecommerce_API SHALL return complete product details including variants and options
3. WHEN a POST request is sent to /api/Product with product data, THE Ecommerce_API SHALL create a new product with bilingual names (Arabic and English)
4. WHEN a PUT request is sent to /api/Product/{id}, THE Ecommerce_API SHALL update the product details
5. WHEN a DELETE request is sent to /api/Product/{id}, THE Ecommerce_API SHALL perform Soft_Delete on the product
6. WHEN a GET request is sent to /api/Product/Search with keyword, THE Ecommerce_API SHALL return matching products
7. WHEN a GET request is sent to /api/Product/Filter with criteria, THE Ecommerce_API SHALL return filtered products by price range, options, and category

---

## Requirement 5: Generic Product Options & Variants

**User Story:** As an admin, I want flexible product options for any product type, so that the system works for fashion, electronics, or any merchandise.

### Acceptance Criteria

1. THE Ecommerce_API SHALL support dynamic Product_Option groups per product without fixed Color/Size dependency
2. WHEN a POST request is sent to /api/Product/{id}/options, THE Ecommerce_API SHALL create custom option groups with user-defined names
3. THE Ecommerce_API SHALL allow multiple Option_Value entries per Product_Option group
4. WHEN options are defined, THE Ecommerce_API SHALL generate Product_Variant combinations automatically
5. THE Ecommerce_API SHALL track inventory quantity per Product_Variant independently
6. THE Ecommerce_API SHALL support price overrides per Product_Variant
7. WHEN a GET request is sent to /api/Product/{id}/variants, THE Ecommerce_API SHALL return all variants with their option combinations and stock levels

---

## Requirement 6: Category Management

**User Story:** As an admin, I want to organize products into categories, so that customers can browse products easily.

### Acceptance Criteria

1. WHEN a GET request is sent to /api/Category with pagination, THE Ecommerce_API SHALL return paginated category list
2. WHEN a GET request is sent to /api/Category/{id}, THE Ecommerce_API SHALL return category details with product count
3. WHEN a POST request is sent to /api/Category with arabicName and englishName, THE Ecommerce_API SHALL create a new category with UUID
4. WHEN a PUT request is sent to /api/Category/{id}, THE Ecommerce_API SHALL update category names
5. WHEN a DELETE request is sent to /api/Category/{id}, THE Ecommerce_API SHALL perform Soft_Delete on the category

---

## Requirement 7: Shopping Cart System

**User Story:** As a customer, I want to manage my shopping cart before checkout, so that I can review and modify my selections.

### Acceptance Criteria

1. THE Ecommerce_API SHALL identify carts by Session_ID for guest users
2. WHEN a POST request is sent to /api/Cart with productId, variantId, and quantity, THE Ecommerce_API SHALL add item to cart
3. WHEN a GET request is sent to /api/Cart/{sessionId}, THE Ecommerce_API SHALL return all cart items with prices and applied promotions
4. WHEN a PUT request is sent to /api/Cart/Items/Quantity, THE Ecommerce_API SHALL update item quantity
5. WHEN a GET request is sent to /api/Cart/Items/Number/{sessionId}, THE Ecommerce_API SHALL return total item count
6. WHEN a GET request is sent to /api/Cart/Items/Price/{sessionId}, THE Ecommerce_API SHALL return total cart price with breakdown
7. WHEN a DELETE request is sent to /api/Cart/Item/{itemId}/{sessionId}, THE Ecommerce_API SHALL remove specific item
8. WHEN a DELETE request is sent to /api/Cart/{sessionId}, THE Ecommerce_API SHALL clear entire cart

---

## Requirement 8: Shipping Rules & Free Shipping

**User Story:** As an admin, I want flexible shipping rules, so that I can offer free shipping promotions and calculate costs dynamically.

### Acceptance Criteria

1. THE Ecommerce_API SHALL support configurable shipping rules via admin endpoints
2. THE Ecommerce_API SHALL evaluate shipping rules based on: minimum order amount, quantity, category, product, and date range
3. WHEN shipping rules match cart conditions, THE Ecommerce_API SHALL apply free shipping automatically
4. WHEN a GET request is sent to /api/Shipping/calculate with sessionId, THE Ecommerce_API SHALL return calculated shipping cost and applied rule
5. THE Ecommerce_API SHALL support multiple shipping rules with priority ordering
6. WHEN multiple rules match, THE Ecommerce_API SHALL apply the rule with highest priority

---

## Requirement 9: Automatic Promotions & Discounts

**User Story:** As an admin, I want automatic discounts without codes, so that promotions apply seamlessly to qualifying orders.

### Acceptance Criteria

1. THE Ecommerce_API SHALL apply Promotion rules automatically without requiring discount codes
2. THE Ecommerce_API SHALL support promotion types: quantity-based, first-order, category-based, and minimum order amount
3. THE Ecommerce_API SHALL assign priority values to promotions for conflict resolution
4. WHEN multiple promotions apply, THE Ecommerce_API SHALL use priority to determine which promotion takes effect
5. WHEN a GET request is sent to /api/Cart/{sessionId}, THE Ecommerce_API SHALL include applied promotions in price breakdown
6. WHEN a POST request is sent to /api/Promotions, THE Ecommerce_API SHALL create a new promotion rule (Admin only)
7. THE Ecommerce_API SHALL support promotion date ranges for time-limited offers

---

## Requirement 10: Bundles (Kits & Sets)

**User Story:** As an admin, I want to sell product bundles, so that I can offer curated sets at special prices.

### Acceptance Criteria

1. THE Ecommerce_API SHALL support Bundle entities containing multiple products or variants
2. THE Ecommerce_API SHALL support fixed pricing or percentage discount for bundles
3. WHEN calculating bundle stock, THE Ecommerce_API SHALL use the lowest stock level among bundle components
4. WHEN a POST request is sent to /api/Cart with bundleId, THE Ecommerce_API SHALL add bundle as single cart item
5. WHEN order is created, THE Ecommerce_API SHALL expand bundle into individual order items
6. WHEN a GET request is sent to /api/Bundles, THE Ecommerce_API SHALL return all active bundles with components and pricing

---

## Requirement 11: Order Management & Lifecycle

**User Story:** As a customer, I want to place and track orders, so that I can complete purchases and monitor delivery.

### Acceptance Criteria

1. WHEN a POST request is sent to /api/Orders with customer details and sessionId, THE Ecommerce_API SHALL create order from cart items
2. WHEN order is created, THE Ecommerce_API SHALL validate inventory and deduct stock for each item
3. THE Ecommerce_API SHALL generate human-readable order numbers for each order
4. THE Ecommerce_API SHALL support Order_Lifecycle statuses: Pending, Confirmed, Packed, Shipped, Delivered, Cancelled, Returned
5. WHEN a PUT request is sent to /api/Orders/{id}/status, THE Ecommerce_API SHALL validate status transition before updating
6. WHEN order status changes to Returned, THE Ecommerce_API SHALL restore inventory quantities
7. WHEN a GET request is sent to /api/Orders/filter with status and date range, THE Ecommerce_API SHALL return filtered orders
8. IF inventory is insufficient during order creation, THEN THE Ecommerce_API SHALL return 400 with specific item details

---

## Requirement 12: Address Management

**User Story:** As a customer, I want to manage shipping addresses, so that I can save and reuse delivery locations.

### Acceptance Criteria

1. THE Ecommerce_API SHALL allow users to manage multiple shipping addresses
2. THE Ecommerce_API SHALL require address fields: fullName, phone, country, city, area, and details
3. THE Ecommerce_API SHALL support marking one address as default per user
4. WHEN order is created, THE Ecommerce_API SHALL snapshot address data into order record
5. WHEN a GET request is sent to /api/Addresses/{userId}, THE Ecommerce_API SHALL return all addresses for that user
6. WHEN a DELETE request is sent to /api/Addresses/{id}, THE Ecommerce_API SHALL perform Soft_Delete on the address

---

## Requirement 13: Social Proof Videos

**User Story:** As an admin, I want to showcase customer videos, so that I can build trust through social proof.

### Acceptance Criteria

1. THE Ecommerce_API SHALL support Social_Proof media with video URLs only (no file uploads)
2. THE Ecommerce_API SHALL store thumbnail URL, title, and description for each video
3. THE Ecommerce_API SHALL support optional product linking for social proof videos
4. THE Ecommerce_API SHALL require admin approval before videos are publicly visible
5. THE Ecommerce_API SHALL support marking videos as featured for homepage display
6. WHEN a GET request is sent to /api/SocialProof with approved=true, THE Ecommerce_API SHALL return only approved videos

---

## Requirement 14: Marketing Testimonials

**User Story:** As an admin, I want written testimonials, so that I can display customer feedback on the website.

### Acceptance Criteria

1. THE Ecommerce_API SHALL support testimonials independent of order reviews
2. THE Ecommerce_API SHALL store testimonial fields: customerName, role, rating (1-5), and text
3. THE Ecommerce_API SHALL allow admin to control testimonial visibility
4. WHEN a GET request is sent to /api/Testimonials with visible=true, THE Ecommerce_API SHALL return only visible testimonials
5. WHEN a POST request is sent to /api/Testimonials, THE Ecommerce_API SHALL create testimonial (Admin only)

---

## Requirement 15: Product Images

**User Story:** As an admin, I want to manage product photos, so that I can showcase products visually.

### Acceptance Criteria

1. THE Ecommerce_API SHALL store images in filesystem with database references only
2. WHEN a POST request is sent to /api/Product/{id}/images with image data, THE Ecommerce_API SHALL save image and create reference
3. THE Ecommerce_API SHALL support marking one image as main per Product_Variant
4. WHEN a DELETE request is sent to /api/Product/{id}/images/{imageId}, THE Ecommerce_API SHALL remove image file and reference
5. THE Ecommerce_API SHALL support multiple images per product with ordering

---

## Requirement 16: Analytics (Lightweight)

**User Story:** As an admin, I want basic product insights, so that I can understand customer behavior and popular products.

### Acceptance Criteria

1. THE Ecommerce_API SHALL track product view counts per Session_ID to avoid duplicate counting
2. WHEN a GET request is sent to /api/Analytics/best-sellers, THE Ecommerce_API SHALL return top-selling products by order quantity
3. THE Ecommerce_API SHALL optimize analytics queries for performance using database indexes
4. WHEN a POST request is sent to /api/Analytics/track-view with productId and sessionId, THE Ecommerce_API SHALL increment view count if not already tracked for that session


---

## Requirement 17: Rate Limiting (Security)

**User Story:** As a system administrator, I want rate limiting on API endpoints, so that the system is protected from abuse and denial-of-service attacks.

### Acceptance Criteria

1. THE Ecommerce_API SHALL implement rate limiting middleware on all endpoints
2. THE Ecommerce_API SHALL limit requests per IP address to 100 requests per minute for general endpoints
3. THE Ecommerce_API SHALL limit authentication endpoints to 10 requests per minute per IP address
4. IF rate limit is exceeded, THEN THE Ecommerce_API SHALL return 429 Too Many Requests with Retry-After header
5. THE Ecommerce_API SHALL use sliding window algorithm for rate limit calculation
6. THE Ecommerce_API SHALL allow rate limit configuration via environment variables
7. THE Ecommerce_API SHALL whitelist specific IP addresses from rate limiting via configuration

---

## Requirement 18: Audit Logs (من عدّل إيه)

**User Story:** As an admin, I want audit logs for all data changes, so that I can track who modified what and when for accountability.

### Acceptance Criteria

1. THE Ecommerce_API SHALL log all create, update, and delete operations on business entities
2. THE Ecommerce_API SHALL record audit fields: userId, action, entityType, entityId, timestamp, previousValue, and newValue
3. THE Ecommerce_API SHALL store audit logs in dedicated audit_logs table
4. WHEN a GET request is sent to /api/AuditLogs with filters, THE Ecommerce_API SHALL return paginated audit entries (Admin only)
5. THE Ecommerce_API SHALL support filtering audit logs by userId, entityType, action, and date range
6. THE Ecommerce_API SHALL capture IP address and user agent for each audit entry
7. THE Ecommerce_API SHALL prevent modification or deletion of audit log records

---

## Requirement 19: Feature Flags (تشغيل/إيقاف Features)

**User Story:** As an admin, I want feature flags to enable or disable features, so that I can control feature rollout without code deployment.

### Acceptance Criteria

1. THE Ecommerce_API SHALL support feature flag entities with name, description, and enabled status
2. WHEN a GET request is sent to /api/FeatureFlags, THE Ecommerce_API SHALL return all feature flags (Admin only)
3. WHEN a PUT request is sent to /api/FeatureFlags/{name}, THE Ecommerce_API SHALL toggle feature enabled status
4. THE Ecommerce_API SHALL check feature flags before executing flagged functionality
5. IF feature flag is disabled, THEN THE Ecommerce_API SHALL return 503 Service Unavailable with feature name
6. THE Ecommerce_API SHALL support feature flags for: promotions, bundles, social_proof, testimonials, and analytics
7. THE Ecommerce_API SHALL cache feature flags in memory with configurable TTL for performance
8. WHEN feature flag is updated, THE Ecommerce_API SHALL invalidate cache immediately

---

## Requirement 20: Idempotency for Orders (حماية من duplicate submit)

**User Story:** As a customer, I want protection from duplicate order submissions, so that I am not charged multiple times for the same purchase.

### Acceptance Criteria

1. THE Ecommerce_API SHALL require Idempotency-Key header for POST /api/Orders endpoint
2. THE Ecommerce_API SHALL store idempotency keys with associated response for 24 hours
3. WHEN duplicate Idempotency-Key is received within 24 hours, THE Ecommerce_API SHALL return cached response without processing
4. THE Ecommerce_API SHALL generate unique idempotency key format: UUID v4
5. IF Idempotency-Key header is missing on order creation, THEN THE Ecommerce_API SHALL return 400 Bad Request
6. THE Ecommerce_API SHALL include X-Idempotent-Replayed: true header when returning cached response
7. THE Ecommerce_API SHALL clean up expired idempotency records via scheduled task

---

## Requirement 21: Unified Soft Delete

**User Story:** As a system administrator, I want unified soft delete across all entities, so that data is never permanently lost and can be recovered if needed.

### Acceptance Criteria

1. THE Ecommerce_API SHALL implement soft delete pattern on all business entities
2. THE Ecommerce_API SHALL add deletedAt timestamp and deletedBy userId fields to all entity tables
3. WHEN delete operation is performed, THE Ecommerce_API SHALL set deletedAt to current timestamp instead of removing record
4. THE Ecommerce_API SHALL exclude soft-deleted records from all GET queries by default
5. WHEN a GET request includes includeDeleted=true parameter, THE Ecommerce_API SHALL include soft-deleted records (Admin only)
6. WHEN a POST request is sent to /api/{entity}/{id}/restore, THE Ecommerce_API SHALL clear deletedAt and deletedBy fields (Admin only)
7. THE Ecommerce_API SHALL maintain referential integrity by preventing hard delete of referenced records
