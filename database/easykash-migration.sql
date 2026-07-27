-- ================================================
-- EasyKash Direct Payment + Deposit Plan Migration
-- Run this SQL in your Supabase SQL editor
-- ================================================

-- Payment tracking columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'expired', 'failed', 'refunded', 'delivered')),
  ADD COLUMN IF NOT EXISTS payment_plan TEXT DEFAULT 'full'
    CHECK (payment_plan IN ('full', 'deposit')),
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS easykash_ref TEXT,
  ADD COLUMN IF NOT EXISTS easykash_voucher TEXT,
  ADD COLUMN IF NOT EXISTS easykash_provider TEXT,
  ADD COLUMN IF NOT EXISTS easykash_expiry TEXT,
  ADD COLUMN IF NOT EXISTS easykash_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS easykash_customer_ref TEXT;

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_easykash_ref
  ON orders (easykash_ref) WHERE easykash_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_easykash_customer_ref
  ON orders (easykash_customer_ref) WHERE easykash_customer_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders (payment_status);

CREATE INDEX IF NOT EXISTS idx_orders_payment_plan
  ON orders (payment_plan);
