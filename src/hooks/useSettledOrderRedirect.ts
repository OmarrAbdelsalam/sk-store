"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Sends a customer whose payment already went through to the confirmation page.
 *
 * The EasyKash callback is server-to-server: it marks the order paid, but it
 * cannot touch the browser that placed it. So a customer who pays and then hits
 * "back", closes the gateway tab, or is dropped by a redirect that never fires
 * lands on the cart or the checkout with a full basket and no sign that the shop
 * has their money — and the usual next move is to pay a second time.
 *
 * This closes that gap from the browser side: whenever the cart or checkout is
 * shown, any payment reference left behind by the last checkout is re-checked
 * against the status endpoint, which is authoritative (it reads what the
 * HMAC-verified callback wrote, and reconciles with EasyKash when that hasn't
 * landed yet). Once it says settled, the customer goes to /order-success, which
 * is the one place that empties the cart and shows the receipt.
 *
 * Nothing happens for an unsettled reference: an abandoned or declined payment
 * must leave the cart exactly as it was so the customer can retry.
 */

/** Throttles repeat checks of the same reference — the status route calls out
 *  to EasyKash for anything still open, so a tab switch must not spam it. */
const RECHECK_INTERVAL_MS = 30_000;
const lastCheckedAt = new Map<string, number>();

function storedPaymentRef(): string | null {
  try {
    const raw = localStorage.getItem("last_order_data");
    if (!raw) return null;
    const ref = JSON.parse(raw)?.easykashCustomerRef;
    return ref === null || ref === undefined || ref === "" ? null : String(ref);
  } catch {
    return null;
  }
}

export function useSettledOrderRedirect({ enabled = true }: { enabled?: boolean } = {}) {
  const router = useRouter();
  // Survives re-renders so a redirect is only ever triggered once per mount.
  const redirecting = useRef(false);
  const inFlight = useRef(false);

  const check = useCallback(async () => {
    if (!enabled || redirecting.current || inFlight.current) return;

    const ref = storedPaymentRef();
    if (!ref) return;

    const last = lastCheckedAt.get(ref) ?? 0;
    if (Date.now() - last < RECHECK_INTERVAL_MS) return;

    inFlight.current = true;
    try {
      const res = await fetch(
        `/api/payments/easykash/status?ref=${encodeURIComponent(ref)}`,
        { cache: "no-store" }
      );
      lastCheckedAt.set(ref, Date.now());

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.succeeded || !json.data) return;

      const status = json.data.paymentStatus as string;
      // A cash voucher (Fawry/Aman) reports as "pending" because the money
      // hasn't been handed over yet, but the customer is holding a code and is
      // done with the cart. "pending" without a voucher is the opposite case —
      // the payment page was opened and abandoned — so it stays put.
      const hasVoucher = Boolean(json.data.order?.easykash_voucher);
      const settled =
        status === "paid" ||
        status === "delivered" ||
        (status === "pending" && hasVoucher);

      if (!settled) return;

      redirecting.current = true;
      // replace, not push: the cart they just left is not somewhere "back"
      // should return them to now that the order is paid for. Unprefixed —
      // routing is `localePrefix: 'never'`, so /en/… only costs a redirect and
      // /ar/… doesn't resolve at all.
      router.replace(`/order-success?ref=${encodeURIComponent(ref)}`);
    } catch {
      // Offline, or the endpoint is down. Saying nothing leaves the customer
      // with their cart intact, which is the safe direction.
    } finally {
      inFlight.current = false;
    }
  }, [enabled, router]);

  useEffect(() => {
    check();

    // Coming back from the gateway with the browser's back button restores this
    // page from the bfcache, so no effect re-runs on its own.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) check();
    };
    // Paying in another tab and switching back to this one.
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [check]);
}
