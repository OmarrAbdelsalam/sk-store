-- ============================================================
-- Tracking + Abandoned Carts + Customers
-- ============================================================
-- Scope (approved):
--   1. analytics_events   — cart/WhatsApp/contact events
--   2. abandoned_carts    — cart contents + partial checkout data
--   3. customers          — derived from orders, keyed on normalized phone
--   4. orders.email       — now required at checkout
-- ============================================================

-- Depends on the EasyKash migration for orders.payment_status.
-- Failing loudly here beats every customer total silently reading zero.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'orders'
       AND column_name = 'payment_status'
  ) THEN
    RAISE EXCEPTION
      'orders.payment_status is missing — run database/easykash-migration.sql first';
  END IF;

  IF to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION
      'public.is_admin() is missing — run database/rls-step2-orders-and-catalog.sql first';
  END IF;
END $$;


-- The reporting functions below are SECURITY DEFINER and return customer
-- phones and emails. Being signed in is not the same as being an admin — a
-- self-serve signup must not be able to dump the customer list.
CREATE OR REPLACE FUNCTION analytics_require_admin()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claims TEXT;
  v_role   TEXT;
BEGIN
  -- SECURITY DEFINER makes current_user the function OWNER, not the caller, so
  -- the caller's role has to be read from the request JWT. Checking
  -- current_user here silently passes everyone, including anon.
  v_claims := current_setting('request.jwt.claims', true);

  -- No request context at all: direct SQL (psql, Supabase SQL editor).
  IF v_claims IS NULL OR v_claims = '' THEN
    RETURN;
  END IF;

  v_role := COALESCE(v_claims::JSONB ->> 'role', '');

  -- Trusted server-side code: payment callback, /api/track, order creation.
  IF v_role = 'service_role' THEN
    RETURN;
  END IF;

  -- Everyone else must be a listed admin. Being signed in is not enough.
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'analytics: admin access required';
  END IF;
END;
$$;


-- ------------------------------------------------------------
-- Egyptian phone normalisation.
-- Every entry point spells the same number differently
-- (01016887251 / +201016887251 / 00201016887251), so the customer
-- key has to be derived, not stored as typed.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION normalize_eg_phone(p TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d TEXT;
BEGIN
  IF p IS NULL THEN RETURN NULL; END IF;

  d := regexp_replace(p, '\D', '', 'g');
  IF d = '' THEN RETURN NULL; END IF;

  IF left(d, 2) = '00' THEN
    d := substr(d, 3);
  END IF;

  -- 20 + 10 digits, already canonical
  IF left(d, 2) = '20' AND length(d) = 12 THEN
    RETURN d;
  END IF;

  -- local 0XXXXXXXXXX
  IF left(d, 1) = '0' AND length(d) = 11 THEN
    RETURN '20' || substr(d, 2);
  END IF;

  -- bare 1XXXXXXXXX
  IF length(d) = 10 AND left(d, 1) = '1' THEN
    RETURN '20' || d;
  END IF;

  RETURN d;
END;
$$;


-- ============================================================
-- 1. analytics_events
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id  TEXT NOT NULL,
  event_name  TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  product_id  UUID,
  product_name TEXT,
  color_name  TEXT,
  quantity    INT,
  value       NUMERIC(10,2),
  order_id    UUID,

  page_url    TEXT,
  device_type TEXT,
  props       JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_aev_time
  ON analytics_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_aev_name_time
  ON analytics_events (event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_aev_session
  ON analytics_events (session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_aev_product
  ON analytics_events (product_id, occurred_at DESC)
  WHERE product_id IS NOT NULL;


-- ============================================================
-- 2. abandoned_carts
-- ============================================================
CREATE TABLE IF NOT EXISTS abandoned_carts (
  session_id       TEXT PRIMARY KEY,

  -- cart contents
  items            JSONB NOT NULL DEFAULT '[]'::JSONB,
  item_count       INT DEFAULT 0,
  subtotal         NUMERIC(10,2) DEFAULT 0,

  -- whatever the customer typed before submitting
  customer_name    TEXT,
  phone            TEXT,
  phone_norm       TEXT,
  email            TEXT,
  government       TEXT,
  city             TEXT,
  address          TEXT,
  promo_code_tried TEXT,

  furthest_stage   TEXT NOT NULL DEFAULT 'cart'
    CHECK (furthest_stage IN
      ('cart','checkout_viewed','contact_entered','address_entered','order_submitted','payment_started')),

  has_contact      BOOLEAN GENERATED ALWAYS AS
    (phone_norm IS NOT NULL OR email IS NOT NULL) STORED,

  status           TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','abandoned','contacted','recovered','converted')),

  order_id         UUID,
  contacted_at     TIMESTAMPTZ,
  contact_count    INT NOT NULL DEFAULT 0,
  admin_note       TEXT,

  device_type      TEXT,
  first_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_activity
  ON abandoned_carts (last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_open
  ON abandoned_carts (has_contact, subtotal DESC)
  WHERE status IN ('active','abandoned','contacted');
CREATE INDEX IF NOT EXISTS idx_abandoned_phone
  ON abandoned_carts (phone_norm) WHERE phone_norm IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_abandoned_items
  ON abandoned_carts USING GIN (items);

-- keep phone_norm in sync with whatever was typed
CREATE OR REPLACE FUNCTION abandoned_carts_set_phone_norm()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.phone_norm := normalize_eg_phone(NEW.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_abandoned_phone_norm ON abandoned_carts;
CREATE TRIGGER trg_abandoned_phone_norm
  BEFORE INSERT OR UPDATE OF phone ON abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION abandoned_carts_set_phone_norm();


-- ============================================================
-- 3. orders: email + recovery link
-- ============================================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS email               TEXT,
  ADD COLUMN IF NOT EXISTS phone_norm          TEXT,
  ADD COLUMN IF NOT EXISTS recovered_from_cart TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_email
  ON orders (LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_phone_norm
  ON orders (phone_norm);
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders (created_at DESC);

-- backfill phone_norm for existing rows
UPDATE orders
   SET phone_norm = normalize_eg_phone(phone_number)
 WHERE phone_norm IS NULL AND phone_number IS NOT NULL;

CREATE OR REPLACE FUNCTION orders_set_phone_norm()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.phone_norm := normalize_eg_phone(NEW.phone_number);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_phone_norm ON orders;
CREATE TRIGGER trg_orders_phone_norm
  BEFORE INSERT OR UPDATE OF phone_number ON orders
  FOR EACH ROW EXECUTE FUNCTION orders_set_phone_norm();


-- ============================================================
-- 4. customers  (derived — NOT an account system)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  phone_norm        TEXT PRIMARY KEY,
  name              TEXT,
  email             TEXT,
  phone_display     TEXT,

  first_order_at    TIMESTAMPTZ,
  last_order_at     TIMESTAMPTZ,
  last_paid_at      TIMESTAMPTZ,

  orders_count      INT NOT NULL DEFAULT 0,
  paid_orders_count INT NOT NULL DEFAULT 0,
  cancelled_count   INT NOT NULL DEFAULT 0,

  total_spent       NUMERIC(12,2) NOT NULL DEFAULT 0,  -- paid only
  total_placed      NUMERIC(12,2) NOT NULL DEFAULT 0,  -- everything not cancelled
  avg_order_value   NUMERIC(12,2) NOT NULL DEFAULT 0,

  government        TEXT,
  city              TEXT,
  last_order_id     UUID,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_last_order
  ON customers (last_order_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_spent
  ON customers (total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customers_repeat
  ON customers (paid_orders_count DESC) WHERE paid_orders_count > 1;

-- Recompute the whole row from orders rather than incrementing counters.
-- Status and payment_status both change after insert, so an incremental
-- counter would drift the first time an order is cancelled or paid.
CREATE OR REPLACE FUNCTION recompute_customer(p_phone TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT := p_phone;
BEGIN
  IF v_phone IS NULL OR length(v_phone) < 10 THEN
    RETURN;
  END IF;

  INSERT INTO customers (
    phone_norm, name, email, phone_display,
    first_order_at, last_order_at, last_paid_at,
    orders_count, paid_orders_count, cancelled_count,
    total_spent, total_placed, avg_order_value,
    government, city, last_order_id, updated_at
  )
  SELECT
    v_phone,
    (ARRAY_AGG(o.customer_name ORDER BY o.created_at DESC)
       FILTER (WHERE o.customer_name IS NOT NULL))[1],
    (ARRAY_AGG(o.email ORDER BY o.created_at DESC)
       FILTER (WHERE o.email IS NOT NULL))[1],
    (ARRAY_AGG(o.phone_number ORDER BY o.created_at DESC))[1],
    MIN(o.created_at),
    MAX(o.created_at),
    MAX(o.created_at) FILTER (WHERE LOWER(o.payment_status) IN ('paid','delivered')),
    COUNT(*) FILTER (WHERE LOWER(o.status) <> 'cancelled'),
    COUNT(*) FILTER (WHERE LOWER(o.payment_status) IN ('paid','delivered')),
    COUNT(*) FILTER (WHERE LOWER(o.status) = 'cancelled'),
    COALESCE(SUM(o.total) FILTER (WHERE LOWER(o.payment_status) IN ('paid','delivered')), 0),
    COALESCE(SUM(o.total) FILTER (WHERE LOWER(o.status) <> 'cancelled'), 0),
    CASE
      WHEN COUNT(*) FILTER (WHERE LOWER(o.payment_status) IN ('paid','delivered')) > 0
      THEN COALESCE(SUM(o.total) FILTER (WHERE LOWER(o.payment_status) IN ('paid','delivered')), 0)
           / COUNT(*) FILTER (WHERE LOWER(o.payment_status) IN ('paid','delivered'))
      ELSE 0
    END,
    (ARRAY_AGG(o.government ORDER BY o.created_at DESC)
       FILTER (WHERE o.government IS NOT NULL))[1],
    (ARRAY_AGG(o.city ORDER BY o.created_at DESC)
       FILTER (WHERE o.city IS NOT NULL))[1],
    (ARRAY_AGG(o.id ORDER BY o.created_at DESC))[1],
    NOW()
  FROM orders o
  WHERE o.phone_norm = v_phone
  ON CONFLICT (phone_norm) DO UPDATE SET
    name              = COALESCE(EXCLUDED.name, customers.name),
    email             = COALESCE(EXCLUDED.email, customers.email),
    phone_display     = EXCLUDED.phone_display,
    first_order_at    = EXCLUDED.first_order_at,
    last_order_at     = EXCLUDED.last_order_at,
    last_paid_at      = EXCLUDED.last_paid_at,
    orders_count      = EXCLUDED.orders_count,
    paid_orders_count = EXCLUDED.paid_orders_count,
    cancelled_count   = EXCLUDED.cancelled_count,
    total_spent       = EXCLUDED.total_spent,
    total_placed      = EXCLUDED.total_placed,
    avg_order_value   = EXCLUDED.avg_order_value,
    government        = COALESCE(EXCLUDED.government, customers.government),
    city              = COALESCE(EXCLUDED.city, customers.city),
    last_order_id     = EXCLUDED.last_order_id,
    updated_at        = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION sync_customer_from_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM recompute_customer(normalize_eg_phone(NEW.phone_number));
  RETURN NEW;
END;
$$;

-- AFTER, so the new row is visible to the aggregate inside recompute_customer.
DROP TRIGGER IF EXISTS trg_sync_customer ON orders;
CREATE TRIGGER trg_sync_customer
  AFTER INSERT OR UPDATE OF status, payment_status, total, customer_name, email
  ON orders
  FOR EACH ROW EXECUTE FUNCTION sync_customer_from_orders();

-- one-off backfill of every existing customer
DO $$
DECLARE v_phone TEXT;
BEGIN
  FOR v_phone IN
    SELECT DISTINCT phone_norm FROM orders WHERE phone_norm IS NOT NULL
  LOOP
    PERFORM recompute_customer(v_phone);
  END LOOP;
END $$;


-- ============================================================
-- 5. Abandoned cart upsert
-- ============================================================
CREATE OR REPLACE FUNCTION abandoned_stage_rank(s TEXT)
RETURNS INT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE s
    WHEN 'cart'            THEN 1
    WHEN 'checkout_viewed' THEN 2
    WHEN 'contact_entered' THEN 3
    WHEN 'address_entered' THEN 4
    WHEN 'order_submitted' THEN 5
    WHEN 'payment_started' THEN 6
    ELSE 0
  END;
$$;

-- One atomic call per snapshot. Doing this as read-then-write from the route
-- would let two in-flight beacons (cart change + field blur) clobber each
-- other's fields and walk furthest_stage backwards.
CREATE OR REPLACE FUNCTION upsert_abandoned_cart(
  p_session_id    TEXT,
  p_items         JSONB   DEFAULT NULL,
  p_item_count    INT     DEFAULT NULL,
  p_subtotal      NUMERIC DEFAULT NULL,
  p_customer_name TEXT    DEFAULT NULL,
  p_phone         TEXT    DEFAULT NULL,
  p_email         TEXT    DEFAULT NULL,
  p_government    TEXT    DEFAULT NULL,
  p_city          TEXT    DEFAULT NULL,
  p_address       TEXT    DEFAULT NULL,
  p_promo_code    TEXT    DEFAULT NULL,
  p_stage         TEXT    DEFAULT 'cart',
  p_device        TEXT    DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_session_id IS NULL OR length(p_session_id) < 8 THEN
    RETURN;
  END IF;

  INSERT INTO abandoned_carts AS a (
    session_id, items, item_count, subtotal,
    customer_name, phone, email, government, city, address,
    promo_code_tried, furthest_stage, device_type, last_activity_at
  )
  VALUES (
    p_session_id,
    COALESCE(p_items, '[]'::JSONB),
    COALESCE(p_item_count, 0),
    COALESCE(p_subtotal, 0),
    p_customer_name, p_phone, p_email, p_government, p_city, p_address,
    p_promo_code, COALESCE(p_stage, 'cart'), p_device, NOW()
  )
  ON CONFLICT (session_id) DO UPDATE SET
    -- NULL means "not part of this snapshot", so keep what we already had.
    items            = COALESCE(EXCLUDED.items, a.items),
    item_count       = COALESCE(p_item_count, a.item_count),
    subtotal         = COALESCE(p_subtotal, a.subtotal),
    customer_name    = COALESCE(EXCLUDED.customer_name, a.customer_name),
    phone            = COALESCE(EXCLUDED.phone, a.phone),
    email            = COALESCE(EXCLUDED.email, a.email),
    government       = COALESCE(EXCLUDED.government, a.government),
    city             = COALESCE(EXCLUDED.city, a.city),
    address          = COALESCE(EXCLUDED.address, a.address),
    promo_code_tried = COALESCE(EXCLUDED.promo_code_tried, a.promo_code_tried),
    device_type      = COALESCE(EXCLUDED.device_type, a.device_type),
    furthest_stage   = CASE
      WHEN abandoned_stage_rank(EXCLUDED.furthest_stage)
         > abandoned_stage_rank(a.furthest_stage)
      THEN EXCLUDED.furthest_stage ELSE a.furthest_stage END,
    last_activity_at = NOW()
  -- A cart that already turned into an order must not be dragged back into
  -- the recovery list by a late beacon from the same tab.
  WHERE a.status NOT IN ('converted', 'recovered');
END;
$$;


-- Called once the order exists: this cart is done, stop chasing it.
CREATE OR REPLACE FUNCTION mark_cart_converted(p_session_id TEXT, p_order_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE abandoned_carts
     SET status   = CASE WHEN status = 'contacted' THEN 'recovered' ELSE 'converted' END,
         order_id = p_order_id,
         last_activity_at = NOW()
   WHERE session_id = p_session_id;
$$;


-- ============================================================
-- 6. Reporting functions
-- ============================================================

-- Products ranked by how often they land in a cart, regardless of purchase.
CREATE OR REPLACE FUNCTION analytics_product_cart_stats(
  p_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_to   TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  product_id        UUID,
  product_name      TEXT,
  added_to_cart     BIGINT,
  removed_from_cart BIGINT,
  purchased         BIGINT,
  cart_to_purchase  NUMERIC,
  in_abandoned      BIGINT,
  stuck_value       NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM analytics_require_admin();
  RETURN QUERY
  WITH ev AS (
    SELECT
      e.product_id,
      (ARRAY_AGG(e.product_name ORDER BY e.occurred_at DESC)
         FILTER (WHERE e.product_name IS NOT NULL))[1] AS product_name,
      COUNT(*) FILTER (WHERE e.event_name = 'add_to_cart')      AS added,
      COUNT(*) FILTER (WHERE e.event_name = 'remove_from_cart') AS removed,
      COUNT(*) FILTER (WHERE e.event_name = 'purchase')         AS purchased
    FROM analytics_events e
    WHERE e.product_id IS NOT NULL
      AND e.occurred_at >= p_from
      AND e.occurred_at <  p_to
    GROUP BY e.product_id
  ),
  ab AS (
    SELECT
      (i->>'productId')::UUID AS product_id,
      COUNT(*)                AS in_abandoned,
      SUM(COALESCE((i->>'price')::NUMERIC, 0) * COALESCE((i->>'quantity')::INT, 1)) AS stuck_value
    FROM abandoned_carts a
    CROSS JOIN LATERAL jsonb_array_elements(a.items) AS i
    WHERE a.status IN ('active','abandoned','contacted')
      AND a.last_activity_at >= p_from
      AND a.last_activity_at <  p_to
      -- Cart items are whatever the browser sent. One malformed productId
      -- would abort the cast and take the entire report down with it, so
      -- match the UUID shape before casting rather than after.
      AND (i->>'productId') ~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    GROUP BY 1
  )
  SELECT
    COALESCE(ev.product_id, ab.product_id),
    COALESCE(ev.product_name, p.name_en),
    COALESCE(ev.added, 0),
    COALESCE(ev.removed, 0),
    COALESCE(ev.purchased, 0),
    CASE WHEN COALESCE(ev.added, 0) > 0
         THEN ROUND(COALESCE(ev.purchased, 0)::NUMERIC * 100 / ev.added, 1)
         ELSE 0 END,
    COALESCE(ab.in_abandoned, 0),
    ROUND(COALESCE(ab.stuck_value, 0), 2)
  FROM ev
  FULL OUTER JOIN ab ON ab.product_id = ev.product_id
  LEFT JOIN products p ON p.id = COALESCE(ev.product_id, ab.product_id)
  ORDER BY COALESCE(ev.added, 0) DESC, COALESCE(ab.stuck_value, 0) DESC;
END;
$$;


-- Headline numbers for the abandoned carts page.
CREATE OR REPLACE FUNCTION analytics_abandoned_summary(
  p_from        TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_to          TIMESTAMPTZ DEFAULT NOW(),
  p_stale_after INT DEFAULT 30      -- minutes of inactivity before "abandoned"
)
RETURNS TABLE (
  open_carts        BIGINT,
  contactable       BIGINT,
  stuck_value       NUMERIC,
  contactable_value NUMERIC,
  recovered         BIGINT,
  recovered_value   NUMERIC,
  avg_cart_value    NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM analytics_require_admin();
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE open_c),
    COUNT(*) FILTER (WHERE open_c AND has_contact),
    ROUND(COALESCE(SUM(subtotal) FILTER (WHERE open_c), 0), 2),
    ROUND(COALESCE(SUM(subtotal) FILTER (WHERE open_c AND has_contact), 0), 2),
    COUNT(*) FILTER (WHERE status = 'recovered'),
    ROUND(COALESCE(SUM(subtotal) FILTER (WHERE status = 'recovered'), 0), 2),
    ROUND(COALESCE(AVG(subtotal) FILTER (WHERE open_c AND subtotal > 0), 0), 2)
  FROM (
    SELECT
      a.*,
      (a.status IN ('active','abandoned','contacted')
       AND a.last_activity_at < NOW() - (p_stale_after || ' minutes')::INTERVAL) AS open_c
    FROM abandoned_carts a
    WHERE a.last_activity_at >= p_from
      AND a.last_activity_at <  p_to
      AND a.item_count > 0
  ) s;
END;
$$;


-- The working list: who left money behind, and can we reach them.
CREATE OR REPLACE FUNCTION analytics_abandoned_list(
  p_from        TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_to          TIMESTAMPTZ DEFAULT NOW(),
  p_stale_after INT DEFAULT 30,
  p_only_contactable BOOLEAN DEFAULT FALSE,
  p_limit       INT DEFAULT 200
)
RETURNS TABLE (
  session_id       TEXT,
  customer_name    TEXT,
  phone            TEXT,
  phone_norm       TEXT,
  email            TEXT,
  government       TEXT,
  items            JSONB,
  item_count       INT,
  subtotal         NUMERIC,
  furthest_stage   TEXT,
  has_contact      BOOLEAN,
  status           TEXT,
  contact_count    INT,
  contacted_at     TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  is_known_customer BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM analytics_require_admin();
  RETURN QUERY
  SELECT
    a.session_id, a.customer_name, a.phone, a.phone_norm, a.email,
    a.government, a.items, a.item_count, a.subtotal,
    a.furthest_stage, a.has_contact, a.status,
    a.contact_count, a.contacted_at, a.last_activity_at,
    (c.phone_norm IS NOT NULL) AS is_known_customer
  FROM abandoned_carts a
  LEFT JOIN customers c ON c.phone_norm = a.phone_norm
  WHERE a.status IN ('active','abandoned','contacted')
    AND a.item_count > 0
    AND a.last_activity_at >= p_from
    AND a.last_activity_at <  p_to
    AND a.last_activity_at < NOW() - (p_stale_after || ' minutes')::INTERVAL
    AND (NOT p_only_contactable OR a.has_contact)
  ORDER BY a.has_contact DESC, a.subtotal DESC, a.last_activity_at DESC
  LIMIT p_limit;
END;
$$;


-- Admin marks a cart as followed up. Guarded the same way as the reads.
CREATE OR REPLACE FUNCTION analytics_mark_cart_contacted(p_session_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM analytics_require_admin();
  UPDATE abandoned_carts
     SET status        = CASE WHEN status = 'active' THEN 'contacted' ELSE status END,
         contacted_at  = NOW(),
         contact_count = contact_count + 1
   WHERE session_id = p_session_id
     AND status IN ('active', 'abandoned', 'contacted');
END;
$$;


-- ============================================================
-- 7. RLS — deny everything to anon/authenticated.
--    All writes go through /api/track with the service role,
--    which bypasses RLS. Leaving these open would let anyone
--    forge events and poison every report.
-- ============================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers        ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON analytics_events FROM anon, authenticated;
REVOKE ALL ON abandoned_carts  FROM anon, authenticated;
REVOKE ALL ON customers        FROM anon, authenticated;

-- Postgres grants EXECUTE on every new function to PUBLIC by default, and
-- PUBLIC includes anon. Revoking from anon/authenticated alone leaves that
-- grant in place — which is enough for anyone holding the public anon key to
-- read the whole customer list. Revoke from PUBLIC first, then grant back.
REVOKE ALL ON FUNCTION analytics_require_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION analytics_product_cart_stats(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION analytics_abandoned_summary(TIMESTAMPTZ, TIMESTAMPTZ, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION analytics_abandoned_list(TIMESTAMPTZ, TIMESTAMPTZ, INT, BOOLEAN, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION analytics_mark_cart_contacted(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION upsert_abandoned_cart(TEXT, JSONB, INT, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_cart_converted(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION recompute_customer(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION abandoned_stage_rank(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION normalize_eg_phone(TEXT) FROM PUBLIC;

-- The admin panel signs in with Supabase Auth and queries from the browser, so
-- the reporting functions must be callable by `authenticated` — the is_admin()
-- check inside each one is what actually restricts them.

GRANT EXECUTE ON FUNCTION analytics_product_cart_stats(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION analytics_abandoned_summary(TIMESTAMPTZ, TIMESTAMPTZ, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION analytics_abandoned_list(TIMESTAMPTZ, TIMESTAMPTZ, INT, BOOLEAN, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION analytics_mark_cart_contacted(TEXT) TO authenticated;

SELECT 'tracking + abandoned carts + customers: migration complete' AS status;
