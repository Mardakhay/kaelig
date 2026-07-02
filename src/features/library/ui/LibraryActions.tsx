import { Heart, ListPlus, Play, CircleCheck as CheckCircle2 } from 'lucide-react'
import { cn } from '@shared/lib/cn'
import {
  useLibraryStore,
  type LibraryStatus,
  type LibraryGame,
} from '@entities/game/model/libraryStore'

interface LibraryActionsProps {
  game: LibraryGame
  className?: string
  showLabel?: boolean
}

const statusConfig: Record<LibraryStatus, { label: string; icon: typeof Heart; color: string }> = {
  favorites: { label: 'Favorites', icon: Heart, color: 'text-error' },
  wishlist: { label: 'Wishlist', icon: ListPlus, color: 'text-warning' },
  playing: { label: 'Playing', icon: Play, color: 'text-accent' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-success' },
}

export function LibraryActions({ game, className, showLabel = false }: LibraryActionsProps) {
  const currentStatus = useLibraryStore(state => state.getGameStatus(game.id))
  const addGame = useLibraryStore(state => state.addGame)
  const removeGame = useLibraryStore(state => state.removeGame)

  function handleToggle(status: LibraryStatus) {
    if (currentStatus === status) {
      removeGame(status, game.id)
    } else {
      if (currentStatus) {
        removeGame(currentStatus, game.id)
      }
      addGame(status, game)
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {(Object.entries(statusConfig) as [LibraryStatus, typeof statusConfig[LibraryStatus]][]).map(
        ([status, config]) => {
          const Icon = config.icon
          const isActive = currentStatus === status

          return (
            <button
              key={status}
              type="button"
              onClick={() => handleToggle(status)}
              aria-label={`${isActive ? 'Remove from' : 'Add to'} ${config.label}`}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? `bg-${status === 'favorites' ? 'error' : status === 'wishlist' ? 'warning' : status === 'playing' ? 'accent' : 'success'}/15 border border-current ${config.color}`
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              style={
                isActive
                  ? {
                      backgroundColor:
                        status === 'favorites'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : status === 'wishlist'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : status === 'playing'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(34, 197, 94, 0.15)',
                    }
                  : undefined
              }
            >
              <Icon className={cn('h-3.5 w-3.5', isActive && 'fill-current')} />
              {showLabel && <span>{config.label}</span>}
            </button>
          )
        }
      )}
    </div>
  )
}

export function FavoriteButton({
  game,
  className,
}: {
  game: LibraryGame
  className?: string
}) {
  const currentStatus = useLibraryStore(state => state.getGameStatus(game.id))
  const addGame = useLibraryStore(state => state.addGame)
  const removeGame = useLibraryStore(state => state.removeGame)

  const isFavorite = currentStatus === 'favorites'

  function handleToggle() {
    if (isFavorite) {
      removeGame('favorites', game.id)
    } else {
      if (currentStatus) {
        removeGame(currentStatus, game.id)
      }
      addGame('favorites', game)
    }
  }

  return (
    <button
      type="button"
      aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
      aria-pressed={isFavorite}
      onClick={handleToggle}
      className={cn(
        'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isFavorite && 'border-error/40 bg-error/15 text-error',
        className
      )}
    >
      <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
    </button>
  )
}

export function useLibraryActions() {
  const addGame = useLibraryStore(state => state.addGame)
  const removeGame = useLibraryStore(state => state.removeGame)
  const moveGame = useLibraryStore(state => state.moveGame)
  const getGameStatus = useLibraryStore(state => state.getGameStatus)
  const isGameInLibrary = useLibraryStore(state => state.isGameInLibrary)

  return {
    addGame,
    removeGame,
    moveGame,
    getGameStatus,
    isGameInLibrary,
  }
}
