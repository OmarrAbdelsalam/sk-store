-- ============================================================
-- Retire a customer's older abandoned carts when they order again
-- ============================================================
-- mark_cart_converted closes one cart, matched on session_id. That is the
-- right key for "this browser finished its own order", and the wrong one for
-- what actually happens: the customer abandons on a phone, comes back on a
-- laptop the next day, and orders. Two sessions, one person — so the phone
-- cart sits in the recovery list forever, and staff chase someone who has
-- already bought.
--
-- Keyed on the normalised phone, which is derived by trigger on both tables
-- and survives every way an Egyptian number can be typed.
-- ============================================================

CREATE OR REPLACE FUNCTION retire_customer_carts(
  p_phone_norm TEXT,
  p_order_id   UUID,
  p_keep_session TEXT DEFAULT NULL,
  -- Only carts from around this purchase. A basket they built last month is a
  -- separate intention, not debris from this order, and closing it would hide
  -- a real lost sale.
  p_window_hours INT DEFAULT 72
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF p_phone_norm IS NULL OR length(p_phone_norm) < 10 THEN
    RETURN 0;
  END IF;

  UPDATE abandoned_carts
     SET status = CASE
           -- A cart that was chased and then bought is the number that proves
           -- the follow-up earns its keep. Don't flatten that into "converted".
           WHEN status = 'contacted' THEN 'recovered'
           ELSE 'converted'
         END,
         order_id = COALESCE(order_id, p_order_id),
         last_activity_at = NOW()
   WHERE phone_norm = p_phone_norm
     AND status IN ('active', 'abandoned', 'contacted')
     -- The session that just ordered keeps its own lifecycle: the order is
     -- still unpaid at this point, and the payment callback is what closes it.
     AND (p_keep_session IS NULL OR session_id <> p_keep_session)
     AND last_activity_at >= NOW() - (p_window_hours || ' hours')::INTERVAL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Postgres grants EXECUTE on every new function to PUBLIC, and PUBLIC includes
-- anon — which would let anyone holding the public key close other people's
-- carts. Revoke that, then grant back only to the role the order route runs as.
REVOKE ALL ON FUNCTION retire_customer_carts(TEXT, UUID, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION retire_customer_carts(TEXT, UUID, TEXT, INT) TO service_role;

SELECT 'retire customer carts: migration complete' AS status;
