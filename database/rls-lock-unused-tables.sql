-- ================================================
-- Step 1: Lock down tables the application never queries
-- Run this SQL in your Supabase SQL editor
-- ================================================
--
-- The anon key ships inside the browser bundle — it is public by definition.
-- Without RLS, every one of these tables is readable and writable by anyone who
-- opens devtools. This closes the ones nothing in the codebase touches.
--
-- Enabling RLS without adding any policy denies all access to the anon and
-- authenticated roles. The service_role key bypasses RLS entirely, so anything
-- server-side keeps working.
--
-- SAFETY: every table below was verified to have zero `.from("<table>")` calls
-- anywhere in src/, and the codebase builds no table names dynamically. Locking
-- them cannot break a code path that doesn't exist.

ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs            ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.page_views            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags         ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.homepage_banners      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions            ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bundles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_values         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_option_values ENABLE ROW LEVEL SECURITY;

-- Verify: every row should show rowsecurity = true and zero policies.
--
-- SELECT c.relname, c.relrowsecurity, count(p.polname) AS policies
-- FROM pg_class c
-- LEFT JOIN pg_policy p ON p.polrelid = c.oid
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public' AND c.relkind = 'r'
-- GROUP BY 1, 2 ORDER BY 2, 1;
