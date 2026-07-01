import { createFileRoute } from '@tanstack/react-router'
import { SearchPage } from '@pages/search'

interface SearchRouteParams {
  q?: string
}

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchRouteParams => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  component: SearchPage,
})
