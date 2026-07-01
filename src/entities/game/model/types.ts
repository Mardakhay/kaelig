export interface RawgPlatformParent {
  id: number
  name: string
  slug: string
}

export interface RawgPlatform {
  id: number
  name: string
  slug: string
}

export interface RawgGenre {
  id: number
  name: string
  slug: string
}

export interface RawgDeveloper {
  id: number
  name: string
  slug: string
}

export interface RawgPublisher {
  id: number
  name: string
  slug: string
}

export interface RawgStore {
  id: number
  name: string
  slug: string
}

export interface RawgShortScreenshot {
  id: number
  image: string
}

export interface RawgGameScreenshot {
  id: number
  image: string
}

export interface RawgGameMovie {
  id: number
  name: string
  preview: string
  data: {
    max: string
  }
}

export interface RawgGamePlatform {
  platform: RawgPlatform
  released_at?: string
  requirements_en?: {
    minimum?: string
    recommended?: string
  }
}

export interface RawgGame {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  rating: number
  rating_top: number
  metacritic: number | null
  parent_platforms?: { platform: RawgPlatformParent }[]
  platforms?: RawgGamePlatform[]
  genres: RawgGenre[]
  short_screenshots?: RawgShortScreenshot[]
}

export interface RawgGameDetails extends RawgGame {
  description_raw: string
  website: string
  developers: RawgDeveloper[]
  publishers: RawgPublisher[]
  stores: { id: number; store: RawgStore }[]
}

export interface RawgPaginatedResponse<TItem> {
  count: number
  next: string | null
  previous: string | null
  results: TItem[]
}

export interface GameListParams {
  page?: number
  page_size?: number
  search?: string
  genres?: string
  platforms?: string
  parent_platforms?: string
  dates?: string
  ordering?: string
  metacritic?: string
  rating?: string
}
