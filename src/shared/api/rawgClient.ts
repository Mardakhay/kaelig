import { assertRawgApiKey, env } from '@shared/config/env'

type RequestParams = { [key: string]: string | number | boolean | null | undefined }

interface RawgErrorPayload {
  detail?: string
  error?: string
}

export class RawgApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RawgApiError'
    this.status = status
  }
}

function createUrl(endpoint: string, params: RequestParams = {}) {
  assertRawgApiKey()

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${env.rawgApiUrl}${normalizedEndpoint}`)
  url.searchParams.set('key', env.rawgApiKey)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url
}

export async function rawgRequest<TResponse>(
  endpoint: string,
  params?: RequestParams,
  signal?: AbortSignal
): Promise<TResponse> {
  const response = await fetch(createUrl(endpoint, params), { signal })

  if (!response.ok) {
    let message = `RAWG request failed with status ${response.status}`

    try {
      const payload = (await response.json()) as RawgErrorPayload
      message = payload.detail ?? payload.error ?? message
    } catch {
      message = response.statusText || message
    }

    throw new RawgApiError(message, response.status)
  }

  return response.json() as Promise<TResponse>
}
