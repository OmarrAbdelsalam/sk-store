# Requirements Document

## Introduction

This document defines the requirements for building a complete backend API for ScrubStore based on the OpenAPI 3.0.1 specification. The API will be a fully functional e-commerce backend built with Node.js/Express and a database, ready for future frontend integration. The solution will use free, open-source tools.

## Glossary

- **ScrubStore_API**: The Node.js/Express backend server implementing all e-commerce functionality
- **OpenAPI_Spec**: The OpenAPI 3.0.1 specification document defining the API endpoints and schemas
- **JWT**: JSON Web Token used for user authentication and authorization
- **Session_ID**: A unique identifier used to track anonymous cart sessions
- **Product_Variant**: A specific combination of product color and size with its own inventory quantity
- **Discount_Code**: A promotional code that applies a percentage discount to cart totals

## Requirements

### Requirement 1: Project Setup and Server Configuration

**User Story:** As a developer, I want a properly configured Node.js project, so that I can run and develop the API locally.

#### Acceptance Criteria

1. THE ScrubStore_API SHALL use Node.js with Express framework
2. THE ScrubStore_API SHALL use SQLite database for data persistence (free, no setup required)
3. THE ScrubStore_API SHALL run on a configurable port (default 3000)
4. THE ScrubStore_API SHALL include CORS support for cross-origin requests
5. THE ScrubStore_API SHALL parse JSON request bodies up to 10MB for file uploads

### Requirement 2: Authentication System

**User Story:** As a user, I want to register, login, and manage my account, so that I can access protected features.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/Authentication/Register with email, username, and password, THE ScrubStore_API SHALL create a new user and return success response
2. WHEN a POST request is sent to /api/Authentication/Login with valid credentials, THE ScrubStore_API SHALL return a JWT access token and refresh token
3. WHEN a POST request is sent to /api/Authentication/ChangePassword with valid current password, THE ScrubStore_API SHALL update the user password
4. WHEN a POST request is sent to /api/Authentication/refreshToken with valid refresh token, THE ScrubStore_API SHALL return a new access token
5. THE ScrubStore_API SHALL validate password with minimum 8 characters and at least one uppercase letter
6. IF invalid credentials are provided, THEN THE ScrubStore_API SHALL return 401 Unauthorized response

### Requirement 3: Product Management

**User Story:** As a store admin, I want to manage products with full CRUD operations, so that I can maintain the product catalog.

#### Acceptance Criteria

1. WHEN a GET request is sent to /api/Product with pageNumber and pageSize, THE ScrubStore_API SHALL return paginated product list
2. WHEN a GET request is sent to /api/Product/{ProductId}, THE ScrubStore_API SHALL return complete product details including variants, colors, and categories
3. WHEN a POST request is sent to /api/Product with product data, THE ScrubStore_API SHALL create a new product with bilingual names (Arabic/English)
4. WHEN a PUT request is sent to /api/Product/{id}, THE ScrubStore_API SHALL update the product details
5. WHEN a DELETE request is sent to /api/Product/{id}, THE ScrubStore_API SHALL remove the product
6. THE ScrubStore_API SHALL support product search by keyword via /api/Product/Search
7. THE ScrubStore_API SHALL support product filtering by price range, color, and size via /api/Product/Filter

### Requirement 4: Product Variants and Inventory

**User Story:** As a store admin, I want to manage product variants with sizes and colors, so that I can track inventory accurately.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/Product/ProductVariant, THE ScrubStore_API SHALL create product variants with colorId, sizeId, and quantity
2. WHEN a PUT request is sent to /api/Product/ProductVariant, THE ScrubStore_API SHALL update variant details
3. WHEN a DELETE request is sent to /api/Product/{productId}/variants/{variantId}, THE ScrubStore_API SHALL remove the variant
4. THE ScrubStore_API SHALL track inventory quantity per variant
5. THE ScrubStore_API SHALL support products with GenderType enum (Men, Women, Unisex)

### Requirement 5: Category Management

**User Story:** As a store admin, I want to manage product categories, so that I can organize products.

#### Acceptance Criteria

1. WHEN a GET request is sent to /api/Category, THE ScrubStore_API SHALL return paginated category list
2. WHEN a GET request is sent to /api/Category/{categoryId}, THE ScrubStore_API SHALL return category details
3. WHEN a POST request is sent to /api/Category with arabicName and englishName, THE ScrubStore_API SHALL create a new category with UUID
4. WHEN a PUT request is sent to /api/Category, THE ScrubStore_API SHALL update category names
5. WHEN a DELETE request is sent to /api/Category/{categoryId}, THE ScrubStore_API SHALL remove the category

### Requirement 6: Color and Size Management

**User Story:** As a store admin, I want to manage colors and sizes, so that I can define product options.

#### Acceptance Criteria

1. WHEN a GET request is sent to /api/Color, THE ScrubStore_API SHALL return all colors with Arabic name, English name, and hex code
2. WHEN a POST request is sent to /api/Color with color list, THE ScrubStore_API SHALL create multiple colors
3. WHEN a DELETE request is sent to /api/Color/{id}, THE ScrubStore_API SHALL remove the color
4. WHEN a GET request is sent to /api/Size, THE ScrubStore_API SHALL return all available sizes

### Requirement 7: Shopping Cart

**User Story:** As a customer, I want to manage my shopping cart, so that I can prepare for checkout.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/Cart with productId, colorId, sizeId, and quantity, THE ScrubStore_API SHALL add item to cart identified by Session_ID
2. WHEN a GET request is sent to /api/Cart/SessionId, THE ScrubStore_API SHALL return all cart items for that session
3. WHEN a PUT request is sent to /api/Cart/Items/Quantity, THE ScrubStore_API SHALL update item quantity
4. WHEN a GET request is sent to /api/Cart/Items/Number, THE ScrubStore_API SHALL return total number of items in cart
5. WHEN a GET request is sent to /api/Cart/Items/Price, THE ScrubStore_API SHALL return total cart price
6. WHEN a DELETE request is sent to /api/Cart/Item/{ItemId}/{SessionId}, THE ScrubStore_API SHALL remove specific item
7. WHEN a DELETE request is sent to /api/Cart/Cart/{SessionId}, THE ScrubStore_API SHALL clear entire cart

### Requirement 8: Discount System

**User Story:** As a store admin, I want to manage discount codes, so that I can run promotions.

#### Acceptance Criteria

1. WHEN a GET request is sent to /api/Discount, THE ScrubStore_API SHALL return all discount codes
2. WHEN a POST request is sent to /api/Discount/create with code, percentage, and expirationDate, THE ScrubStore_API SHALL create a new Discount_Code
3. WHEN a PUT request is sent to /api/Discount/update, THE ScrubStore_API SHALL update discount details
4. WHEN a POST request is sent to /api/Cart/Discount with sessionid and discountcode, THE ScrubStore_API SHALL apply discount to cart
5. WHEN a DELETE request is sent to /api/Cart/Discount, THE ScrubStore_API SHALL remove discount from cart
6. IF discount code is expired or inactive, THEN THE ScrubStore_API SHALL return error response

### Requirement 9: Order Management

**User Story:** As a customer, I want to place and track orders, so that I can complete purchases.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/Orders with customer details and sessionId, THE ScrubStore_API SHALL create order from cart items
2. WHEN a GET request is sent to /api/Orders with pagination, THE ScrubStore_API SHALL return paginated order list
3. WHEN a GET request is sent to /api/Orders/{id}, THE ScrubStore_API SHALL return order details with items
4. WHEN a GET request is sent to /api/Orders/user with sessionId, THE ScrubStore_API SHALL return orders for that session
5. WHEN a GET request is sent to /api/Orders/filter-status, THE ScrubStore_API SHALL filter orders by OrderStatus (Pending, Delivered, Cancelled)
6. WHEN a GET request is sent to /api/Orders/filter-date with from and to, THE ScrubStore_API SHALL filter orders by date range
7. WHEN a PUT request is sent to /api/Orders/{id}/status, THE ScrubStore_API SHALL update order status

### Requirement 10: Product Reviews

**User Story:** As a customer, I want to review products I purchased, so that I can share my experience.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/Reviews with orderItemId, sessionId, rating (1-5), and comment, THE ScrubStore_API SHALL create a review
2. WHEN a GET request is sent to /api/Reviews/{reviewId}, THE ScrubStore_API SHALL return review details
3. WHEN a PUT request is sent to /api/Reviews, THE ScrubStore_API SHALL update review rating and comment
4. WHEN a DELETE request is sent to /api/Reviews/{reviewId}, THE ScrubStore_API SHALL remove the review
5. THE ScrubStore_API SHALL validate rating is between 1 and 5
6. THE ScrubStore_API SHALL limit comment to 1000 characters

### Requirement 11: Product Pictures

**User Story:** As a store admin, I want to manage product photos, so that I can showcase products visually.

#### Acceptance Criteria

1. WHEN a POST request is sent to /api/Picture/add-photos with ProductId and color-specific photos, THE ScrubStore_API SHALL store photo references
2. WHEN a DELETE request is sent to /api/Picture/{productId}/photos/{photoId}, THE ScrubStore_API SHALL remove the photo
3. THE ScrubStore_API SHALL support marking one photo as main per color
4. THE ScrubStore_API SHALL store photos in local filesystem or as base64 in database
