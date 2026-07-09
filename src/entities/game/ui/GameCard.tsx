import { memo, useCallback } from 'react'
import { Calendar, Gamepad2, Heart, Star, Tag } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@shared/lib/cn'
import { useAuth } from '@shared/hooks'
import { useLibraryStore, useGameStatus, type LibraryGame } from '@entities/game'

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
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const getGameStatus = useLibraryStore(state => state.getGameStatus)
  const addGame = useLibraryStore(state => state.addGame)
  const removeGame = useLibraryStore(state => state.removeGame)
  const moveGame = useLibraryStore(state => state.moveGame)
  const status = useGameStatus(game.id)

  const isFavorite = isAuthenticated && status === 'favorites'

  const handleFavoriteToggle = useCallback(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/auth' })
      return
    }

    const currentStatus = getGameStatus(game.id)
    if (currentStatus === 'favorites') {
      removeGame('favorites', game.id)
    } else if (currentStatus) {
      // Game already exists in another list (e.g. wishlist) — move it in
      // place with a single UPDATE instead of a separate DELETE + UPSERT.
      // Firing those as two unsequenced requests raced against each other:
      // if the DELETE landed after the UPSERT, the row vanished from
      // Supabase entirely even though the UI still showed it as favorited.
      moveGame(currentStatus, 'favorites', game.id)
    } else {
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
  }, [game, isAuthenticated, navigate, getGameStatus, addGame, removeGame, moveGame])

  const platforms = game.platforms.slice(0, 4)
  const genres = game.genres.slice(0, 3)

  return (
    <article
      className={cn(
        'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
        className
      )}
    >
      <Link
        to="/game/$id"
        params={{ id: String(game.id) }}
        className="absolute inset-0 z-0"
        aria-label={`View details for ${game.title}`}
      >
        <span className="sr-only">{game.title}</span>
      </Link>

      <div className="relative z-10 aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={game.image}
          alt=""
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
          onClick={handleFavoriteToggle}
          className={cn(
            'absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            isFavorite && 'border-error/40 bg-error/15 text-error'
          )}
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} aria-hidden="true" />
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-4">
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
