# Requirements Document

## Introduction

This feature connects the existing UI-only Promotions admin page in the SK Bags e-commerce store to a fully functional backend, cart engine, and product display layer. The system covers four promotion types already modelled in the database: **Discount Codes** (`promo_codes` table), **Get Gift**, **Buy 1 Get 1 (BOGO)**, and **Free Shipping** (all three via the `quick_promotions` table). The goal is to replace all hardcoded mock data with real Supabase CRUD, apply promotion logic automatically in the cart and checkout flow, surface promotion badges on product pages, and record applied promotions on completed orders.

---

## Glossary

- **Promotions_System**: The complete feature described in this document, spanning admin, cart, product pages, and order recording.
- **Admin_Panel**: The Next.js admin interface at `/admin/promotions`.
- **Promo_Code**: A customer-entered alphanumeric code stored in the `promo_codes` Supabase table that grants a percentage or fixed-amount discount.
- **Quick_Promotion**: A rule stored in the `quick_promotions` Supabase table that is applied automatically without a code (BOGO, Get Gift, Free Shipping).
- **BOGO**: Buy-One-Get-One promotion — when a customer adds 2 or more eligible products to the cart, the cheapest item becomes free.
- **Get_Gift**: A promotion where purchasing any eligible product entitles the customer to a free physical gift item.
- **Free_Shipping**: A promotion that waives the shipping fee when the cart subtotal meets or exceeds a configured minimum order amount.
- **Cart_Engine**: The client-side logic in `useCart.tsx` and `localStorage.ts` that manages cart state.
- **Promotion_Service**: The new TypeScript service module (`src/services/promotions.ts`) that encapsulates all Supabase calls for promotions.
- **Discount_Validator**: The client-side utility that validates a Promo_Code against Supabase before applying it to the cart.
- **Applied_Promotions**: A JSON string stored in the `orders.applied_promotions` column recording every promotion applied to a completed order.
- **Promotion_Badge**: A visual label rendered on a product detail page indicating an active promotion applies to that product.
- **RLS**: Row-Level Security policies in Supabase controlling read/write access.

---

## Requirements

### Requirement 1: Promotion Service Layer

**User Story:** As a developer, I want a centralised Supabase service for promotions, so that all admin and storefront code reads and writes promotion data through a single, consistent API.

#### Acceptance Criteria

1. THE Promotion_Service SHALL expose CRUD operations (`getAll`, `getById`, `create`, `update`, `delete`) for both `promo_codes` and `quick_promotions` tables.
2. WHEN a `delete` operation is called on a `promo_code`, THE Promotion_Service SHALL perform a soft-delete by setting `deleted_at` to the current timestamp.
3. WHEN a `delete` operation is called on a `quick_promotion`, THE Promotion_Service SHALL set `is_active` to `0` and `updated_at` to the current timestamp.
4. THE Promotion_Service SHALL expose a `validatePromoCode(code: string, cartSubtotal: number): Promise<ValidationResult>` function that checks: the code exists and is not soft-deleted, `is_active = 1`, the current date is within `start_date` and `end_date` (if set), `usage_count < usage_limit` (if a limit is set), and `cartSubtotal >= min_order_amount` (if set).
5. THE Promotion_Service SHALL expose a `getActiveQuickPromotions(): Promise<QuickPromotion[]>` function that returns all records where `is_active = 1` and the current date is within `start_date`/`end_date` bounds.
6. THE Promotion_Service SHALL expose an `incrementUsage(promoCodeId: string): Promise<void>` function that increments `usage_count` by 1 for the given promo code.
7. WHEN any Supabase call fails, THE Promotion_Service SHALL throw a typed `PromotionServiceError` containing the original error and a human-readable message.

---

### Requirement 2: RLS Policies for Promotions Tables

**User Story:** As a store owner, I want the promotions tables to be accessible to the public for reading active promotions, so that the storefront can validate codes and display badges without requiring authentication.

#### Acceptance Criteria

1. THE Supabase_Database SHALL have RLS enabled on the `quick_promotions` table.
2. WHEN an unauthenticated request reads from `quick_promotions`, THE Supabase_Database SHALL return only rows where `is_active = 1`.
3. WHEN an unauthenticated request reads from `promo_codes`, THE Supabase_Database SHALL return only rows where `is_active = 1` AND `deleted_at IS NULL`.
4. THE Supabase_Database SHALL allow INSERT, UPDATE, and DELETE on both tables only for authenticated admin users (service-role key or authenticated role with admin claim).

---

### Requirement 3: Admin Panel — Discount Codes CRUD

**User Story:** As an admin, I want to create, edit, and delete discount codes that are saved to Supabase, so that customers can use real promo codes at checkout.

#### Acceptance Criteria

1. WHEN the Admin_Panel loads the Discount Codes tab, THE Admin_Panel SHALL fetch all non-deleted promo codes from Supabase via the Promotion_Service and display them in the existing table UI.
2. WHEN an admin submits the create/edit form for a discount code, THE Admin_Panel SHALL call the Promotion_Service `create` or `update` function with the form values and display a success toast on completion.
3. IF the Promotion_Service returns an error during save, THEN THE Admin_Panel SHALL display an error toast with the error message and leave the modal open.
4. WHEN an admin confirms deletion of a discount code, THE Admin_Panel SHALL call the Promotion_Service `delete` function and remove the row from the displayed list on success.
5. THE Admin_Panel SHALL display a loading spinner inside the modal save button while the Supabase call is in progress.
6. WHEN the admin sets a `usageLimit`, THE Admin_Panel SHALL store it as an integer in the `usage_limit` column; WHEN left blank, THE Admin_Panel SHALL store `NULL`.
7. THE Admin_Panel SHALL store the promo code value in uppercase in the `code` column.

---

### Requirement 4: Admin Panel — Get Gift CRUD

**User Story:** As an admin, I want to create, edit, and delete "Get Gift" promotions backed by Supabase, so that eligible products automatically show a gift badge to customers.

#### Acceptance Criteria

1. WHEN the Admin_Panel loads the Get Gift tab, THE Admin_Panel SHALL fetch all active `quick_promotions` records where `promo_type = 'free_gift_min_amount'` from Supabase and display them.
2. WHEN an admin saves a Get Gift promotion, THE Admin_Panel SHALL write a `quick_promotions` record with `promo_type = 'free_gift_min_amount'`, `applies_to = 'product'`, the selected product IDs serialised as a JSON array in `product_ids`, and `badge_text_en` / `badge_text_ar` set to the gift description.
3. WHEN an admin deletes a Get Gift promotion, THE Admin_Panel SHALL set `is_active = 0` on the corresponding `quick_promotions` record.
4. IF no products are selected when saving a Get Gift promotion, THEN THE Admin_Panel SHALL display a validation error "Please select at least one product" and prevent submission.

---

### Requirement 5: Admin Panel — BOGO CRUD

**User Story:** As an admin, I want to create, edit, and delete BOGO promotions backed by Supabase, so that the cart engine can automatically apply the cheapest-item-free rule.

#### Acceptance Criteria

1. WHEN the Admin_Panel loads the BOGO tab, THE Admin_Panel SHALL fetch all active `quick_promotions` records where `promo_type = 'buy_x_get_y_free'` from Supabase and display them.
2. WHEN an admin saves a BOGO promotion, THE Admin_Panel SHALL write a `quick_promotions` record with `promo_type = 'buy_x_get_y_free'`, `buy_quantity = 2`, `get_quantity = 1`, `discount_type = 'free'`, `applies_to = 'product'`, and the selected product IDs serialised as a JSON array in `product_ids`.
3. WHEN an admin deletes a BOGO promotion, THE Admin_Panel SHALL set `is_active = 0` on the corresponding `quick_promotions` record.
4. IF no products are selected when saving a BOGO promotion, THEN THE Admin_Panel SHALL display a validation error "Please select at least one product" and prevent submission.

---

### Requirement 6: Admin Panel — Free Shipping Configuration

**User Story:** As an admin, I want to configure a free shipping threshold that is saved to Supabase, so that the cart automatically waives shipping fees for qualifying orders.

#### Acceptance Criteria

1. WHEN the Admin_Panel loads the Free Shipping tab, THE Admin_Panel SHALL fetch the single active `quick_promotions` record where `promo_type = 'free_shipping_min_amount'` from Supabase and pre-populate the minimum order input and the enable/disable toggle.
2. WHEN an admin saves the Free Shipping configuration, THE Admin_Panel SHALL upsert a `quick_promotions` record with `promo_type = 'free_shipping_min_amount'`, `applies_to = 'shipping'`, and `min_amount` set to the entered value.
3. WHEN an admin toggles Free Shipping off, THE Admin_Panel SHALL set `is_active = 0` on the record; WHEN toggled on, THE Admin_Panel SHALL set `is_active = 1`.
4. IF the minimum order value is not a positive number when saving, THEN THE Admin_Panel SHALL display a validation error "Please enter a valid minimum order amount" and prevent submission.

---

### Requirement 7: Discount Code Validation in Cart

**User Story:** As a customer, I want to enter a promo code in the cart and have it validated against the live database, so that I receive the correct discount on my order.

#### Acceptance Criteria

1. WHEN a customer enters a promo code and clicks "Apply", THE Discount_Validator SHALL call `Promotion_Service.validatePromoCode` with the entered code (uppercased) and the current cart subtotal.
2. WHEN the validation succeeds, THE Cart_Engine SHALL apply the discount amount to the cart total and display the code and saved amount in the order summary.
3. IF the promo code does not exist or is inactive, THEN THE Discount_Validator SHALL display the error message "Invalid or expired promo code" in the cart UI.
4. IF the promo code's `min_order_amount` exceeds the cart subtotal, THEN THE Discount_Validator SHALL display the message "Minimum order of [amount] EGP required for this code".
5. IF the promo code has reached its `usage_limit`, THEN THE Discount_Validator SHALL display the message "This promo code has reached its usage limit".
6. WHILE a validation request is in progress, THE Cart_Engine SHALL disable the apply button and show a loading indicator.
7. WHEN a customer removes an applied promo code, THE Cart_Engine SHALL restore the original cart total and clear the discount display.

---

### Requirement 8: BOGO Automatic Application in Cart

**User Story:** As a customer, I want the BOGO discount to be applied automatically when I add 2 or more eligible products to my cart, so that I receive the cheapest item for free without entering a code.

#### Acceptance Criteria

1. WHEN the cart contains 2 or more items whose `productId` appears in any active BOGO promotion's `product_ids`, THE Cart_Engine SHALL identify the eligible item with the lowest unit price and set its effective price to 0 EGP.
2. THE Cart_Engine SHALL recalculate the cart total to reflect the BOGO discount whenever items are added, removed, or quantities are changed.
3. WHEN a BOGO discount is active, THE Cart_Engine SHALL display a "Buy 1 Get 1 Free" banner in the cart summary section showing the amount saved.
4. IF the cart drops below 2 eligible BOGO items, THEN THE Cart_Engine SHALL remove the BOGO discount and restore the original item price.
5. THE Cart_Engine SHALL apply at most one BOGO discount per cart (the highest-priority active BOGO promotion wins when multiple exist).

---

### Requirement 9: Free Shipping Automatic Application in Cart

**User Story:** As a customer, I want free shipping to be applied automatically when my cart total meets the configured threshold, so that I am not charged for shipping on qualifying orders.

#### Acceptance Criteria

1. WHEN the cart subtotal is greater than or equal to the active Free Shipping `min_amount`, THE Cart_Engine SHALL set the shipping cost to 0 EGP.
2. WHEN the cart subtotal falls below the Free Shipping `min_amount`, THE Cart_Engine SHALL restore the standard shipping cost.
3. WHEN Free Shipping is active in the cart, THE Cart_Engine SHALL display a "Free Shipping Applied" badge in the order summary.
4. WHEN the cart subtotal is below the Free Shipping threshold, THE Cart_Engine SHALL display a progress indicator showing how much more the customer needs to spend to qualify (e.g., "Add [X] EGP more for free shipping").
5. IF no active Free Shipping promotion exists in Supabase, THEN THE Cart_Engine SHALL not display any free shipping UI elements.

---

### Requirement 10: Promotion Badges on Product Pages

**User Story:** As a customer, I want to see promotion badges on product detail pages, so that I know which products qualify for BOGO or Get Gift offers before adding them to my cart.

#### Acceptance Criteria

1. WHEN a product detail page loads, THE Promotions_System SHALL fetch all active Quick_Promotions from Supabase via `Promotion_Service.getActiveQuickPromotions`.
2. WHEN the loaded product's ID appears in an active BOGO promotion's `product_ids`, THE Promotions_System SHALL render a "Buy 1 Get 1 Free" badge on the product detail page.
3. WHEN the loaded product's ID appears in an active Get Gift promotion's `product_ids`, THE Promotions_System SHALL render a badge displaying the `badge_text_en` or `badge_text_ar` value (based on the active locale) on the product detail page.
4. WHEN multiple promotions apply to the same product, THE Promotions_System SHALL display all applicable badges.
5. THE Promotions_System SHALL cache the active Quick_Promotions response for 5 minutes using React Query to avoid redundant Supabase calls on every product page navigation.

---

### Requirement 11: Order Recording of Applied Promotions

**User Story:** As a store owner, I want every applied promotion to be recorded on the order, so that I can audit discounts and track promotion performance.

#### Acceptance Criteria

1. WHEN an order is placed and a Promo_Code was applied, THE Promotions_System SHALL serialise the promo code details (code, discount type, discount value, amount saved) as a JSON object and store it in `orders.applied_promotions`.
2. WHEN an order is placed and a BOGO discount was applied, THE Promotions_System SHALL include the BOGO promotion ID, name, and amount saved in the `orders.applied_promotions` JSON.
3. WHEN an order is placed and Free Shipping was applied, THE Promotions_System SHALL include the Free Shipping promotion ID and the shipping amount waived in the `orders.applied_promotions` JSON.
4. WHEN an order is placed and a Promo_Code was applied, THE Promotions_System SHALL call `Promotion_Service.incrementUsage` to increment the `usage_count` on the `promo_codes` record.
5. IF the `incrementUsage` call fails after a successful order creation, THEN THE Promotions_System SHALL log the error to the console without blocking the order confirmation flow.

---

### Requirement 12: Bilingual Support (Arabic / English)

**User Story:** As a customer browsing in Arabic, I want all promotion-related UI text to appear in Arabic, so that the shopping experience is consistent with the rest of the store.

#### Acceptance Criteria

1. THE Promotions_System SHALL display promotion badge text using `badge_text_ar` when the active locale is `ar` and `badge_text_en` when the locale is `en`.
2. THE Promotions_System SHALL display cart promotion banners (BOGO, Free Shipping) using the Arabic translation keys when the active locale is `ar`.
3. THE Admin_Panel SHALL accept and store both `name_en` / `name_ar` and `badge_text_en` / `badge_text_ar` fields for all Quick_Promotions.
4. WHEN the admin form for a Quick_Promotion is submitted with an empty `name_ar` field, THE Admin_Panel SHALL auto-fill `name_ar` with the value of `name_en` as a fallback.
