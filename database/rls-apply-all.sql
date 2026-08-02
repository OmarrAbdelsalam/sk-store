-- ================================================
-- RLS — single consolidated apply. Safe to re-run.
-- Run this WHOLE file in the Supabase SQL editor.
-- ================================================
--
-- Replaces the earlier step1/step2 files, which did not fully apply. This one
-- makes no assumptions about existing policy names: it drops every policy on
-- every public table first, so legacy permissive rules (USING (true)) cannot
-- survive and quietly keep the data open.
--
-- Resulting model:
--   catalog tables → anon may SELECT; only admins may write
--   orders/order_items → admins only; the storefront reaches them through
--                        server routes using the service-role key
--   everything else → RLS on, no policy = no access for anon/authenticated
--   service_role → bypasses all of this (server-side only)

-- ── Admin identity ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ── Apply to every table in the public schema ────────────────────────────────

DO $$
DECLARE
  t            TEXT;
  pol          TEXT;
  n_catalog    INT := 0;
  n_orders     INT := 0;
  n_locked     INT := 0;
  catalog_tables TEXT[] := ARRAY[
    'products', 'product_images', 'product_colors', 'related_products',
    'categories', 'colors',
    'hero_settings', 'mobile_hero', 'banner_settings',
    'marquee_items', 'marquee_settings',
    'customer_love', 'customer_love_settings',
    'more_to_discover', 'more_to_discover_settings',
    'our_vibes', 'our_vibes_settings',
    'social_proofs', 'quick_promotions', 'promo_codes'
  ];
  order_tables TEXT[] := ARRAY['orders', 'order_items'];
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  LOOP
    -- Turn RLS on first: without this, policies are inert and the table stays
    -- wide open no matter what rules are attached to it.
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- Clear every existing policy, whatever it is called.
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol, t);
    END LOOP;

    IF t = ANY(catalog_tables) THEN
      EXECUTE format(
        'CREATE POLICY "public_read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
      EXECUTE format(
        'CREATE POLICY "admin_all" ON public.%I FOR ALL TO authenticated '
        'USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
      n_catalog := n_catalog + 1;

    ELSIF t = ANY(order_tables) THEN
      EXECUTE format(
        'CREATE POLICY "admin_all" ON public.%I FOR ALL TO authenticated '
        'USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
      n_orders := n_orders + 1;

    ELSE
      -- No policy at all: locked to everyone except service_role.
      n_locked := n_locked + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'catalog: % | orders: % | locked: %', n_catalog, n_orders, n_locked;
END $$;


-- ── Register your admin (edit the email, then it runs automatically) ──────────

INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'omar3328101@gmail.com'
ON CONFLICT (user_id) DO NOTHING;


-- ── Result: every row must show rls = true ────────────────────────────────────

SELECT
  c.relname                        AS table_name,
  c.relrowsecurity                 AS rls,
  count(p.polname)                 AS policies
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
GROUP BY 1, 2
ORDER BY c.relrowsecurity, c.relname;
