-- ============================================================
-- Wipe test orders and everything derived from them
-- ============================================================
-- This DELETES DATA AND CANNOT BE UNDONE. Run STEP 1 first and
-- read the counts — if they are not what you expect, stop.
--
-- Deleting orders alone is not enough: `customers` is a derived
-- table whose trigger fires on INSERT/UPDATE only, so the rows
-- would survive with counts pointing at orders that no longer
-- exist. Same for abandoned carts and tracking events.
-- ============================================================


-- ------------------------------------------------------------
-- STEP 1 — Look before you delete
-- ------------------------------------------------------------
SELECT 'orders'           AS table_name, COUNT(*) AS rows FROM orders
UNION ALL SELECT 'order_items',      COUNT(*) FROM order_items
UNION ALL SELECT 'customers',        COUNT(*) FROM customers
UNION ALL SELECT 'abandoned_carts',  COUNT(*) FROM abandoned_carts
UNION ALL SELECT 'analytics_events', COUNT(*) FROM analytics_events;

-- The orders about to go, oldest first:
SELECT order_number, customer_name, phone_number, status, payment_status,
       total, created_at
  FROM orders
 ORDER BY created_at;


-- ------------------------------------------------------------
-- STEP 2 — Delete. Run the whole block at once.
-- ------------------------------------------------------------
BEGIN;

  -- Children before parents: order_items has an FK to orders.
  DELETE FROM order_items;
  DELETE FROM orders;

  -- Derived from orders. Nothing recomputes these on delete.
  DELETE FROM customers;

  -- Test browsing/checkout activity.
  DELETE FROM abandoned_carts;
  DELETE FROM analytics_events;

COMMIT;


-- ------------------------------------------------------------
-- STEP 3 — Confirm
-- ------------------------------------------------------------
SELECT 'orders'           AS table_name, COUNT(*) AS rows FROM orders
UNION ALL SELECT 'order_items',      COUNT(*) FROM order_items
UNION ALL SELECT 'customers',        COUNT(*) FROM customers
UNION ALL SELECT 'abandoned_carts',  COUNT(*) FROM abandoned_carts
UNION ALL SELECT 'analytics_events', COUNT(*) FROM analytics_events;


-- ============================================================
-- OPTIONAL — only if you know you want them
-- ============================================================

-- Promo code usage counters were incremented by the test orders and are not
-- touched above, so a code with a usage_limit may already be partly spent.
--
-- UPDATE promo_codes SET usage_count = 0;

-- Restart the EasyKash customer reference sequence.
-- Leave this alone unless you are certain EasyKash holds no records against
-- the references already issued — reusing one would attach a real payment to
-- the wrong order.
--
-- ALTER SEQUENCE easykash_customer_ref_seq RESTART WITH 1000000001;
