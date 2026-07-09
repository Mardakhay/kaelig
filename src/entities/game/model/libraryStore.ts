import { useMemo } from 'react'
import { create } from 'zustand'
import { supabase } from '@shared/api/supabaseClient'

export type LibraryStatus = 'favorites' | 'wishlist' | 'playing' | 'completed'

const STATUSES: LibraryStatus[] = ['favorites', 'wishlist', 'playing', 'completed']

export interface LibraryGame {
  id: number
  title: string
  image: string
  rating: number
  releaseYear: number
  platforms: string[]
  genres: string[]
  addedAt: string
}

interface LibraryRow {
  game_id: number
  status: LibraryStatus
  title: string
  image: string | null
  rating: number | null
  release_year: number | null
  platforms: string[]
  genres: string[]
  added_at: string
}

interface LibraryState {
  userId: string | null
  isHydrated: boolean
  isLoading: boolean
  favorites: LibraryGame[]
  wishlist: LibraryGame[]
  playing: LibraryGame[]
  completed: LibraryGame[]
  addGame: (status: LibraryStatus, game: LibraryGame) => void
  removeGame: (status: LibraryStatus, gameId: number) => void
  moveGame: (from: LibraryStatus, to: LibraryStatus, gameId: number) => void
  getGameStatus: (gameId: number) => LibraryStatus | null
  clearLibrary: () => void
  hydrate: (userId: string) => Promise<void>
  reset: () => void
}

const initialLists = {
  favorites: [] as LibraryGame[],
  wishlist: [] as LibraryGame[],
  playing: [] as LibraryGame[],
  completed: [] as LibraryGame[],
}

const initialState = {
  userId: null,
  isHydrated: false,
  isLoading: false,
  ...initialLists,
}

function rowToGame(row: LibraryRow): LibraryGame {
  return {
    id: row.game_id,
    title: row.title,
    image: row.image ?? '',
    rating: row.rating ?? 0,
    releaseYear: row.release_year ?? 0,
    platforms: row.platforms ?? [],
    genres: row.genres ?? [],
    addedAt: row.added_at,
  }
}

function groupByStatus(rows: LibraryRow[]) {
  const grouped = {
    favorites: [] as LibraryGame[],
    wishlist: [] as LibraryGame[],
    playing: [] as LibraryGame[],
    completed: [] as LibraryGame[],
  }
  for (const row of rows) {
    grouped[row.status].push(rowToGame(row))
  }
  return grouped
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  ...initialState,

  hydrate: async userId => {
    set({ isLoading: true })

    const { data, error } = await supabase
      .from('library_games')
      .select('game_id, status, title, image, rating, release_year, platforms, genres, added_at')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('Failed to load library:', error.message)
      set({ isLoading: false, isHydrated: true, userId })
      return
    }

    const grouped = groupByStatus((data ?? []) as LibraryRow[])
    set({ ...grouped, userId, isHydrated: true, isLoading: false })
  },

  reset: () => set({ ...initialState }),

  addGame: (status, game) => {
    const userId = get().userId
    if (!userId) return

    const alreadyThere = get()[status].some(g => g.id === game.id)
    if (alreadyThere) return

    const gameWithTimestamp: LibraryGame = {
      ...game,
      addedAt: game.addedAt || new Date().toISOString(),
    }

    set(state => {
      const next: Partial<LibraryState> = {
        [status]: [gameWithTimestamp, ...state[status]],
      }
      for (const s of STATUSES) {
        if (s !== status && state[s].some(g => g.id === game.id)) {
          next[s] = state[s].filter(g => g.id !== game.id)
        }
      }
      return next
    })

    void supabase
      .from('library_games')
      .upsert(
        {
          user_id: userId,
          game_id: game.id,
          status,
          title: game.title,
          image: game.image,
          rating: game.rating,
          release_year: game.releaseYear,
          platforms: game.platforms,
          genres: game.genres,
          added_at: gameWithTimestamp.addedAt,
        },
        { onConflict: 'user_id,game_id' }
      )
      .then(({ error }) => {
        if (error) console.error('Failed to save game to library:', error.message)
      })
  },

  removeGame: (status, gameId) => {
    const userId = get().userId
    if (!userId) return

    set(state => ({
      [status]: state[status].filter(g => g.id !== gameId),
    }))

    void supabase
      .from('library_games')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .then(({ error }) => {
        if (error) console.error('Failed to remove game from library:', error.message)
      })
  },

  moveGame: (from, to, gameId) => {
    const userId = get().userId
    if (!userId) return

    const game = get()[from].find(g => g.id === gameId)
    if (!game) return

    const existingInTarget = get()[to].some(g => g.id === gameId)
    const movedAt = new Date().toISOString()

    set(state => {
      if (existingInTarget) {
        return { [from]: state[from].filter(g => g.id !== gameId) }
      }
      return {
        [from]: state[from].filter(g => g.id !== gameId),
        [to]: [{ ...game, addedAt: movedAt }, ...state[to]],
      }
    })

    if (existingInTarget) return

    void supabase
      .from('library_games')
      .update({ status: to, added_at: movedAt })
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .then(({ error }) => {
        if (error) console.error('Failed to move game:', error.message)
      })
  },

  getGameStatus: gameId => {
    const state = get()
    if (state.favorites.some(g => g.id === gameId)) return 'favorites'
    if (state.wishlist.some(g => g.id === gameId)) return 'wishlist'
    if (state.playing.some(g => g.id === gameId)) return 'playing'
    if (state.completed.some(g => g.id === gameId)) return 'completed'
    return null
  },

  clearLibrary: () => {
    const userId = get().userId
    set({ ...initialLists })
    if (!userId) return

    void supabase
      .from('library_games')
      .delete()
      .eq('user_id', userId)
      .then(({ error }) => {
        if (error) console.error('Failed to clear library:', error.message)
      })
  },
}))

/**
 * Reactive alternative to `useLibraryStore(state => state.getGameStatus)`.
 * Selecting `getGameStatus` itself doesn't work for rendering — that
 * function's reference never changes, so components subscribing to it never
 * re-render when favorites/wishlist/playing/completed actually change. This
 * hook selects a derived primitive instead, which Zustand can properly diff.
 */
export function useGameStatus(gameId: number): LibraryStatus | null {
  return useLibraryStore(state => {
    if (state.favorites.some(g => g.id === gameId)) return 'favorites'
    if (state.wishlist.some(g => g.id === gameId)) return 'wishlist'
    if (state.playing.some(g => g.id === gameId)) return 'playing'
    if (state.completed.some(g => g.id === gameId)) return 'completed'
    return null
  })
}

export function useLibraryStats() {
  const favorites = useLibraryStore(state => state.favorites)
  const wishlist = useLibraryStore(state => state.wishlist)
  const playing = useLibraryStore(state => state.playing)
  const completed = useLibraryStore(state => state.completed)

  const allGames = useMemo(
    () => [...favorites, ...wishlist, ...playing, ...completed],
    [favorites, wishlist, playing, completed]
  )

  return useMemo(() => {
    const totalGames = allGames.length
    const favoritesCount = favorites.length
    const wishlistCount = wishlist.length
    const playingCount = playing.length
    const completedCount = completed.length

    const genreCounts: Record<string, number> = {}
    const platformCounts: Record<string, number> = {}
    let ratingSum = 0

    for (const game of allGames) {
      ratingSum += game.rating
      for (const genre of game.genres) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      }
      for (const platform of game.platforms) {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1
      }
    }

    const genreEntries = Object.entries(genreCounts)
    const platformEntries = Object.entries(platformCounts)

    const topGenre = genreEntries.length > 0
      ? genreEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      : null

    const favoritePlatform = platformEntries.length > 0
      ? platformEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      : null

    const averageRating = totalGames > 0 ? ratingSum / totalGames : 0

    return {
      totalGames,
      favoritesCount,
      wishlistCount,
      playingCount,
      completedCount,
      topGenre,
      favoritePlatform,
      averageRating,
      genreCounts,
      platformCounts,
    }
  }, [allGames, favorites.length, wishlist.length, playing.length, completed.length])
}
