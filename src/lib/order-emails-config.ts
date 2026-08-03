/**
 * Switches for the order emails. Plain constants on purpose — flipping one is a
 * deliberate change that goes through review and deploy, not something that can
 * drift silently between environments.
 */

/** Master switch for the "complete your payment" follow-up. */
export const RECOVERY_EMAIL_ENABLED = true;

/**
 * Whether that follow-up may carry a discount at all. Turning this off hides
 * the control in the admin panel and makes the server refuse any percentage
 * sent to it, so a stale open tab can't discount anything after the fact.
 */
export const RECOVERY_DISCOUNT_ENABLED = true;

/**
 * ── The dial you actually turn ───────────────────────────────────────────────
 * What the panel pre-selects for every order, so nobody has to set it one
 * customer at a time. Change this one number and every follow-up from then on
 * proposes the new figure.
 *
 *   0  → no discount by default; the admin opts in per order
 *   5  → every follow-up offers 5% unless the admin changes it
 *
 * It is only a starting point: the panel lets the admin raise it for one
 * customer (say 10%) without touching anyone else, and whatever they choose is
 * what gets applied — this value is never re-read after the send.
 */
export const RECOVERY_DISCOUNT_DEFAULT_PERCENT = 5;

/**
 * The admin chooses the percentage per order; this is the ceiling the server
 * enforces. A number arriving from a browser decides what a customer pays, so
 * it is never trusted on its own.
 */
export const RECOVERY_DISCOUNT_MAX_PERCENT = 30;

/** Offered as one-tap choices in the panel. The admin can still type a value. */
export const RECOVERY_DISCOUNT_PRESETS = [5, 10, 15, 20];

/**
 * An order younger than this is still live: the customer may be looking at the
 * payment page right now, and an email chasing them mid-payment reads as a
 * system that doesn't know what its own customers are doing.
 *
 * Set it to 0 to allow sending the moment an order exists.
 */
export const RECOVERY_MIN_AGE_MINUTES = 15;

/**
 * ── The window that decides "they already bought this" ───────────────────────
 * Measured either side of the abandoned order. Inside it, anything the same
 * customer did — placed another order, paid one, or already got a follow-up —
 * means this abandoned row is the same purchase seen twice, and chasing it
 * would offer a discount on something they have already paid full price for.
 * Nobody should find out they missed money they were entitled to.
 *
 * Outside the window it stops applying entirely, which is the point: a customer
 * who buys every week or every month is a regular, not a duplicate. If they
 * abandon a cart next month, that is a real lost sale and gets chased like any
 * other.
 */
export const CUSTOMER_WINDOW_HOURS = 72;

/**
 * How long a cart's single-use code stays valid. Long enough to sleep on the
 * decision, short enough that it still feels like a reason to act.
 */
export const CART_CODE_VALID_DAYS = 7;
