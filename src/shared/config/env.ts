interface AppEnv {
  rawgApiKey: string
  rawgApiUrl: string
}

export const env: AppEnv = {
  rawgApiKey: import.meta.env.VITE_RAWG_API_KEY ?? '',
  rawgApiUrl: import.meta.env.VITE_RAWG_API_URL ?? 'https://api.rawg.io/api',
}

export function assertRawgApiKey() {
  if (!env.rawgApiKey) {
    throw new Error('Missing VITE_RAWG_API_KEY environment variable')
  }
}
