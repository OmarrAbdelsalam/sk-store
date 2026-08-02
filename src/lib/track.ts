"use client";

import { getOrCreateSessionId } from "@/lib/session";

/**
 * Client-side event tracking.
 *
 * Events are queued and flushed in batches via sendBeacon, which survives the
 * page unload that navigation and the EasyKash redirect both cause. A plain
 * fetch would be cancelled mid-flight exactly when the most interesting events
 * fire.
 *
 * Nothing here is allowed to throw into a caller: a tracking failure must never
 * break an add-to-cart.
 */

export type TrackPayload = {
  productId?: string;
  productName?: string;
  colorName?: string;
  quantity?: number;
  value?: number;
  orderId?: string;
  props?: Record<string, unknown>;
};

type QueuedEvent = TrackPayload & {
  eventName: string;
  pageUrl: string;
  occurredAt: string;
};

const FLUSH_DELAY_MS = 2000;
const MAX_QUEUE = 30;

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listenersBound = false;

function deviceType(): "desktop" | "mobile" | "tablet" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

/** Admin pages are staff traffic — counting them would corrupt every report. */
function isTrackablePage(): boolean {
  if (typeof window === "undefined") return false;
  return !window.location.pathname.includes("/admin");
}

function post(url: string, body: unknown): void {
  try {
    const payload = JSON.stringify(body);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking is best-effort */
  }
}

export function flushEvents(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;

  const events = queue;
  queue = [];

  post("/api/track", {
    sessionId: getOrCreateSessionId(),
    deviceType: deviceType(),
    events,
  });
}

function bindUnloadListeners(): void {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;

  // pagehide fires on the EasyKash redirect and on tab close; visibilitychange
  // catches the mobile case where the user switches apps and never comes back.
  window.addEventListener("pagehide", flushEvents);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushEvents();
  });
}

export function track(eventName: string, payload: TrackPayload = {}): void {
  if (!isTrackablePage()) return;

  try {
    bindUnloadListeners();

    queue.push({
      eventName,
      ...payload,
      pageUrl: window.location.pathname,
      occurredAt: new Date().toISOString(),
    });

    if (queue.length >= MAX_QUEUE) {
      flushEvents();
      return;
    }
    if (!flushTimer) {
      flushTimer = setTimeout(flushEvents, FLUSH_DELAY_MS);
    }
  } catch {
    /* tracking is best-effort */
  }
}

// ─────────────────────────────────────────────────────────────
// Abandoned cart snapshot
// ─────────────────────────────────────────────────────────────

export type CartSnapshotItem = {
  productId: string;
  name: string;
  color?: string;
  quantity: number;
  price: number;
  image?: string;
};

export type CartSnapshot = {
  items?: CartSnapshotItem[];
  subtotal?: number;
  customerName?: string;
  phone?: string;
  email?: string;
  government?: string;
  city?: string;
  address?: string;
  promoCodeTried?: string;
  stage?:
    | "cart"
    | "checkout_viewed"
    | "contact_entered"
    | "address_entered"
    | "order_submitted"
    | "payment_started";
};

/**
 * Upsert the visitor's cart and whatever they have typed so far.
 *
 * Called on cart mutations and on checkout field blur — never per keystroke.
 * The server drops half-typed contact details, so partial values here are safe.
 */
export function saveCartSnapshot(snapshot: CartSnapshot): void {
  if (!isTrackablePage()) return;

  try {
    bindUnloadListeners();
    post("/api/track/cart", {
      sessionId: getOrCreateSessionId(),
      deviceType: deviceType(),
      ...snapshot,
    });
  } catch {
    /* tracking is best-effort */
  }
}
