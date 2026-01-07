# Implementation Plan

- [x] 1. Project Setup & Core Infrastructure
  - [x] 1.1 Initialize project structure and dependencies
    - Create folder structure: config, middleware, routes, services, repositories, models, utils
    - Install dependencies: express, sql.js, bcryptjs, jsonwebtoken, joi, uuid, cors
    - Create .env.example with all required environment variables
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.2 Set up database configuration and connection
    - Create config/database.js with sql.js connection
    - Implement database initialization with all table schemas
    - Add indexes for performance optimization
    - Seed default feature flags
    - _Requirements: 1.2, 19.1, 19.6_

  - [x] 1.3 Create utility modules
    - Create utils/response.js for unified API responses
    - Create utils/errors.js with custom error classes
    - Create utils/orderNumber.js for human-readable order numbers
    - Create utils/cache.js for in-memory caching
    - _Requirements: 3.3, 3.4, 11.3_

  - [x] 1.4 Set up Express server with base middleware
    - Create src/index.js with Express app setup
    - Configure CORS, JSON body parser (10MB limit)
    - Add health check endpoint at GET /api/health
    - Load environment variables from config/env.js
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Security Middleware Layer
  - [x] 2.1 Implement rate limiting middleware
    - Create middleware/rateLimiter.js with sliding window algorithm
    - Configure 100 req/min for general, 10 req/min for auth endpoints
    - Return 429 with Retry-After header when exceeded
    - Support IP whitelist via environment config
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [x] 2.2 Implement request validation middleware
    - Create middleware/validator.js using Joi
    - Create models/schemas.js with all validation schemas
    - Return 400 with field-level error details
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 2.3 Implement global error handler
    - Create middleware/errorHandler.js
    - Handle all error types with unified response format
    - Log errors with timestamp and context
    - _Requirements: 3.3, 3.4, 3.6_

- [x] 3. Authentication & Authorization System
  - [x] 3.1 Create base repository with soft delete support
    - Create repositories/base.repository.js
    - Implement CRUD with automatic soft delete handling
    - Add includeDeleted parameter support
    - Add restore functionality
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

  - [x] 3.2 Implement user repository and auth service
    - Create repositories/user.repository.js extending base
    - Create services/auth.service.js with register, login, changePassword, refreshToken
    - Implement password validation (8+ chars, 1 uppercase)
    - Use bcrypt for password hashing
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.3 Implement JWT authentication middleware
    - Create middleware/auth.js for token validation
    - Generate access tokens (15 min) and refresh tokens (7 days)
    - Attach user object to req.user
    - Return 401 for invalid/expired tokens
    - _Requirements: 2.2, 2.4, 2.6_

  - [x] 3.4 Implement RBAC middleware
    - Create middleware/rbac.js for role checking
    - Support Admin and User roles
    - Return 403 for unauthorized access
    - _Requirements: 2.7, 2.8, 2.9_

  - [x] 3.5 Create authentication routes
    - Create routes/auth.routes.js
    - POST /api/Authentication/Register
    - POST /api/Authentication/Login
    - POST /api/Authentication/ChangePassword
    - POST /api/Authentication/refreshToken
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Audit Logging System
  - [x] 4.1 Implement audit logger middleware
    - Create middleware/auditLogger.js
    - Intercept POST, PUT, DELETE requests
    - Capture userId, action, entityType, entityId, previousValue, newValue
    - Record IP address and user agent
    - _Requirements: 18.1, 18.2, 18.3, 18.6_

  - [x] 4.2 Create audit log routes and service
    - Create services/auditLog.service.js
    - Create routes/auditLog.routes.js
    - GET /api/AuditLogs with pagination and filters (Admin only)
    - Support filtering by userId, entityType, action, date range
    - Prevent modification/deletion of audit records
    - _Requirements: 18.4, 18.5, 18.7_

- [x] 5. Feature Flags System
  - [x] 5.1 Implement feature flag middleware and service
    - Create middleware/featureFlag.js
    - Create services/featureFlag.service.js
    - Check flag before executing flagged functionality
    - Return 503 when feature is disabled
    - Implement in-memory cache with configurable TTL
    - _Requirements: 19.1, 19.4, 19.5, 19.6, 19.7, 19.8_

  - [x] 5.2 Create feature flag routes
    - Create routes/featureFlag.routes.js
    - GET /api/FeatureFlags (Admin only)
    - PUT /api/FeatureFlags/{name} to toggle status
    - Invalidate cache on update
    - _Requirements: 19.2, 19.3, 19.8_

- [x] 6. Category Management
  - [x] 6.1 Implement category repository and service
    - Create repositories/category.repository.js
    - Create services/category.service.js
    - Support bilingual names (Arabic/English)
    - Include product count in details
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.2 Create category routes
    - Create routes/category.routes.js
    - GET /api/Category with pagination
    - GET /api/Category/{id}
    - POST /api/Category (Admin)
    - PUT /api/Category/{id} (Admin)
    - DELETE /api/Category/{id} (Admin, soft delete)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Product Management with Generic Options
  - [x] 7.1 Implement product repository and service
    - Create repositories/product.repository.js
    - Create services/product.service.js
    - Support bilingual names and descriptions
    - Implement search and filter functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 7.2 Implement generic options system
    - Create repositories/productOption.repository.js
    - Create services/productOption.service.js
    - Support dynamic option groups with custom names
    - Allow multiple values per option group
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 7.3 Implement variant management
    - Create repositories/variant.repository.js
    - Create services/variant.service.js
    - Generate variants from option combinations
    - Track inventory per variant
    - Support price overrides
    - _Requirements: 5.4, 5.5, 5.6, 5.7_

  - [x] 7.4 Create product routes
    - Create routes/product.routes.js
    - GET /api/Product with pagination
    - GET /api/Product/{id} with variants and options
    - POST /api/Product (Admin)
    - PUT /api/Product/{id} (Admin)
    - DELETE /api/Product/{id} (Admin, soft delete)
    - GET /api/Product/Search
    - GET /api/Product/Filter
    - POST /api/Product/{id}/options (Admin)
    - GET /api/Product/{id}/variants
    - _Requirements: 4.1-4.7, 5.2, 5.7_

- [x] 8. Product Images
  - [x] 8.1 Implement image management
    - Create services/image.service.js
    - Store images in filesystem (uploads folder)
    - Store references in database
    - Support main image per variant
    - Support multiple images with ordering
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 8.2 Create image routes
    - Add to routes/product.routes.js
    - POST /api/Product/{id}/images (Admin)
    - DELETE /api/Product/{id}/images/{imageId} (Admin)
    - _Requirements: 15.2, 15.4_

- [x] 9. Shopping Cart System
  - [x] 9.1 Implement cart repository and service
    - Create repositories/cart.repository.js
    - Create services/cart.service.js
    - Identify carts by Session_ID
    - Calculate totals with promotion breakdown
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 9.2 Create cart routes
    - Create routes/cart.routes.js
    - POST /api/Cart (add item)
    - GET /api/Cart/{sessionId}
    - PUT /api/Cart/Items/Quantity
    - GET /api/Cart/Items/Number/{sessionId}
    - GET /api/Cart/Items/Price/{sessionId}
    - DELETE /api/Cart/Item/{itemId}/{sessionId}
    - DELETE /api/Cart/{sessionId}
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 10. Shipping Rules System
  - [x] 10.1 Implement shipping service
    - Create repositories/shipping.repository.js
    - Create services/shipping.service.js
    - Evaluate rules based on: min amount, quantity, category, product, date range
    - Support priority ordering for multiple rules
    - Calculate free shipping when conditions match
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 10.2 Create shipping routes
    - Create routes/shipping.routes.js
    - GET /api/Shipping/calculate/{sessionId}
    - GET /api/Shipping/rules (Admin)
    - POST /api/Shipping/rules (Admin)
    - PUT /api/Shipping/rules/{id} (Admin)
    - DELETE /api/Shipping/rules/{id} (Admin)
    - _Requirements: 8.4_

- [x] 11. Automatic Promotions System
  - [x] 11.1 Implement promotion service
    - Create repositories/promotion.repository.js
    - Create services/promotion.service.js
    - Support types: quantity_based, first_order, category_based, min_order_amount
    - Apply promotions automatically without codes
    - Handle priority for conflict resolution
    - Support date ranges
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_

  - [x] 11.2 Create promotion routes
    - Create routes/promotion.routes.js
    - GET /api/Promotions (Admin)
    - POST /api/Promotions (Admin)
    - PUT /api/Promotions/{id} (Admin)
    - DELETE /api/Promotions/{id} (Admin)
    - Apply featureFlag('promotions') middleware
    - _Requirements: 9.6_

- [x] 12. Bundles System
  - [x] 12.1 Implement bundle service
    - Create repositories/bundle.repository.js
    - Create services/bundle.service.js
    - Support fixed pricing and percentage discount
    - Calculate stock from lowest component stock
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 12.2 Create bundle routes and cart integration
    - Create routes/bundle.routes.js
    - GET /api/Bundles
    - POST /api/Bundles (Admin)
    - PUT /api/Bundles/{id} (Admin)
    - DELETE /api/Bundles/{id} (Admin)
    - Integrate bundle adding to cart
    - Apply featureFlag('bundles') middleware
    - _Requirements: 10.4, 10.5, 10.6_

- [x] 13. Address Management
  - [x] 13.1 Implement address service
    - Create repositories/address.repository.js
    - Create services/address.service.js
    - Support multiple addresses per user
    - Require: fullName, phone, country, city, area, details
    - Support default address marking
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 13.2 Create address routes
    - Create routes/address.routes.js
    - GET /api/Addresses/{userId}
    - POST /api/Addresses
    - PUT /api/Addresses/{id}
    - DELETE /api/Addresses/{id} (soft delete)
    - PUT /api/Addresses/{id}/default
    - _Requirements: 12.5, 12.6_

- [x] 14. Order Management with Idempotency
  - [x] 14.1 Implement idempotency middleware
    - Create middleware/idempotency.js
    - Require Idempotency-Key header for POST /api/Orders
    - Store keys with responses for 24 hours
    - Return cached response for duplicate keys
    - Add X-Idempotent-Replayed header for cached responses
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

  - [x] 14.2 Implement order service
    - Create repositories/order.repository.js
    - Create services/order.service.js
    - Create order from cart with inventory validation
    - Deduct stock on order creation
    - Generate human-readable order numbers
    - Snapshot address data into order
    - Expand bundles into order items
    - _Requirements: 11.1, 11.2, 11.3, 12.4, 10.5_

  - [x] 14.3 Implement order lifecycle management
    - Validate status transitions (Pending→Confirmed→Packed→Shipped→Delivered)
    - Restore inventory on Returned status
    - Support filtering by status and date range
    - _Requirements: 11.4, 11.5, 11.6, 11.7, 11.8_

  - [x] 14.4 Create order routes
    - Create routes/order.routes.js
    - POST /api/Orders (with idempotency middleware)
    - GET /api/Orders with pagination
    - GET /api/Orders/{id}
    - GET /api/Orders/session/{sessionId}
    - PUT /api/Orders/{id}/status (Admin)
    - GET /api/Orders/filter
    - _Requirements: 11.1, 11.7_

  - [x] 14.5 Implement idempotency cleanup job
    - Create scheduled task to clean expired keys
    - Run every hour
    - _Requirements: 20.7_

- [x] 15. Social Proof Videos
  - [x] 15.1 Implement social proof service
    - Create repositories/socialProof.repository.js
    - Create services/socialProof.service.js
    - Support video URLs only (no file uploads)
    - Store thumbnail, title, description
    - Support optional product linking
    - Require admin approval
    - Support featured marking
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 15.2 Create social proof routes
    - Create routes/socialProof.routes.js
    - GET /api/SocialProof (with approved filter)
    - POST /api/SocialProof (Admin)
    - PUT /api/SocialProof/{id} (Admin)
    - DELETE /api/SocialProof/{id} (Admin)
    - PUT /api/SocialProof/{id}/approve (Admin)
    - Apply featureFlag('social_proof') middleware
    - _Requirements: 13.6_

- [x] 16. Marketing Testimonials
  - [x] 16.1 Implement testimonial service
    - Create repositories/testimonial.repository.js
    - Create services/testimonial.service.js
    - Store: customerName, role, rating (1-5), text
    - Support visibility control
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 16.2 Create testimonial routes
    - Create routes/testimonial.routes.js
    - GET /api/Testimonials (with visible filter)
    - POST /api/Testimonials (Admin)
    - PUT /api/Testimonials/{id} (Admin)
    - DELETE /api/Testimonials/{id} (Admin)
    - Apply featureFlag('testimonials') middleware
    - _Requirements: 14.4, 14.5_

- [x] 17. Analytics System
  - [x] 17.1 Implement analytics service
    - Create repositories/analytics.repository.js
    - Create services/analytics.service.js
    - Track product views per session (avoid duplicates)
    - Calculate best-selling products by order quantity
    - Optimize queries with indexes
    - _Requirements: 16.1, 16.2, 16.3_

  - [x] 17.2 Create analytics routes
    - Create routes/analytics.routes.js
    - POST /api/Analytics/track-view
    - GET /api/Analytics/best-sellers (Admin)
    - GET /api/Analytics/product-views/{productId} (Admin)
    - Apply featureFlag('analytics') middleware
    - _Requirements: 16.4_

- [x] 18. Final Integration & Testing
  - [x] 18.1 Wire all routes to main application
    - Register all route modules in src/index.js
    - Apply middleware in correct order: rateLimiter → cors → bodyParser → auth → routes → errorHandler
    - _Requirements: All_

  - [x] 18.2 Create integration tests for critical flows
    - Test auth flow: register → login → refresh
    - Test cart → order flow with inventory
    - Test promotion application
    - Test idempotency handling
    - _Requirements: All_

  - [x] 18.3 Create seed script for development

    - Create scripts/seed.js
    - Seed sample categories, products, options, variants
    - Seed admin user
    - Seed sample promotions and shipping rules
    - _Requirements: All_
