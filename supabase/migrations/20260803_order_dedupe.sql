-- ============================================================
-- Order de-duplication
-- ============================================================
-- One customer, one bag, several order rows. Two ways it happens:
--
--   1. The same request arrives twice — a double tap on "Pay", a flaky
--      connection the browser retried. The checkout already generates an
--      Idempotency-Key for exactly this, but nothing was reading it.
--
--   2. The customer reaches EasyKash, doesn't pay, comes back and checks
--      out again. Every attempt is a genuinely new request, so no
--      idempotency key can catch it — only a rule that looks at the
--      customer rather than the request.
--
-- This migration covers (1). (2) is handled where the follow-up email is
-- decided, in src/lib/order-emails.ts.
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- The uniqueness is the mechanism, not just a constraint: two requests that
-- race past the pre-check both try to insert, and Postgres rejects the second.
-- The route catches that and returns the order the winner created.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Finding a customer's other recent orders is the hot path for the follow-up
-- email. idx_orders_phone_norm covers the phone lookup; this covers the
-- fallback for orders that never got a normalised phone.
CREATE INDEX IF NOT EXISTS idx_orders_email_recent
  ON orders (LOWER(email), created_at DESC) WHERE email IS NOT NULL;

SELECT 'order de-duplication: migration complete' AS status;
