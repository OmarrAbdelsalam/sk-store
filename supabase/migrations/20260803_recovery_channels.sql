-- ============================================================
-- Email and WhatsApp are separate channels
-- ============================================================
-- A customer may get both — they are different conversations, and one arriving
-- does not make the other spam. What must not happen is the SAME channel
-- firing twice for the same shopping trip.
--
-- So the "already chased" mark is per channel. Everything else in the rules
-- stays shared: if they paid, or came back and ordered again, neither channel
-- goes out.
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS recovery_whatsapp_sent_at TIMESTAMPTZ;

ALTER TABLE abandoned_carts
  ADD COLUMN IF NOT EXISTS recovery_whatsapp_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_recovery_whatsapp
  ON orders (phone_norm, recovery_whatsapp_sent_at)
  WHERE recovery_whatsapp_sent_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_abandoned_recovery_whatsapp
  ON abandoned_carts (phone_norm, recovery_whatsapp_sent_at)
  WHERE recovery_whatsapp_sent_at IS NOT NULL;

SELECT 'recovery channels: migration complete' AS status;
