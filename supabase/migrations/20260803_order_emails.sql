-- ============================================================
-- Order emails (Resend)
-- ============================================================
-- Two emails, both driven off the orders table:
--   1. confirmation — sent once the payment is verified
--   2. recovery     — sent once, 15 minutes after an order was placed
--                     and still has no payment against it
--
-- The "sent" markers live on orders rather than in application memory
-- because three different code paths can settle a payment (the gateway
-- callback, the success-page status poll, and the reconcile sweep). A
-- single UPDATE ... WHERE sent_at IS NULL is what makes exactly one of
-- them the sender.
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovery_email_sent_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovery_token             UUID,
  -- Which language the customer checked out in. Without it every email
  -- has to guess, and an English buyer gets an Arabic receipt.
  ADD COLUMN IF NOT EXISTS locale                     TEXT
    CHECK (locale IS NULL OR locale IN ('ar', 'en'));

-- The recovery link is a bearer credential: whoever holds it can open the
-- payment page for that order. Uniqueness is what makes the lookup safe.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_recovery_token
  ON orders (recovery_token) WHERE recovery_token IS NOT NULL;

-- The sweep's working set: unpaid orders that have never been chased.
CREATE INDEX IF NOT EXISTS idx_orders_recovery_pending
  ON orders (created_at)
  WHERE recovery_email_sent_at IS NULL
    AND payment_status IN ('unpaid', 'pending');


-- ============================================================
-- email_log — one row per send attempt
-- ============================================================
-- Deliverability problems are invisible from the orders table alone: a
-- NULL sent_at looks the same whether the send failed or never ran. This
-- records the provider's answer either way.
CREATE TABLE IF NOT EXISTS email_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id    UUID,
  kind        TEXT NOT NULL,          -- 'order_confirmation' | 'order_recovery'
  recipient   TEXT NOT NULL,
  subject     TEXT,
  status      TEXT NOT NULL           -- 'sent' | 'failed' | 'skipped'
    CHECK (status IN ('sent', 'failed', 'skipped')),
  provider_id TEXT,                   -- Resend message id
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_order
  ON email_log (order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_failed
  ON email_log (created_at DESC) WHERE status = 'failed';


-- ============================================================
-- RLS — the log holds customer addresses, so it follows the same
-- rule as every other analytics table: writes go through the
-- service role, reads are for admins only.
-- ============================================================
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON email_log FROM anon, authenticated;

SELECT 'order emails: migration complete' AS status;

-- ── Admin visibility for the log ────────────────────────────────────────────
-- Added after the fact: with only the blanket REVOKE above, a failed send was
-- invisible to everyone except whoever reads the server logs. Admins can read
-- it; nobody can write it from a browser, because every insert comes from the
-- service role, which bypasses policies entirely.
DROP POLICY IF EXISTS email_log_admin_read ON email_log;
CREATE POLICY email_log_admin_read ON email_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

GRANT SELECT ON email_log TO authenticated;
