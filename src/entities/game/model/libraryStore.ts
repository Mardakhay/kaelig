import { useMemo } from 'react'
import { create } from 'zustand'
import { supabase } from '@shared/api/supabaseClient'
import { pushToast } from '@shared/ui/toast'

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

/**
 * Minimal shape of a Supabase Realtime postgres_changes payload for this
 * table. Defined locally (instead of importing from @supabase/realtime-js)
 * to avoid coupling to a transitive package @supabase/supabase-js doesn't
 * publicly re-export.
 */
interface RealtimeChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Partial<LibraryRow>
  old: Partial<LibraryRow>
}

type RealtimeChannelLike = ReturnType<typeof supabase.channel>

interface LibraryState {
  userId: string | null
  isHydrated: boolean
  isLoading: boolean
  /** game IDs with a write currently in flight, for disabling UI controls */
  pendingIds: Record<number, boolean>
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
  pendingIds: {} as Record<number, boolean>,
  ...initialLists,
}

function rowToGame(row: Partial<LibraryRow> & Pick<LibraryRow, 'game_id'>): LibraryGame {
  return {
    id: row.game_id,
    title: row.title ?? '',
    image: row.image ?? '',
    rating: row.rating ?? 0,
    releaseYear: row.release_year ?? 0,
    platforms: row.platforms ?? [],
    genres: row.genres ?? [],
    addedAt: row.added_at ?? new Date().toISOString(),
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

// Guards a hydrate() call that's still in flight against overwriting fresher
// state — e.g. the user signs out and back in as a different account before
// the first request resolves. Bumped by every hydrate() and reset() call so
// a stale response can recognize it's no longer the latest one.
let hydrateRequestId = 0

let realtimeChannel: RealtimeChannelLike | null = null

function unsubscribeRealtime() {
  if (realtimeChannel) {
    void supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
}

function applyRealtimeChange(userId: string, payload: RealtimeChangePayload) {
  // Ignore events that arrive for a user we've since signed out of / switched
  // away from (there's a brief window between unsubscribing and the socket
  // actually closing).
  if (useLibraryStore.getState().userId !== userId) return

  if (payload.eventType === 'DELETE') {
    const gameId = payload.old.game_id
    if (gameId == null) return

    useLibraryStore.setState(state => {
      const next: Partial<LibraryState> = {}
      for (const s of STATUSES) {
        if (state[s].some(g => g.id === gameId)) {
          next[s] = state[s].filter(g => g.id !== gameId)
        }
      }
      return next
    })
    return
  }

  const row = payload.new
  if (row.game_id == null || !row.status) return

  const status = row.status
  const game = rowToGame(row as Partial<LibraryRow> & Pick<LibraryRow, 'game_id'>)

  useLibraryStore.setState(state => {
    const next: Partial<LibraryState> = {
      [status]: [game, ...state[status].filter(g => g.id !== game.id)],
    }
    for (const s of STATUSES) {
      if (s !== status && state[s].some(g => g.id === game.id)) {
        next[s] = state[s].filter(g => g.id !== game.id)
      }
    }
    return next
  })
}

function subscribeRealtime(userId: string) {
  unsubscribeRealtime()

  // Keeps other open tabs/devices for the same account in sync — e.g.
  // favoriting a game on your phone updates it live on an open laptop tab.
  // Requires Realtime to be enabled for the `library_games` table in the
  // Supabase dashboard (Database → Replication).
  realtimeChannel = supabase
    .channel(`library_games:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'library_games', filter: `user_id=eq.${userId}` },
      (payload: RealtimeChangePayload) => applyRealtimeChange(userId, payload)
    )
    .subscribe()
}

function setPending(gameId: number, isPending: boolean) {
  useLibraryStore.setState(state => {
    if (isPending) {
      return { pendingIds: { ...state.pendingIds, [gameId]: true } }
    }
    if (!(gameId in state.pendingIds)) return state
    const rest = { ...state.pendingIds }
    delete rest[gameId]
    return { pendingIds: rest }
  })
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  ...initialState,

  hydrate: async userId => {
    const requestId = ++hydrateRequestId
    set({ isLoading: true })

    const { data, error } = await supabase
      .from('library_games')
      .select('game_id, status, title, image, rating, release_year, platforms, genres, added_at')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    // A newer hydrate() (or a reset()) started after this one fired — drop
    // this now-stale response instead of overwriting fresher state.
    if (requestId !== hydrateRequestId) return

    if (error) {
      console.error('Failed to load library:', error.message)
      set({ isLoading: false, isHydrated: true, userId })
      pushToast({
        variant: 'error',
        title: 'Could not load your library',
        description: 'Check your connection and refresh the page to try again.',
      })
      return
    }

    const grouped = groupByStatus((data ?? []) as LibraryRow[])
    set({ ...grouped, userId, isHydrated: true, isLoading: false })

    subscribeRealtime(userId)
  },

  reset: () => {
    hydrateRequestId++ // invalidate any hydrate() still in flight
    unsubscribeRealtime()
    set({ ...initialState })
  },

  addGame: (status, game) => {
    const userId = get().userId
    if (!userId) return

    const alreadyThere = get()[status].some(g => g.id === game.id)
    if (alreadyThere) return

    const gameWithTimestamp: LibraryGame = {
      ...game,
      addedAt: game.addedAt || new Date().toISOString(),
    }

    const snapshot: Partial<LibraryState> = {
      favorites: get().favorites,
      wishlist: get().wishlist,
      playing: get().playing,
      completed: get().completed,
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

    setPending(game.id, true)

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
        setPending(game.id, false)
        if (error) {
          console.error('Failed to save game to library:', error.message)
          // Only roll back if we're still looking at the same user's data —
          // don't stomp on a library that's since been hydrated for someone else.
          if (get().userId === userId) set(snapshot)
          pushToast({
            variant: 'error',
            title: 'Could not save to library',
            description: `${game.title} wasn't added — check your connection and try again.`,
          })
        }
      })
  },

  removeGame: (status, gameId) => {
    const userId = get().userId
    if (!userId) return

    const removedGame = get()[status].find(g => g.id === gameId)

    set(state => ({
      [status]: state[status].filter(g => g.id !== gameId),
    }))

    setPending(gameId, true)

    void supabase
      .from('library_games')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .then(({ error }) => {
        setPending(gameId, false)
        if (error) {
          console.error('Failed to remove game from library:', error.message)
          if (get().userId === userId && removedGame) {
            set(state =>
              state[status].some(g => g.id === gameId)
                ? state
                : { [status]: [removedGame, ...state[status]] }
            )
          }
          pushToast({
            variant: 'error',
            title: 'Could not remove from library',
            description: removedGame
              ? `${removedGame.title} wasn't removed — check your connection and try again.`
              : 'Check your connection and try again.',
          })
        }
      })
  },

  moveGame: (from, to, gameId) => {
    const userId = get().userId
    if (!userId) return

    const game = get()[from].find(g => g.id === gameId)
    if (!game) return

    const snapshot: Partial<LibraryState> = {
      [from]: get()[from],
      [to]: get()[to],
    }

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

    setPending(gameId, true)

    void supabase
      .from('library_games')
      .update({ status: to, added_at: movedAt })
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .then(({ error }) => {
        setPending(gameId, false)
        if (error) {
          console.error('Failed to move game:', error.message)
          if (get().userId === userId) set(snapshot)
          pushToast({
            variant: 'error',
            title: 'Could not update library',
            description: `${game.title} wasn't moved — check your connection and try again.`,
          })
        }
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
    const snapshot: Partial<LibraryState> = {
      favorites: get().favorites,
      wishlist: get().wishlist,
      playing: get().playing,
      completed: get().completed,
    }
    set({ ...initialLists })
    if (!userId) return

    void supabase
      .from('library_games')
      .delete()
      .eq('user_id', userId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to clear library:', error.message)
          if (get().userId === userId) set(snapshot)
          pushToast({
            variant: 'error',
            title: 'Could not clear library',
            description: 'Check your connection and try again.',
          })
        }
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

/** Whether a write for this game is currently in flight, for disabling controls. */
export function useIsGamePending(gameId: number): boolean {
  return useLibraryStore(state => Boolean(state.pendingIds[gameId]))
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
