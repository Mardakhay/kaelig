import { createClient } from '@supabase/supabase-js'
import { env, assertSupabaseConfig } from '@shared/config/env'

try {
  assertSupabaseConfig()
} catch (err) {
  // Don't hard-crash the whole app over a missing Supabase config — game
  // browsing via RAWG still works without it. Surface a clear, actionable
  // message instead of the cryptic "supabaseUrl is required" error
  // supabase-js throws when handed an empty string.
  console.error(err instanceof Error ? err.message : err)
}

export const supabase = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
