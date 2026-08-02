export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "expired"
  | "failed"
  | "refunded"
  | "delivered";

export function mapEasykashStatus(status: string | undefined | null): PaymentStatus {
  switch ((status || "").toUpperCase()) {
    case "PAID":
      return "paid";
    case "NEW":
    case "PENDING":
      return "pending";
    case "EXPIRED":
      return "expired";
    case "FAILED":
    case "CANCELLED":
    case "CANCELED":
      return "failed";
    case "REFUNDED":
      return "refunded";
    case "DELIVERED":
      return "delivered";
    default:
      return "pending";
  }
}

/**
 * A transaction as returned by the inquire endpoint. Documented shape:
 * { PaymentMethod, Amount, BuyerName, BuyerEmail, BuyerMobile,
 *   status, voucher, easykashRef }
 */
export type EasykashTransaction = {
  status: string;
  PaymentMethod?: string;
  Amount?: string;
  voucher?: string;
  easykashRef?: string;
  [key: string]: any;
};

/**
 * The documented inquire response is flat, but wrapped and array-shaped
 * variants have been observed, so probe those before giving up.
 * Returns null when no status field can be found, which callers must treat as
 * "unknown" (not as a status) so a bad response never overwrites a good one.
 */
export function extractEasykashTransaction(payload: any): EasykashTransaction | null {
  if (!payload) return null;

  const candidates = [
    payload,
    payload.data,
    Array.isArray(payload) ? payload[0] : null,
    Array.isArray(payload?.data) ? payload.data[0] : null,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object") {
      const status = candidate.status ?? candidate.Status ?? candidate.paymentStatus;
      if (typeof status === "string" && status.trim()) {
        return { ...candidate, status };
      }
    }
  }

  return null;
}
