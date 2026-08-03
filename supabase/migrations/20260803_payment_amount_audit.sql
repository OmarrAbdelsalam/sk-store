-- ============================================================
-- Record what was actually paid
-- ============================================================
-- An EasyKash payment page is a hosted page with the amount baked in. Once the
-- link is open we cannot change or revoke it — so a customer who still has the
-- checkout tab open, and pays there after an admin has discounted the order,
-- pays the old price. Nothing in the system noticed: the callback marks the
-- order paid regardless of the figure, and the order then shows the discounted
-- total next to a payment that was larger.
--
-- We can't stop it. We can make it visible, which is the difference between a
-- customer who is quietly overcharged and one who gets a refund.
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS easykash_amount_paid NUMERIC(10,2);

-- The working list: paid orders whose payment doesn't match what we expected
-- to charge online. One EGP of slack absorbs rounding on the gateway's side.
CREATE INDEX IF NOT EXISTS idx_orders_payment_mismatch
  ON orders (created_at DESC)
  WHERE easykash_amount_paid IS NOT NULL;

SELECT 'payment amount audit: migration complete' AS status;
