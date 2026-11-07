/**
 * Tiny bridge to the cart drawer (components/cart/CartDrawer.tsx), so any
 * button can open it without prop drilling or a context.
 *
 * The drawer also opens by itself on every "cart-item-added" (fired by
 * useCart().addToCart). Flows that leave the page right after adding — "Buy
 * now" goes straight to checkout — call suppressCartDrawer() first so the
 * drawer doesn't flash on the way out.
 */

export const CART_DRAWER_OPEN_EVENT = "cart-drawer:open";

let suppressedUntil = 0;

export function openCartDrawer() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_DRAWER_OPEN_EVENT));
}

export function suppressCartDrawer(ms = 2000) {
  suppressedUntil = Date.now() + ms;
}

export function isCartDrawerSuppressed() {
  return Date.now() < suppressedUntil;
}
