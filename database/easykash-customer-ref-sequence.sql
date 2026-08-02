-- ================================================
-- Unique EasyKash customerReference
-- Run this SQL in your Supabase SQL editor
-- ================================================
--
-- customerReference was derived client-side from the last 9 digits of the order
-- number, which can collide — and a collision means a payment callback lands on
-- the wrong order. This replaces it with a database sequence: unique by
-- construction, allocated atomically at INSERT, no client involvement.
--
-- Starts at 1000000001 so it can never collide with a historical value (those
-- were capped at 9 digits) while staying inside a 32-bit integer, since the Pay
-- API types customerReference as a number.

CREATE SEQUENCE IF NOT EXISTS easykash_customer_ref_seq
  AS BIGINT
  START WITH 1000000001
  INCREMENT BY 1;

-- New orders get their reference automatically.
ALTER TABLE orders
  ALTER COLUMN easykash_customer_ref
  SET DEFAULT nextval('easykash_customer_ref_seq')::TEXT;

-- Re-issue references for historical duplicates, keeping the oldest order's.
-- These rows are already ambiguous — this makes the ambiguity stop spreading.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY easykash_customer_ref
      ORDER BY created_at, id
    ) AS rn
  FROM orders
  WHERE easykash_customer_ref IS NOT NULL
)
UPDATE orders o
SET easykash_customer_ref = nextval('easykash_customer_ref_seq')::TEXT
FROM ranked r
WHERE o.id = r.id AND r.rn > 1;

-- Backfill orders that never got a reference.
UPDATE orders
SET easykash_customer_ref = nextval('easykash_customer_ref_seq')::TEXT
WHERE easykash_customer_ref IS NULL;

-- Enforce it from here on: the database rejects a duplicate rather than letting
-- two orders quietly share a payment reference.
DROP INDEX IF EXISTS idx_orders_easykash_customer_ref;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_easykash_customer_ref
  ON orders (easykash_customer_ref)
  WHERE easykash_customer_ref IS NOT NULL;
