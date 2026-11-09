declare const Netlify: {
  env: {
    get(name: string): string | undefined
  }
}

const RAWG_API_ORIGIN = 'https://api.rawg.io'
const ALLOWED_ENDPOINT = /^games(?:\/[a-zA-Z0-9-]+(?:\/(?:screenshots|movies))?)?$/

function jsonError(detail: string, status: number) {
  return Response.json(
    { detail },
    {
      status,
      headers: {
        'cache-control': 'no-store',
      },
    }
  )
}

export default async function rawgProxy(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonError('Only GET requests are supported.', 405)
  }

  const requestUrl = new URL(request.url)
  const endpoint = requestUrl.pathname.replace(/^\/api\/rawg\/?/, '')

  if (!ALLOWED_ENDPOINT.test(endpoint)) {
    return jsonError('Unsupported RAWG API endpoint.', 404)
  }

  const apiKey = Netlify.env.get('RAWG_API_KEY')

  if (!apiKey) {
    return jsonError('RAWG_API_KEY is missing from the Netlify Functions environment.', 500)
  }

  const upstreamUrl = new URL(`/api/${endpoint}`, RAWG_API_ORIGIN)

  requestUrl.searchParams.forEach((value, key) => {
    if (key !== 'key') {
      upstreamUrl.searchParams.set(key, value)
    }
  })

  upstreamUrl.searchParams.set('key', apiKey)

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(25_000),
    })

    const headers = new Headers({
      'content-type': upstreamResponse.headers.get('content-type') ?? 'application/json; charset=utf-8',
      'cache-control': upstreamResponse.ok
        ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
        : 'no-store',
    })

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError'

    return jsonError(
      isTimeout ? 'RAWG API request timed out.' : 'Could not reach the RAWG API.',
      isTimeout ? 504 : 502
    )
  }
}

export const config = {
  path: '/api/rawg/*',
  method: ['GET'],
}
