import { createFileRoute } from '@tanstack/react-router'
import { SearchPage } from '@pages/search'

interface SearchRouteParams {
  q?: string
  genre?: string
  platform?: string
  year?: string
  metacritic?: string
  rating?: string
  ordering?: string
}

function readString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchRouteParams => ({
    q: readString(search.q),
    genre: readString(search.genre),
    platform: readString(search.platform),
    year: readString(search.year),
    metacritic: readString(search.metacritic),
    rating: readString(search.rating),
    ordering: readString(search.ordering),
  }),
  component: SearchPage,
})
