import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import {
  GameCard,
  GameCardSkeleton,
  mapRawgGameToGameCard,
  useGamesQuery,
  type GameCardGame,
} from '@entities/game'

const searchPageSize = 12
const suggestionsLimit = 5

function useDebouncedValue<TValue>(value: TValue, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

export function SearchPage() {
  const navigate = useNavigate({ from: '/search' })
  const search = useSearch({ from: '/search' })
  const queryFromUrl = search.q ?? ''
  const [searchValue, setSearchValue] = useState(queryFromUrl)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const inputId = useId()
  const listboxId = useId()
  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300)
  const submittedSearch = queryFromUrl.trim()

  const suggestionsQuery = useGamesQuery(
    {
      search: debouncedSearch,
      page_size: suggestionsLimit,
    },
    { enabled: debouncedSearch.length > 1 }
  )
  const resultsQuery = useGamesQuery(
    {
      search: submittedSearch,
      page_size: searchPageSize,
    },
    { enabled: submittedSearch.length > 0 }
  )

  const suggestions = useMemo(
    () => suggestionsQuery.data?.results.map(mapRawgGameToGameCard) ?? [],
    [suggestionsQuery.data]
  )
  const results = useMemo(
    () => resultsQuery.data?.results.map(mapRawgGameToGameCard) ?? [],
    [resultsQuery.data]
  )

  useEffect(() => {
    setSearchValue(queryFromUrl)
  }, [queryFromUrl])

  useEffect(() => {
    setActiveSuggestionIndex(-1)
    setSuggestionsOpen(debouncedSearch.length > 1)
  }, [debouncedSearch])

  const activeSuggestionId =
    activeSuggestionIndex >= 0 ? `${listboxId}-${activeSuggestionIndex}` : undefined

  function submitSearch(nextQuery = searchValue) {
    const trimmedQuery = nextQuery.trim()
    setSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)

    void navigate({
      search: trimmedQuery ? { q: trimmedQuery } : {},
      replace: false,
    })
  }

  function clearSearch() {
    setSearchValue('')
    setSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)

    void navigate({
      search: {},
      replace: false,
    })
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
            Find games by title and jump into live RAWG results with keyboard-friendly suggestions.
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

      <section className="space-y-4" aria-live="polite">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Results</h2>
            <p className="text-sm text-muted-foreground">
              {submittedSearch ? `Showing matches for "${submittedSearch}"` : 'Submit a search to see results.'}
            </p>
          </div>
        </div>

        {!submittedSearch && <EmptySearchState />}
        {submittedSearch && resultsQuery.isLoading && <ResultsSkeleton />}
        {submittedSearch && !resultsQuery.isLoading && resultsQuery.error && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            {resultsQuery.error.message}
          </div>
        )}
        {submittedSearch && !resultsQuery.isLoading && !resultsQuery.error && results.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            No games matched your search.
          </div>
        )}
        {submittedSearch && !resultsQuery.isLoading && !resultsQuery.error && results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {results.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptySearchState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
      Type a title, choose a suggestion, or press Enter to search.
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  )
}
