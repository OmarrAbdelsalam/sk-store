-- ============================================================
-- Recovery emails for carts that never became orders
-- ============================================================
-- The order-level follow-up only reaches people who pressed Pay and then
-- walked away from the gateway. It never reaches the larger group: someone
-- who filled a cart, typed their email at checkout, and closed the tab. There
-- is no order row for them at all — only an abandoned_carts row.
--
-- Those two flows cannot share a mechanism. An abandoned order has a price to
-- discount and a payment page to reopen; a cart has neither, so its discount
-- has to be a real promo code the customer can type, and its call to action is
-- a trip back to the cart rather than a payment link.
-- ============================================================

ALTER TABLE abandoned_carts
  ADD COLUMN IF NOT EXISTS recovery_email_sent_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovery_token            UUID,
  ADD COLUMN IF NOT EXISTS recovery_discount_percent NUMERIC(5,2),
  -- The single-use code minted for this cart. Kept so the admin can see what
  -- was offered, and so a resend never mints a second one.
  ADD COLUMN IF NOT EXISTS recovery_promo_code       TEXT,
  ADD COLUMN IF NOT EXISTS recovery_sent_by          UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_abandoned_recovery_token
  ON abandoned_carts (recovery_token) WHERE recovery_token IS NOT NULL;

-- The eligibility check asks "has this customer been chased recently", keyed
-- on the phone, exactly like the order-side rule.
CREATE INDEX IF NOT EXISTS idx_abandoned_recovery_sent
  ON abandoned_carts (phone_norm, recovery_email_sent_at)
  WHERE recovery_email_sent_at IS NOT NULL;

-- Same question, for carts that only ever gave us an email address.
CREATE INDEX IF NOT EXISTS idx_abandoned_email
  ON abandoned_carts (LOWER(email)) WHERE email IS NOT NULL;

SELECT 'cart recovery: migration complete' AS status;
