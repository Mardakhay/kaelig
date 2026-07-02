import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import {
  GameCard,
  GameCardSkeleton,
  mapRawgGameToGameCard,
  useGamesQuery,
  useInfiniteGamesQuery,
  usePrefetchNextGamesPage,
  type GameListParams,
} from '@entities/game'
import { GameFilters, type GameFilterValues } from '@features/game-filters'

const searchPageSize = 12
const suggestionsLimit = 5

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function useDebouncedValue<TValue>(value: TValue, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

function yearToDates(year?: string) {
  return year ? `${year}-01-01,${year}-12-31` : undefined
}

function hasActiveFilters(filters: GameFilterValues) {
  return Object.values(filters).some(Boolean)
}

export function SearchPage() {
  const navigate = useNavigate({ from: '/search' })
  const search = useSearch({ from: '/search' })
  const queryFromUrl = search.q ?? ''
  const filters: GameFilterValues = {
    genre: search.genre,
    platform: search.platform,
    year: search.year,
    metacritic: search.metacritic,
    rating: search.rating,
    ordering: search.ordering,
  }
  const [searchValue, setSearchValue] = useState(queryFromUrl)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const inputId = useId()
  const listboxId = useId()
  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300)
  const submittedSearch = queryFromUrl.trim()
  const filtersAreActive = hasActiveFilters(filters)
  const resultsEnabled = submittedSearch.length > 0 || filtersAreActive
  const resultParams = useMemo<GameListParams>(
    () => ({
      search: submittedSearch || undefined,
      page_size: searchPageSize,
      genres: filters.genre,
      parent_platforms: filters.platform,
      dates: yearToDates(filters.year),
      metacritic: filters.metacritic,
      rating: filters.rating,
      ordering: filters.ordering || undefined,
    }),
    [
      filters.genre,
      filters.metacritic,
      filters.ordering,
      filters.platform,
      filters.rating,
      filters.year,
      submittedSearch,
    ]
  )
  const prefetchNextPage = usePrefetchNextGamesPage(resultParams)

  const suggestionsQuery = useGamesQuery(
    {
      search: debouncedSearch,
      page_size: suggestionsLimit,
    },
    { enabled: debouncedSearch.length > 1 }
  )
  const resultsQuery = useInfiniteGamesQuery(resultParams, { enabled: resultsEnabled })
  const {
    data: resultsData,
    error: resultsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: resultsLoading,
  } = resultsQuery

  const suggestions = useMemo(
    () => suggestionsQuery.data?.results.map(mapRawgGameToGameCard) ?? [],
    [suggestionsQuery.data]
  )
  const results = useMemo(
    () =>
      resultsData?.pages.flatMap(page =>
        page.results.map(mapRawgGameToGameCard)
      ) ?? [],
    [resultsData]
  )

  useEffect(() => {
    setSearchValue(queryFromUrl)
  }, [queryFromUrl])

  useEffect(() => {
    setActiveSuggestionIndex(-1)
    setSuggestionsOpen(debouncedSearch.length > 1)
  }, [debouncedSearch])

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current

    if (!loadMoreElement || !resultsEnabled) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '480px 0px' }
    )

    observer.observe(loadMoreElement)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, resultsEnabled])

  useEffect(() => {
    if (hasNextPage && resultsData?.pages.length) {
      prefetchNextPage(resultsData.pages.length + 1)
    }
  }, [hasNextPage, prefetchNextPage, resultsData?.pages.length])

  const activeSuggestionId =
    activeSuggestionIndex >= 0 ? `${listboxId}-${activeSuggestionIndex}` : undefined

  function navigateWithSearch(nextQuery: string, nextFilters: GameFilterValues, replace = false) {
    const trimmedQuery = nextQuery.trim()

    void navigate({
      search: {
        q: trimmedQuery || undefined,
        genre: nextFilters.genre,
        platform: nextFilters.platform,
        year: nextFilters.year,
        metacritic: nextFilters.metacritic,
        rating: nextFilters.rating,
        ordering: nextFilters.ordering,
      },
      replace,
    })
  }

  function submitSearch(nextQuery = searchValue) {
    setSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)
    navigateWithSearch(nextQuery, filters)
  }

  function clearSearch() {
    setSearchValue('')
    setSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)
    navigateWithSearch('', filters)
  }

  function updateFilters(nextFilters: GameFilterValues) {
    navigateWithSearch(submittedSearch, nextFilters, true)
  }

  function clearFilters() {
    navigateWithSearch(submittedSearch, {}, true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false)
      setActiveSuggestionIndex(-1)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSuggestionsOpen(true)
      setActiveSuggestionIndex(currentIndex =>
        Math.min(currentIndex + 1, suggestions.length - 1)
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestionIndex(currentIndex => Math.max(currentIndex - 1, -1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const selectedSuggestion = suggestions[activeSuggestionIndex]
      submitSearch(selectedSuggestion?.title ?? searchValue)
    }
  }

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Search games</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Find games by title and refine live RAWG results by genre, platform, year, score, rating, and order.
          </p>
        </div>

        <form className="relative max-w-3xl" role="search" onSubmit={event => {
          event.preventDefault()
          submitSearch()
        }}>
          <label htmlFor={inputId} className="sr-only">
            Search games
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id={inputId}
            type="search"
            value={searchValue}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen && suggestions.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={activeSuggestionId}
            placeholder="Search by game title"
            onChange={event => {
              setSearchValue(event.target.value)
              setSuggestionsOpen(true)
            }}
            onFocus={() => setSuggestionsOpen(debouncedSearch.length > 1)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-lg border border-border bg-card px-12 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {searchValue && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {suggestionsOpen && debouncedSearch.length > 1 && (
            <div className="absolute left-0 right-0 top-14 z-20 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
              {suggestionsQuery.isLoading && (
                <div className="p-3 text-sm text-muted-foreground">Searching...</div>
              )}
              {!suggestionsQuery.isLoading && suggestionsQuery.error && (
                <div className="p-3 text-sm text-error">{suggestionsQuery.error.message}</div>
              )}
              {!suggestionsQuery.isLoading && !suggestionsQuery.error && suggestions.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No suggestions found.</div>
              )}
              {!suggestionsQuery.isLoading && !suggestionsQuery.error && suggestions.length > 0 && (
                <ul id={listboxId} role="listbox" aria-label="Search suggestions" className="py-1">
                  {suggestions.map((game, index) => (
                    <li key={game.id} role="option" aria-selected={activeSuggestionIndex === index} id={`${listboxId}-${index}`}>
                      <button
                        type="button"
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => submitSearch(game.title)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                          activeSuggestionIndex === index
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <img
                          src={game.image}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                          loading="lazy"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{game.title}</span>
                          <span className="block text-xs text-muted-foreground">{game.releaseYear}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <GameFilters
          values={filters}
          onChange={updateFilters}
          onClear={clearFilters}
          className="min-w-0"
        />

        <section className="min-w-0 space-y-4" aria-live="polite">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">Results</h2>
              <p className="text-sm text-muted-foreground">
                {resultsEnabled
                  ? submittedSearch
                    ? `Showing matches for "${submittedSearch}"`
                    : 'Showing filtered games'
                  : 'Submit a search or choose filters to see results.'}
              </p>
            </div>
          </div>

          {!resultsEnabled && <EmptySearchState />}
          {resultsEnabled && resultsLoading && <ResultsSkeleton />}
          {resultsEnabled && !resultsLoading && resultsError && (
            <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
              {resultsError.message}
            </div>
          )}
          {resultsEnabled && !resultsLoading && !resultsError && results.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              No games matched your search and filters.
            </div>
          )}
          {resultsEnabled && !resultsLoading && !resultsError && results.length > 0 && (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {results.map(game => (
                    <motion.div key={game.id} variants={itemVariants} layout>
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              <div ref={loadMoreRef} className="min-h-12" aria-hidden="true" />

              {isFetchingNextPage && <ResultsSkeleton />}
              {!hasNextPage && (
                <p className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                  You reached the end of the results.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function EmptySearchState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
      Type a title, choose filters, or press Enter to search.
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  )
}
