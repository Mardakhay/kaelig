interface AppEnv {
  supabaseUrl: string
  supabaseAnonKey: string
}

export const env: AppEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
}

export function assertSupabaseConfig() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variable')
  }
}
