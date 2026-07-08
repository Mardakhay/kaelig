interface AppEnv {
  rawgApiKey: string
  rawgApiUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
}

export const env: AppEnv = {
  rawgApiKey: import.meta.env.VITE_RAWG_API_KEY ?? '',
  rawgApiUrl: import.meta.env.VITE_RAWG_API_URL ?? 'https://api.rawg.io/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
}

export function assertRawgApiKey() {
  if (!env.rawgApiKey) {
    throw new Error('Missing VITE_RAWG_API_KEY environment variable')
  }
}

export function assertSupabaseConfig() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variable')
  }
}
