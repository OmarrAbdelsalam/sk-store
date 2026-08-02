-- ================================================
-- Step 2: Admin identity + RLS on orders and the catalog
-- Run AFTER rls-lock-unused-tables.sql, and AFTER deploying the matching code
-- ================================================
--
-- Model:
--   anon           → reads the public catalog. Nothing else. No writes anywhere.
--   admin          → a signed-in Supabase Auth user listed in admin_users.
--                    Full access to orders and the catalog.
--   service_role   → server routes (checkout, payment callback). Bypasses RLS
--                    entirely; never exposed to the browser.
--
-- Orders get NO anon policy at all. Customers reach their own orders through
-- /api/orders/session/<id>, which runs server-side with the service-role key.


-- ── Admin identity ────────────────────────────────────────────────────────────
-- Being signed in is not the same as being an admin. If project signups are
-- ever enabled, `authenticated` would include the general public — so
-- membership is explicit.

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- No policies: only the service role can read or change who is an admin.
-- Admins cannot add other admins from the browser, and cannot remove
-- themselves from the allowlist by accident.

-- SECURITY DEFINER so the function can read admin_users despite the lockdown
-- above. Fixing search_path keeps it from being tricked into reading a
-- different schema's table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ── Orders ────────────────────────────────────────────────────────────────────
-- The most sensitive tables in the database: names, phone numbers, addresses,
-- and the payment status that decides whether something ships.

ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Clear the permissive USING (true) policies from the original schema, which
-- let every anonymous visitor read and insert orders.
DROP POLICY IF EXISTS "Users can read their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders"         ON public.orders;
DROP POLICY IF EXISTS "Users can read order items"      ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items"    ON public.order_items;

CREATE POLICY "Admins have full access to orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── Catalog ───────────────────────────────────────────────────────────────────
-- Read by the storefront with the anon key, written only by admins.
-- Anything not listed here is either already locked or handled in step 1.

DO $$
DECLARE
  t TEXT;
  catalog_tables TEXT[] := ARRAY[
    'products', 'product_images', 'product_colors', 'related_products',
    'categories', 'colors',
    'hero_settings', 'mobile_hero', 'banner_settings',
    'marquee_items', 'marquee_settings',
    'customer_love', 'customer_love_settings',
    'more_to_discover', 'more_to_discover_settings',
    'our_vibes', 'our_vibes_settings',
    'social_proofs', 'quick_promotions'
  ];
BEGIN
  FOREACH t IN ARRAY catalog_tables LOOP
    -- Skip anything this database doesn't actually have.
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t
    ) THEN
      RAISE NOTICE 'Skipping missing table: %', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS "Public read %s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "Public read %s" ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      t, t
    );

    EXECUTE format('DROP POLICY IF EXISTS "Admin write %s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "Admin write %s" ON public.%I FOR ALL TO authenticated '
      'USING (public.is_admin()) WITH CHECK (public.is_admin())',
      t, t
    );
  END LOOP;
END $$;


-- ── Promo codes ───────────────────────────────────────────────────────────────
-- Readable so checkout can validate a code, but usage counts are incremented
-- server-side, so anon gets no write.

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read promo_codes" ON public.promo_codes;
CREATE POLICY "Public read promo_codes"
  ON public.promo_codes FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin write promo_codes" ON public.promo_codes;
CREATE POLICY "Admin write promo_codes"
  ON public.promo_codes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── Register your admin ───────────────────────────────────────────────────────
-- REQUIRED. Until a row exists here, the admin panel will load no data — RLS
-- has no one to say yes to. Replace the address with the account you sign in
-- with, then run it.
--
-- INSERT INTO public.admin_users (user_id, email)
-- SELECT id, email FROM auth.users WHERE email = 'admin@skbags.com'
-- ON CONFLICT (user_id) DO NOTHING;


-- ── Verify ────────────────────────────────────────────────────────────────────
-- Every public table should show rowsecurity = true.
--
-- SELECT c.relname, c.relrowsecurity AS rls, count(p.polname) AS policies
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- LEFT JOIN pg_policy p ON p.polrelid = c.oid
-- WHERE n.nspname = 'public' AND c.relkind = 'r'
-- GROUP BY 1, 2 ORDER BY 2, 1;
