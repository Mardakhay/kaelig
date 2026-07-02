import { memo, useCallback } from 'react'
import { Calendar, Gamepad2, Heart, Star, Tag } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@shared/lib/cn'
import { useLibraryStore, type LibraryGame } from '../model/libraryStore'

export interface GameCardGame {
  id: number
  title: string
  image: string
  rating: number
  releaseYear: number
  platforms: string[]
  genres: string[]
}

interface GameCardProps {
  game: GameCardGame | LibraryGame
  className?: string
}

const GameCardInner = ({ game, className }: GameCardProps) => {
  const getGameStatus = useLibraryStore(state => state.getGameStatus)
  const addGame = useLibraryStore(state => state.addGame)
  const removeGame = useLibraryStore(state => state.removeGame)

  const isFavorite = getGameStatus(game.id) === 'favorites'

  const handleFavoriteToggle = useCallback(() => {
    const currentStatus = getGameStatus(game.id)
    if (currentStatus === 'favorites') {
      removeGame('favorites', game.id)
    } else {
      if (currentStatus) {
        removeGame(currentStatus, game.id)
      }
      addGame('favorites', {
        id: game.id,
        title: game.title,
        image: game.image,
        rating: game.rating,
        releaseYear: game.releaseYear,
        platforms: game.platforms,
        genres: game.genres,
        addedAt: new Date().toISOString(),
      })
    }
  }, [game, getGameStatus, addGame, removeGame])

  const handleButtonClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    handleFavoriteToggle()
  }, [handleFavoriteToggle])

  const platforms = game.platforms.slice(0, 4)
  const genres = game.genres.slice(0, 3)

  return (
    <Link to="/game/$id" params={{ id: String(game.id) }}>
      <article
        className={cn(
          'group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={game.image}
            alt={game.title}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-background/10 opacity-80 transition-opacity group-hover:opacity-95" />

          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-xs font-semibold text-warning shadow-sm backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {game.rating.toFixed(1)}
          </div>

          <button
            type="button"
            aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
            aria-pressed={isFavorite}
            onClick={handleButtonClick}
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isFavorite && 'border-error/40 bg-error/15 text-error'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
              {game.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{game.releaseYear}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" aria-label="Platforms">
            {platforms.map(platform => (
              <span
                key={platform}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                <Gamepad2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{platform}</span>
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap gap-1.5" aria-label="Genres">
            {genres.map(genre => (
              <span
                key={genre}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                <Tag className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{genre}</span>
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  )
}

export const GameCard = memo(GameCardInner)

interface GameCardSkeletonProps {
  className?: string
}

export function GameCardSkeleton({ className }: GameCardSkeletonProps) {
  return (
    <article
      aria-hidden="true"
      className={cn(
        'flex h-full min-w-0 animate-pulse flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm',
        className
      )}
    >
      <div className="aspect-[4/3] bg-muted" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded-md bg-muted" />
          <div className="h-3 w-1/3 rounded-md bg-muted" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-14 rounded-md bg-muted" />
          <div className="h-6 w-16 rounded-md bg-muted" />
          <div className="h-6 w-12 rounded-md bg-muted" />
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <div className="h-6 w-20 rounded-md bg-muted" />
          <div className="h-6 w-16 rounded-md bg-muted" />
        </div>
      </div>
    </article>
  )
}
