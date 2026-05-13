
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom fetch with keepalive to prevent ECONNRESET/TLS disconnects
// during concurrent server-side requests (Next.js SSR fires many at once)
const stableFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    keepalive: true,
    // 15s timeout to prevent hanging connections; respect existing signal
    signal: init?.signal ?? AbortSignal.timeout(15000),
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: stableFetch,
  },
})
