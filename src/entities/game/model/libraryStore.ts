import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type LibraryStatus = 'favorites' | 'wishlist' | 'playing' | 'completed'

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

interface LibraryState {
  favorites: LibraryGame[]
  wishlist: LibraryGame[]
  playing: LibraryGame[]
  completed: LibraryGame[]
  addGame: (status: LibraryStatus, game: LibraryGame) => void
  removeGame: (status: LibraryStatus, gameId: number) => void
  moveGame: (from: LibraryStatus, to: LibraryStatus, gameId: number) => void
  isGameInLibrary: (gameId: number) => LibraryStatus | null
  getGameStatus: (gameId: number) => LibraryStatus | null
  clearLibrary: () => void
}

const initialState = {
  favorites: [],
  wishlist: [],
  playing: [],
  completed: [],
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addGame: (status, game) =>
        set(state => {
          const existingGame = state[status].find(g => g.id === game.id)
          if (existingGame) return state

          const gameWithTimestamp: LibraryGame = {
            ...game,
            addedAt: game.addedAt || new Date().toISOString(),
          }

          return {
            [status]: [...state[status], gameWithTimestamp],
          }
        }),

      removeGame: (status, gameId) =>
        set(state => ({
          [status]: state[status].filter(g => g.id !== gameId),
        })),

      moveGame: (from, to, gameId) =>
        set(state => {
          const game = state[from].find(g => g.id === gameId)
          if (!game) return state

          const existingInTarget = state[to].find(g => g.id === gameId)
          if (existingInTarget) {
            return {
              [from]: state[from].filter(g => g.id !== gameId),
            }
          }

          return {
            [from]: state[from].filter(g => g.id !== gameId),
            [to]: [...state[to], { ...game, addedAt: new Date().toISOString() }],
          }
        }),

      isGameInLibrary: gameId => {
        const state = get()
        if (state.favorites.some(g => g.id === gameId)) return 'favorites'
        if (state.wishlist.some(g => g.id === gameId)) return 'wishlist'
        if (state.playing.some(g => g.id === gameId)) return 'playing'
        if (state.completed.some(g => g.id === gameId)) return 'completed'
        return null
      },

      getGameStatus: gameId => {
        const state = get()
        if (state.favorites.some(g => g.id === gameId)) return 'favorites'
        if (state.wishlist.some(g => g.id === gameId)) return 'wishlist'
        if (state.playing.some(g => g.id === gameId)) return 'playing'
        if (state.completed.some(g => g.id === gameId)) return 'completed'
        return null
      },

      clearLibrary: () => set(initialState),
    }),
    {
      name: 'kaelig-library',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        favorites: state.favorites,
        wishlist: state.wishlist,
        playing: state.playing,
        completed: state.completed,
      }),
    }
  )
)

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
