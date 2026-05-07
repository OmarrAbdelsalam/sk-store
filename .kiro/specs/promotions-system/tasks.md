# Implementation Plan: Promotions System

## Overview

Wire the SK Bags promotions system end-to-end: create the Supabase service layer, extend localStorage and cart state for BOGO/free-shipping, rewrite the discount hook, rebuild the admin Promotions page with real CRUD, add product badges, update the cart UI, and record applied promotions on orders.

All code is TypeScript. Stack: Next.js 14, React Query, Supabase direct client, shadcn/ui, Tailwind CSS, next-intl.

---

## Tasks

- [x] 1. Run RLS migration in Supabase
  - Open the Supabase SQL Editor for the SK Bags project
  - Run the following SQL to enable public read access on `quick_promotions`:
    ```sql
    ALTER TABLE quick_promotions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Public can read active quick promotions"
      ON quick_promotions FOR SELECT
      USING (is_active = 1);
    ```
  - Verify that the existing `promo_codes` SELECT policy (`is_active = 1 AND deleted_at IS NULL`) is present; create it if missing
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Create `src/services/promotions.ts` — Promotion Service
  - [x] 2.1 Define TypeScript types and error class
    - Export `PromoCode`, `QuickPromotion`, `ValidationResult`, `PromoCodeInput`, `QuickPromotionInput` interfaces matching the Supabase schema
    - Export `PromotionServiceError extends Error` with `originalError` field
    - _Requirements: 1.1, 1.7_

  - [x] 2.2 Implement `promo_codes` CRUD methods
    - `getAllPromoCodes()` — SELECT where `deleted_at IS NULL`, ordered by `created_at DESC`
    - `createPromoCode(input)` — INSERT, return created row
    - `updatePromoCode(id, input)` — UPDATE by id, return updated row
    - `deletePromoCode(id)` — soft-delete: UPDATE `deleted_at = now()`
    - Throw `PromotionServiceError` on any Supabase error
    - _Requirements: 1.1, 1.2, 1.7_

  - [x] 2.3 Implement `quick_promotions` CRUD methods
    - `getQuickPromotions(promoType?)` — SELECT where `is_active = 1`; filter by `promo_type` when provided
    - `createQuickPromotion(input)` — INSERT, return created row
    - `updateQuickPromotion(id, input)` — UPDATE by id, return updated row
    - `deactivateQuickPromotion(id)` — UPDATE `is_active = 0, updated_at = now()`
    - Throw `PromotionServiceError` on any Supabase error
    - _Requirements: 1.1, 1.3, 1.7_

  - [x] 2.4 Implement `validatePromoCode(code, cartSubtotal)`
    - Fetch by `UPPER(code)` where `is_active = 1` and `deleted_at IS NULL`
    - Check date range (`start_date` / `end_date`) if set
    - Check `usage_count < usage_limit` if limit is set
    - Check `cartSubtotal >= min_order_amount` if set
    - Calculate `discountAmount`: percentage → `cartSubtotal * (value/100)`, fixed → `value`; cap at `cartSubtotal`
    - Return `ValidationResult` with appropriate `errorCode` and `errorMessage` on failure
    - _Requirements: 1.4, 7.3, 7.4, 7.5_

  - [x] 2.5 Implement `getActiveQuickPromotions()` and `incrementUsage()`
    - `getActiveQuickPromotions()` — SELECT where `is_active = 1` and current date within `start_date`/`end_date` bounds
    - `incrementUsage(promoCodeId)` — UPDATE `usage_count = usage_count + 1` for the given id
    - _Requirements: 1.5, 1.6_

  - [ ]* 2.6 Write unit tests for `validatePromoCode`
    - Test: valid code returns correct `discountAmount`
    - Test: inactive code returns `errorCode: 'INACTIVE'`
    - Test: expired code returns `errorCode: 'EXPIRED'`
    - Test: usage limit reached returns `errorCode: 'USAGE_LIMIT'`
    - Test: subtotal below minimum returns `errorCode: 'MIN_ORDER'`
    - Test: discount never exceeds cart subtotal (Property 1)
    - _Requirements: 1.4_

- [x] 3. Extend `src/lib/localStorage.ts`
  - [x] 3.1 Add new types and extend `LocalCart` interface
    - Add `AppliedPromotion` interface: `{ type, promotionId, name, amountSaved, code? }`
    - Extend `LocalCart` with: `bogoDiscount: number`, `bogoPromotionId?: string`, `freeShippingApplied: boolean`, `freeShippingPromotionId?: string`, `appliedPromotions: AppliedPromotion[]`
    - Update `getLocalCart()` to initialise new fields with defaults (`bogoDiscount: 0`, `freeShippingApplied: false`, `appliedPromotions: []`) so existing carts deserialise safely
    - _Requirements: 8.1, 9.1, 11.1, 11.2, 11.3_

  - [x] 3.2 Add BOGO and free-shipping helper functions
    - `applyBogoToCart(promotionId, bogoDiscount, promotionName)` — set `bogoDiscount`, `bogoPromotionId`, upsert into `appliedPromotions`, recalculate `total`
    - `removeBogoFromCart()` — zero out `bogoDiscount`, clear `bogoPromotionId`, remove from `appliedPromotions`, recalculate `total`
    - `applyFreeShippingToCart(promotionId, promotionName)` — set `freeShippingApplied = true`, `freeShippingPromotionId`, upsert into `appliedPromotions`
    - `removeFreeShippingFromCart()` — set `freeShippingApplied = false`, clear id, remove from `appliedPromotions`
    - Update `clearLocalCart()` to also reset the new fields
    - _Requirements: 8.1, 8.4, 9.1, 9.2_

- [x] 4. Create `src/hooks/usePromotions.ts`
  - Implement `useActivePromotions()` using `useQuery` with `queryKey: ['active-quick-promotions']`, `queryFn: promotionService.getActiveQuickPromotions`, `staleTime: 5 * 60 * 1000`
  - Implement `useProductPromotions(productId)` — filters active promotions to those whose `product_ids` JSON array includes `productId`; returns empty array on parse error
  - _Requirements: 10.1, 10.5_

- [x] 5. Rewrite `src/hooks/useDiscount.ts`
  - Remove the broken `applyDiscount` import from `@/lib/api/discount`
  - Rewrite `applyDiscountCode(code, cartSubtotal)` to call `promotionService.validatePromoCode(code.toUpperCase(), cartSubtotal)`
  - On success: call `useCart().applyDiscount(code, result.discountAmount)` and store `promoCodeId` in local state for later use by order recording
  - On failure: map `errorCode` to the user-facing messages defined in Requirements 7.3–7.5
  - Keep the same return shape (`{ discount, isApplying, error, applyDiscountCode, removeDiscount, clearError }`) so existing call sites don't break
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 6. Extend `src/hooks/useCart.tsx`
  - [x] 6.1 Add BOGO and free-shipping state to `CartContextType` and provider
    - Add to context: `bogoDiscount: number`, `freeShippingApplied: boolean`, `applyBogo`, `removeBogo`, `applyFreeShipping`, `removeFreeShipping`, `appliedPromotions: AppliedPromotion[]`
    - Implement each action by calling the corresponding `localStorage.ts` helper and calling `setCart` with the result
    - Expose `bogoDiscount` and `freeShippingApplied` from `cart` state in `contextValue`
    - _Requirements: 8.1, 8.3, 9.1, 9.3_

  - [x] 6.2 Add BOGO auto-apply `useEffect`
    - Depend on `[cart?.items, activePromotions]` (consume `useActivePromotions()` inside the provider)
    - For each active `buy_x_get_y_free` promotion, parse `product_ids` and find eligible cart items
    - If `eligibleItems.length >= 2`: find cheapest by unit price, call `applyBogo(promotion.id, cheapestPrice, promotion.name_en)`
    - Else: call `removeBogo()`
    - Apply at most one BOGO (highest `priority` wins)
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [x] 6.3 Add free-shipping auto-apply `useEffect`
    - Depend on `[cart?.subtotal, activePromotions]`
    - Find the active `free_shipping_min_amount` promotion
    - If `cart.subtotal >= promotion.min_amount`: call `applyFreeShipping(promotion.id, promotion.name_en)`
    - Else: call `removeFreeShipping()`
    - If no active free-shipping promotion exists, do nothing
    - _Requirements: 9.1, 9.2, 9.5_

  - [ ]* 6.4 Write unit tests for BOGO auto-apply logic
    - Test: 2 eligible items → cheapest becomes free (Property 2)
    - Test: 1 eligible item → no BOGO applied
    - Test: removing an item drops below threshold → BOGO removed
    - _Requirements: 8.1, 8.4, 8.5_

- [x] 7. Checkpoint — Ensure service, localStorage, and hooks compile and tests pass
  - Run `npx tsc --noEmit` to confirm no type errors in the new files
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Rewrite `src/components/admin/pages/Promotions.tsx`
  - [x] 8.1 Replace mock state with React Query data fetching
    - Remove all `useState` mock arrays (`discountCodes`, `getGifts`, `bogos`, `freeShippingConfig`)
    - Add four `useQuery` calls: `['admin-promo-codes']`, `['admin-quick-promos', 'free_gift_min_amount']`, `['admin-quick-promos', 'buy_x_get_y_free']`, `['admin-quick-promos', 'free_shipping_min_amount']`
    - Show loading spinner in table area while `isLoading` is true
    - _Requirements: 3.1, 4.1, 5.1, 6.1_

  - [x] 8.2 Wire the save handler to real Supabase CRUD
    - Add `isSaving` state; disable and show spinner on the modal save button while saving
    - Map form fields to service input types (uppercase `code`, `discount_type`, `usage_limit` as int or null, `end_date` as ISO string or null, `product_ids` as `JSON.stringify(array)`, `badge_text_en`/`badge_text_ar` from `giftName`, `min_amount` from `minOrder`)
    - For Discount Codes: call `createPromoCode` or `updatePromoCode`, then `refetchCodes()`
    - For Get Gift: validate at least one product selected; call `createQuickPromotion` or `updateQuickPromotion` with `promo_type: 'free_gift_min_amount'`; then `refetchGifts()`
    - For BOGO: validate at least one product selected; call `createQuickPromotion` or `updateQuickPromotion` with `promo_type: 'buy_x_get_y_free'`; then `refetchBogos()`
    - Show `toast.success` on success, `toast.error` with message on failure
    - _Requirements: 3.2, 3.3, 3.5, 3.6, 3.7, 4.2, 4.4, 5.2, 5.4, 12.3, 12.4_

  - [x] 8.3 Wire the delete handler to real Supabase CRUD
    - For Discount Codes: call `deletePromoCode(id)`, then `refetchCodes()`
    - For Get Gift / BOGO: call `deactivateQuickPromotion(id)`, then refetch the relevant list
    - _Requirements: 3.4, 4.3, 5.3_

  - [x] 8.4 Wire the Free Shipping tab to real Supabase upsert
    - On save: call `createQuickPromotion` (if no existing record) or `updateQuickPromotion` with `promo_type: 'free_shipping_min_amount'`, `applies_to: 'shipping'`, `min_amount`
    - On toggle: call `updateQuickPromotion` to set `is_active = 0` or `1`
    - Validate `minOrder` is a positive number before saving
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Create `src/components/product/PromotionBadges.tsx`
  - Accept `productId: string` prop
  - Call `useProductPromotions(productId)` to get applicable promotions
  - Render a green "Buy 1 Get 1 Free" badge (with `Gift` icon) for `buy_x_get_y_free` promotions
  - Render an indigo badge with `badge_text_ar` / `badge_text_en` (locale-aware) for `free_gift_min_amount` promotions; fall back to "Free Gift" / "هدية مجانية"
  - Return `null` when no promotions apply
  - _Requirements: 10.2, 10.3, 10.4, 12.1_

- [x] 10. Update `src/components/product/ProductInfo.tsx`
  - Import and render `<PromotionBadges productId={productId} />` below the product name/price block (inside the `space-y-3` div, after the price row)
  - Add `productId: string` to `ProductInfoProps`
  - Pass `productId` from `ProductDetailContent.tsx` where `<ProductInfo>` is rendered
  - _Requirements: 10.2, 10.3, 10.4_

- [x] 11. Update `src/components/cart/OrderSummary.tsx`
  - [x] 11.1 Add new props for promotion state
    - Extend `OrderSummaryProps` with: `bogoDiscount?: number`, `freeShippingApplied?: boolean`, `freeShippingThreshold?: number`, `subtotal?: number`
    - Update the `total` calculation to subtract `bogoDiscount` in addition to `discount?.amount`
    - _Requirements: 8.3, 9.3_

  - [x] 11.2 Render BOGO banner
    - When `bogoDiscount > 0`, render a green banner: "🎁 Buy 1 Get 1 Free — You saved [bogoDiscount] EGP" (Arabic: "اشتري 1 واحصل على 1 مجاناً — وفّرت [X] جنيه")
    - Use `useTranslations` / `useLocale` for bilingual text
    - _Requirements: 8.3, 12.2_

  - [x] 11.3 Render free-shipping badge and progress bar
    - When `freeShippingApplied = true`: render "🚚 Free Shipping Applied" badge (green)
    - When `freeShippingApplied = false` and `freeShippingThreshold` is set: render "Add [threshold - subtotal] EGP more for free shipping" with a thin progress bar (`subtotal / freeShippingThreshold * 100`%)
    - When no threshold is set: render nothing
    - _Requirements: 9.3, 9.4, 9.5, 12.2_

- [x] 12. Update `src/components/cart/CartPageClient.tsx`
  - Destructure `bogoDiscount`, `freeShippingApplied`, `appliedPromotions` from `useCart()`
  - Fetch active promotions via `useActivePromotions()` to get `freeShippingThreshold` (the `min_amount` of the active `free_shipping_min_amount` promotion)
  - Pass `bogoDiscount`, `freeShippingApplied`, `freeShippingThreshold`, and `subtotal` as props to `<OrderSummary>`
  - _Requirements: 8.3, 9.3, 9.4_

- [x] 13. Update `src/services/orders.ts`
  - [x] 13.1 Extend `CreateOrderInput` with promotion fields
    - Add `appliedPromotions?: AppliedPromotion[]` and `bogoDiscount?: number` to `CreateOrderInput`
    - Import `AppliedPromotion` type from `@/lib/localStorage`
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 13.2 Record applied promotions and increment usage in `orderService.create()`
    - In the `supabase.from("orders").insert(...)` call, add `applied_promotions: input.appliedPromotions ? JSON.stringify(input.appliedPromotions) : null`
    - After the successful order INSERT, find any `promo_code` entry in `appliedPromotions`
    - If found, call `promotionService.incrementUsage(promoCodePromo.promotionId)` in a non-blocking `.catch(err => console.error(...))` chain
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 14. Wire `appliedPromotions` through checkout
  - Locate the checkout form submission (in `src/app/[locale]/checkout` or the relevant component that calls `orderService.create`)
  - Destructure `appliedPromotions`, `bogoDiscount`, `discountCode`, `discountAmount` from `useCart()`
  - Pass `appliedPromotions` and `bogoDiscount` into the `CreateOrderInput` when calling `orderService.create()`
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 15. Final checkpoint — Ensure all tests pass
و   - Run `npx tsc --noEmit` to confirm zero type errors across all modified files
  - Manually verify: create a promo code in admin → apply it in cart → place order → confirm `applied_promotions` is recorded in Supabase
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The RLS migration (Task 1) must be run before any storefront promotion fetching will work
- BOGO and free-shipping auto-apply both depend on `useActivePromotions()` being available inside `CartProvider` — import `useActivePromotions` at the top of `useCart.tsx` (it uses React Query which is already set up in the app)
- `AppliedPromotion` is defined in `localStorage.ts` and re-exported from there; import it from that path in `orders.ts` to avoid circular dependencies
- Property tests reference design document properties: Property 1 (discount ≤ subtotal), Property 2 (BOGO applies to at most one item)
