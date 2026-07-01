import { Calendar, Star } from 'lucide-react'
import { cn } from '@shared/lib/cn'

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
  game: GameCardGame
  className?: string
}

export function GameCard({ game, className }: GameCardProps) {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-xs font-semibold text-warning backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-current" />
          {game.rating.toFixed(1)}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {game.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {game.releaseYear}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {game.platforms.slice(0, 3).map(platform => (
            <span
              key={platform}
              className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              {platform}
            </span>
          ))}
        </div>

        <p className="line-clamp-1 text-sm text-muted-foreground">
          {game.genres.join(' / ')}
        </p>
      </div>
    </article>
  )
}
