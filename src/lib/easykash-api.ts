import { extractEasykashTransaction, type EasykashTransaction } from "@/lib/easykash";

const EASYKASH_API_KEY = process.env.EASYKASH_API_KEY;
const EASYKASH_INQUIRE_URL = "https://back.easykash.net/api/cash-api/inquire";

/**
 * Server-only. Looks a transaction up by the reference we sent when creating
 * the payment.
 *
 * Kept out of `lib/easykash.ts` so that module stays safe to import from client
 * components — this one reads the API key.
 *
 * Returns null when the transaction can't be read, which callers must treat as
 * "unknown" rather than as an answer.
 */
export async function inquireEasykash(
  customerReference: string
): Promise<EasykashTransaction | null> {
  if (!EASYKASH_API_KEY) {
    console.error("EASYKASH_API_KEY is not configured");
    return null;
  }

  try {
    const response = await fetch(EASYKASH_INQUIRE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: EASYKASH_API_KEY,
      },
      // The docs type customerReference as a String here, unlike the pay API
      // where it's a number.
      body: JSON.stringify({ customerReference: String(customerReference) }),
      cache: "no-store",
    });

    if (!response.ok) return null;
    return extractEasykashTransaction(await response.json());
  } catch (error) {
    console.error("EasyKash inquire failed:", error);
    return null;
  }
}

/**
 * Columns to write for a transaction returned by inquire. `payment_status` is
 * left to the caller so each one can apply its own rules about which
 * transitions are allowed.
 */
export function easykashUpdateFields(
  transaction: EasykashTransaction
): Record<string, any> {
  const fields: Record<string, any> = {};

  if (transaction.easykashRef) fields.easykash_ref = transaction.easykashRef;
  if (transaction.PaymentMethod)
    fields.easykash_payment_method = transaction.PaymentMethod;
  // Fawry/Aman issue a voucher the buyer pays with at a branch. The callback
  // only fires once that cash is handed over, so inquire is the only place the
  // code becomes available while the payment is still outstanding.
  if (transaction.voucher) fields.easykash_voucher = String(transaction.voucher);

  return fields;
}
