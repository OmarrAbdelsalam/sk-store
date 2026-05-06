# Design Document — Promotions System

## Overview

This document describes the technical design for connecting the existing UI-only Promotions admin page to Supabase, applying promotion logic in the cart, surfacing badges on product pages, and recording applied promotions on orders.

The implementation follows the existing patterns in the codebase: direct Supabase client calls from service modules, React Query for data fetching, localStorage-based cart state, and shadcn/ui components.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Admin Panel                          │
│  Promotions.tsx  ──►  promotionService  ──►  Supabase       │
│  (4 tabs: Codes, Gift, BOGO, Free Shipping)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                    promotionService.ts
                    (single source of truth)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        promo_codes    quick_promotions    (RLS policies)
        (Supabase)      (Supabase)
              │               │
              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storefront                             │
│                                                             │
│  usePromotions.ts  ──►  getActiveQuickPromotions()          │
│       │                                                     │
│       ├──►  PromotionBadges.tsx  (product detail page)      │
│       ├──►  OrderSummary.tsx     (BOGO banner, free ship)   │
│       └──►  useCart.tsx          (BOGO + free ship logic)   │
│                                                             │
│  useDiscount.ts  ──►  validatePromoCode()  ──►  Supabase    │
│       └──►  OrderSummary / DiscountSummary                  │
│                                                             │
│  orderService.create()  ──►  applied_promotions JSON        │
│                         ──►  incrementUsage()               │
└─────────────────────────────────────────────────────────────┘
```

---

## Components & Files

### 1. `src/services/promotions.ts` — NEW

Central service for all promotion Supabase operations.

```typescript
// Types
export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface QuickPromotion {
  id: string;
  promo_type: 'buy_x_get_y_free' | 'free_gift_min_amount' | 'free_shipping_min_amount';
  name_en: string;
  name_ar: string;
  badge_text_en: string | null;
  badge_text_ar: string | null;
  product_ids: string | null;   // JSON array string e.g. '["uuid1","uuid2"]'
  min_amount: number | null;
  discount_type: 'percentage' | 'fixed' | 'free' | null;
  discount_value: number | null;
  applies_to: 'all' | 'category' | 'product' | 'shipping';
  is_active: number;
  priority: number;
  start_date: string | null;
  end_date: string | null;
}

export interface ValidationResult {
  valid: boolean;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;  // calculated against cartSubtotal
  promoCodeId?: string;
  errorCode?: 'NOT_FOUND' | 'INACTIVE' | 'EXPIRED' | 'USAGE_LIMIT' | 'MIN_ORDER';
  errorMessage?: string;
}

export class PromotionServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'PromotionServiceError';
  }
}

// promo_codes CRUD
export const promotionService = {
  // Promo Codes
  getAllPromoCodes(): Promise<PromoCode[]>
  createPromoCode(input: PromoCodeInput): Promise<PromoCode>
  updatePromoCode(id: string, input: PromoCodeInput): Promise<PromoCode>
  deletePromoCode(id: string): Promise<void>  // soft-delete: sets deleted_at

  // Quick Promotions
  getQuickPromotions(promoType?: string): Promise<QuickPromotion[]>
  createQuickPromotion(input: QuickPromotionInput): Promise<QuickPromotion>
  updateQuickPromotion(id: string, input: QuickPromotionInput): Promise<QuickPromotion>
  deactivateQuickPromotion(id: string): Promise<void>  // sets is_active = 0

  // Storefront
  validatePromoCode(code: string, cartSubtotal: number): Promise<ValidationResult>
  getActiveQuickPromotions(): Promise<QuickPromotion[]>
  incrementUsage(promoCodeId: string): Promise<void>
}
```

**Key logic in `validatePromoCode`:**
1. Fetch by `code = UPPER(input)` where `is_active = 1` and `deleted_at IS NULL`
2. Check date range if `start_date`/`end_date` set
3. Check `usage_count < usage_limit` if limit set
4. Check `cartSubtotal >= min_order_amount` if set
5. Calculate `discountAmount`: for percentage → `cartSubtotal * (value/100)`, for fixed → `value`
6. Return `ValidationResult`

---

### 2. `src/hooks/usePromotions.ts` — NEW

React Query hook for storefront use. Caches for 5 minutes.

```typescript
export function useActivePromotions() {
  return useQuery({
    queryKey: ['active-quick-promotions'],
    queryFn: () => promotionService.getActiveQuickPromotions(),
    staleTime: 5 * 60 * 1000,
  });
}

// Helper: get promotions applicable to a specific product
export function useProductPromotions(productId: string) {
  const { data: promotions = [] } = useActivePromotions();
  return promotions.filter(p => {
    if (!p.product_ids) return false;
    try {
      const ids: string[] = JSON.parse(p.product_ids);
      return ids.includes(productId);
    } catch { return false; }
  });
}
```

---

### 3. `src/hooks/useDiscount.ts` — REWRITE

Replace the broken `/lib/api/discount` call with direct `promotionService.validatePromoCode`.

```typescript
export function useDiscount() {
  const applyDiscountCode = async (code: string, cartSubtotal: number) => {
    const result = await promotionService.validatePromoCode(code, cartSubtotal);
    if (result.valid) {
      // store in cart via useCart.applyDiscount(code, result.discountAmount)
      return { success: true, ...result };
    } else {
      return { success: false, error: result.errorMessage };
    }
  };
  // ...
}
```

---

### 4. `src/lib/localStorage.ts` — EXTEND

Add fields to `LocalCart` for BOGO and free shipping state:

```typescript
export interface LocalCart {
  // existing fields...
  bogoDiscount: number;          // amount saved from BOGO (0 if none)
  bogoPromotionId?: string;      // ID of applied BOGO promotion
  freeShippingApplied: boolean;  // true if free shipping threshold met
  freeShippingPromotionId?: string;
  appliedPromotions: AppliedPromotion[];  // for order recording
}

export interface AppliedPromotion {
  type: 'promo_code' | 'bogo' | 'free_shipping' | 'get_gift';
  promotionId: string;
  name: string;
  amountSaved: number;
  code?: string;  // for promo_code type
}
```

Add new localStorage functions:
- `applyBogoToCart(promotionId: string, bogoDiscount: number): LocalCart`
- `removeBogoFromCart(): LocalCart`
- `applyFreeShippingToCart(promotionId: string): LocalCart`
- `removeFreeShippingFromCart(): LocalCart`

---

### 5. `src/hooks/useCart.tsx` — EXTEND

Add BOGO and free shipping state to cart context:

```typescript
interface CartContextType {
  // existing...
  bogoDiscount: number;
  freeShippingApplied: boolean;
  applyBogo: (promotionId: string, discount: number) => void;
  removeBogo: () => void;
  applyFreeShipping: (promotionId: string) => void;
  removeFreeShipping: () => void;
  appliedPromotions: AppliedPromotion[];
}
```

BOGO calculation logic (runs on every cart change):
```
eligibleItems = cartItems.filter(item => item.productId in bogoPromotion.product_ids)
if (eligibleItems.length >= 2):
  cheapestItem = min(eligibleItems by price)
  bogoDiscount = cheapestItem.price
  applyBogo(promotion.id, bogoDiscount)
else:
  removeBogo()
```

Free shipping logic (runs on every cart change):
```
if (cart.subtotal >= freeShippingPromotion.min_amount):
  applyFreeShipping(promotion.id)
else:
  removeFreeShipping()
```

Both checks run inside a `useEffect` that depends on `[cart.items, activePromotions]`.

---

### 6. `src/components/admin/pages/Promotions.tsx` — REWRITE

Replace all `useState` mock data with React Query + `promotionService` calls.

**Data fetching pattern (matching existing admin pages):**
```typescript
// Discount Codes tab
const { data: discountCodes = [], isLoading: codesLoading, refetch: refetchCodes } = useQuery({
  queryKey: ['admin-promo-codes'],
  queryFn: () => promotionService.getAllPromoCodes(),
});

// Get Gift tab
const { data: getGifts = [], refetch: refetchGifts } = useQuery({
  queryKey: ['admin-quick-promos', 'free_gift_min_amount'],
  queryFn: () => promotionService.getQuickPromotions('free_gift_min_amount'),
});

// BOGO tab
const { data: bogos = [], refetch: refetchBogos } = useQuery({
  queryKey: ['admin-quick-promos', 'buy_x_get_y_free'],
  queryFn: () => promotionService.getQuickPromotions('buy_x_get_y_free'),
});

// Free Shipping tab
const { data: freeShippingList = [] } = useQuery({
  queryKey: ['admin-quick-promos', 'free_shipping_min_amount'],
  queryFn: () => promotionService.getQuickPromotions('free_shipping_min_amount'),
});
```

**Save handler pattern:**
```typescript
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  setIsSaving(true);
  try {
    if (activeTab === 'discount_codes') {
      if (editingItem) await promotionService.updatePromoCode(formData.id, mapFormToPromoCode(formData));
      else await promotionService.createPromoCode(mapFormToPromoCode(formData));
      refetchCodes();
    }
    // similar for other tabs...
    toast.success('Saved successfully!');
    handleCloseModal();
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save');
  } finally {
    setIsSaving(false);
  }
};
```

**Form field mapping:**
- `formData.name` → `code` (uppercase) for discount codes, `name_en` for quick promos
- `formData.type === 'Percentage'` → `discount_type: 'percentage'`
- `formData.value` → `discount_value`
- `formData.usageLimit` → `usage_limit` (null if empty)
- `formData.expires` → `end_date` (null if 'Never')
- `formData.productIds` → `product_ids` (JSON.stringify array)
- `formData.giftName` → `badge_text_en` and `badge_text_ar`
- `formData.minOrder` → `min_amount`

---

### 7. `src/components/product/PromotionBadges.tsx` — NEW

Renders promotion badges on the product detail page.

```typescript
interface PromotionBadgesProps {
  productId: string;
}

export default function PromotionBadges({ productId }: PromotionBadgesProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const promotions = useProductPromotions(productId);

  if (promotions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {promotions.map(promo => {
        if (promo.promo_type === 'buy_x_get_y_free') {
          return (
            <span key={promo.id} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
              <Gift className="w-3 h-3" />
              {isAr ? 'اشتري 1 واحصل على 1 مجاناً' : 'Buy 1 Get 1 Free'}
            </span>
          );
        }
        if (promo.promo_type === 'free_gift_min_amount') {
          const badgeText = isAr ? promo.badge_text_ar : promo.badge_text_en;
          return (
            <span key={promo.id} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full border border-indigo-200">
              <Zap className="w-3 h-3" />
              {badgeText || (isAr ? 'هدية مجانية' : 'Free Gift')}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}
```

**Integration point:** Add `<PromotionBadges productId={product.id} />` inside `ProductInfo.tsx` below the product name/price.

---

### 8. `src/components/cart/OrderSummary.tsx` — UPDATE

Add BOGO banner, free shipping badge, and free shipping progress bar.

New props:
```typescript
type OrderSummaryProps = {
  // existing...
  bogoDiscount?: number;
  freeShippingApplied?: boolean;
  freeShippingThreshold?: number;
  subtotal?: number;
};
```

UI additions:
- **BOGO banner**: green banner showing "Buy 1 Get 1 Free — You saved X EGP"
- **Free shipping badge**: "🚚 Free Shipping Applied" when `freeShippingApplied = true`
- **Progress bar**: when not yet qualified, show "Add X EGP more for free shipping" with a thin progress bar

The `CartPageClient.tsx` passes these values from `useCart()`.

---

### 9. `src/services/orders.ts` — UPDATE

Extend `CreateOrderInput` and `orderService.create()`:

```typescript
export type CreateOrderInput = {
  // existing fields...
  appliedPromotions?: AppliedPromotion[];  // from cart state
  bogoDiscount?: number;
};
```

In `orderService.create()`:
1. Serialize `appliedPromotions` to JSON string → store in `orders.applied_promotions`
2. After successful order creation, if a promo code was applied:
   ```typescript
   const promoCodePromo = input.appliedPromotions?.find(p => p.type === 'promo_code');
   if (promoCodePromo) {
     promotionService.incrementUsage(promoCodePromo.promotionId)
       .catch(err => console.error('Failed to increment promo usage:', err));
   }
   ```

---

### 10. SQL Migration — RLS Policies

Run in Supabase SQL Editor to enable public read on `quick_promotions`:

```sql
-- Enable RLS on quick_promotions
ALTER TABLE quick_promotions ENABLE ROW LEVEL SECURITY;

-- Public can read active quick promotions
CREATE POLICY "Public can read active quick promotions"
  ON quick_promotions FOR SELECT
  USING (is_active = 1);

-- Public can read active promo codes (already exists, verify)
-- CREATE POLICY "Public can read active promo codes"
--   ON promo_codes FOR SELECT
--   USING (is_active = 1 AND deleted_at IS NULL);
```

---

## Data Flow Diagrams

### Promo Code Application Flow
```
Customer types code → clicks Apply
  → useDiscount.applyDiscountCode(code, subtotal)
    → promotionService.validatePromoCode(code, subtotal)
      → Supabase: SELECT from promo_codes WHERE code = UPPER(code)
      → validate: active, dates, usage, min_order
      → return ValidationResult
    → if valid: useCart.applyDiscount(code, discountAmount)
      → localStorage: cart.discountCode = code, cart.discountAmount = X
    → if invalid: show error message in UI
```

### BOGO Auto-Application Flow
```
Cart items change
  → useCart useEffect fires
    → fetch active BOGO promotions (from usePromotions cache)
    → for each BOGO promotion:
        eligibleItems = cartItems where productId in promotion.product_ids
        if eligibleItems.length >= 2:
          cheapest = min price item
          applyBogo(promotion.id, cheapest.price)
        else:
          removeBogo()
    → cart total recalculated: subtotal - discountAmount - bogoDiscount
```

### Order Placement Flow
```
Customer submits checkout
  → collect appliedPromotions from cart state
  → orderService.create({ ...formData, appliedPromotions })
    → INSERT into orders with applied_promotions = JSON.stringify(appliedPromotions)
    → if promoCode applied: promotionService.incrementUsage(promoCodeId) [non-blocking]
  → clearCart()
  → redirect to order-success page
```

---

## File Change Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/services/promotions.ts` | CREATE | Supabase CRUD + validation for promo_codes & quick_promotions |
| `src/hooks/usePromotions.ts` | CREATE | React Query hook for active promotions (5 min cache) |
| `src/hooks/useDiscount.ts` | REWRITE | Use promotionService instead of broken /lib/api/discount |
| `src/lib/localStorage.ts` | EXTEND | Add bogoDiscount, freeShippingApplied, appliedPromotions to LocalCart |
| `src/hooks/useCart.tsx` | EXTEND | Add BOGO/free shipping state + auto-apply logic |
| `src/components/admin/pages/Promotions.tsx` | REWRITE | Wire all 4 tabs to real Supabase CRUD |
| `src/components/product/PromotionBadges.tsx` | CREATE | BOGO + Get Gift badges on product detail page |
| `src/components/product/ProductInfo.tsx` | UPDATE | Add PromotionBadges component |
| `src/components/cart/OrderSummary.tsx` | UPDATE | Add BOGO banner, free shipping badge + progress bar |
| `src/components/cart/CartPageClient.tsx` | UPDATE | Pass promotion state to OrderSummary |
| `src/services/orders.ts` | UPDATE | Record applied_promotions + call incrementUsage |
| `database/supabase-schema.sql` | UPDATE | Add RLS migration SQL for quick_promotions |

---

## Correctness Properties

1. **Promo code discount never exceeds cart subtotal** — `discountAmount = min(calculated, subtotal)`
2. **BOGO applies to at most one item per cart** — only the single cheapest eligible item is made free
3. **Usage count only increments on successful order** — `incrementUsage` called after `orders` INSERT succeeds
4. **Expired/inactive codes always rejected** — validation checks `is_active`, `deleted_at`, and date range before calculating discount
5. **Free shipping threshold is re-evaluated on every cart mutation** — `useEffect` dependency on `cart.items` ensures it's always current
