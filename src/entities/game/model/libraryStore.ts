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

  const totalGames = favorites.length + wishlist.length + playing.length + completed.length

  const allGenres = [...favorites, ...wishlist, ...playing, ...completed]
    .flatMap(g => g.genres)

  const favoriteGenre = allGenres.length > 0
    ? allGenres.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    : {}

  const topGenre = Object.entries(favoriteGenre)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const allPlatforms = [...favorites, ...wishlist, ...playing, ...completed]
    .flatMap(g => g.platforms)

  const platformCounts = allPlatforms.reduce((acc, platform) => {
    acc[platform] = (acc[platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const favoritePlatform = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const averageRating = totalGames > 0
    ? [...favorites, ...wishlist, ...playing, ...completed]
        .reduce((sum, g) => sum + g.rating, 0) / totalGames
    : 0

  return {
    totalGames,
    favoritesCount: favorites.length,
    wishlistCount: wishlist.length,
    playingCount: playing.length,
    completedCount: completed.length,
    topGenre,
    favoritePlatform,
    averageRating,
    genreCounts: favoriteGenre,
    platformCounts,
  }
}
