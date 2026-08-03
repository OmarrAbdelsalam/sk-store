-- ============================================================
-- Manual recovery email + its discount
-- ============================================================
-- The follow-up is no longer sent by a sweep. An admin decides, per order,
-- whether to chase it and at what discount — so the order has to record what
-- was granted, by whom, and what the price was before, or a discounted order
-- becomes indistinguishable from one that was always that cheap.
-- ============================================================

ALTER TABLE orders
  -- What the recovery discount took off. NULL means none was granted, which
  -- is also what makes "already discounted" a fact rather than a guess.
  ADD COLUMN IF NOT EXISTS recovery_discount_amount  NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS recovery_discount_percent NUMERIC(5,2),
  -- Kept so the discount can be reversed exactly if the email fails to send.
  ADD COLUMN IF NOT EXISTS recovery_original_total   NUMERIC(10,2),
  -- Which admin sent it. Answers "who gave this customer 20% off".
  ADD COLUMN IF NOT EXISTS recovery_sent_by          UUID;

-- The follow-up is once per customer, forever — not once per order. Finding
-- every order belonging to one person is therefore on the hot path of the
-- eligibility check that runs each time the admin opens an order.
CREATE INDEX IF NOT EXISTS idx_orders_recovery_sent
  ON orders (phone_norm, recovery_email_sent_at)
  WHERE recovery_email_sent_at IS NOT NULL;

SELECT 'manual recovery: migration complete' AS status;
