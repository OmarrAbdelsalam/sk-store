import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase service role environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

/**
 * Server-only Supabase client that bypasses row level security.
 *
 * The anon key ships to the browser, so anything it can do, a visitor can do.
 * Trusted server work — writing payment status from the gateway callback,
 * creating orders — needs a key that never leaves the server. The `server-only`
 * import above turns any accidental import from a client component into a build
 * error rather than a leaked key.
 *
 * Only reach for this where the route itself has already established that the
 * caller is allowed to do what it's about to do. It answers to no policy.
 *
 * Built on first use rather than at import time: route modules are imported
 * during `next build`, where request-time secrets aren't necessarily present,
 * and a missing key should fail the request that needs it — not the build.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const target = getClient();
    const value = Reflect.get(target, prop);
    // Bound to the real client: supabase-js methods read their own internals off
    // `this`, which would otherwise resolve to this proxy.
    return typeof value === "function" ? value.bind(target) : value;
  },
});
