import { Heart, ListPlus, Play, CircleCheck as CheckCircle2, Trash2, Gamepad2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useLibraryStore, useLibraryStats, type LibraryStatus, type LibraryGame } from '@entities/game'
import { EmptyState } from '@shared/ui/empty-state'
import { cn } from '@shared/lib/cn'

const tabs: { id: LibraryStatus; label: string; icon: typeof Heart }[] = [
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'wishlist', label: 'Wishlist', icon: ListPlus },
  { id: 'playing', label: 'Playing', icon: Play },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
]

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryStatus>('favorites')
  const favorites = useLibraryStore(state => state.favorites)
  const wishlist = useLibraryStore(state => state.wishlist)
  const playing = useLibraryStore(state => state.playing)
  const completed = useLibraryStore(state => state.completed)
  const stats = useLibraryStats()

  const currentGames = {
    favorites,
    wishlist,
    playing,
    completed,
  }[activeTab]

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">My Library</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage your game collection across favorites, wishlist, currently playing, and completed games.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Games"
            value={stats.totalGames}
            icon={Gamepad2}
            color="text-primary"
          />
          <StatCard
            label="Favorites"
            value={stats.favoritesCount}
            icon={Heart}
            color="text-error"
          />
          <StatCard
            label="Playing"
            value={stats.playingCount}
            icon={Play}
            color="text-accent"
          />
          <StatCard
            label="Completed"
            value={stats.completedCount}
            icon={CheckCircle2}
            color="text-success"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-xs',
                    isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                  )}
                >
                  {tab.id === 'favorites'
                    ? stats.favoritesCount
                    : tab.id === 'wishlist'
                      ? stats.wishlistCount
                      : tab.id === 'playing'
                        ? stats.playingCount
                        : stats.completedCount}
                </span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {currentGames.length === 0 ? (
              <EmptyLibraryState status={activeTab} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {currentGames.map(game => (
                  <LibraryGameCard key={game.id} game={game} status={activeTab} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: typeof Gamepad2
  color: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted', color)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

const statusColors: Record<LibraryStatus, string> = {
  favorites: 'border-error/40 bg-error/15 text-error',
  wishlist: 'border-warning/40 bg-warning/15 text-warning',
  playing: 'border-accent/40 bg-accent/15 text-accent',
  completed: 'border-success/40 bg-success/15 text-success',
}

const statusLabels: Record<LibraryStatus, string> = {
  favorites: 'Favorite',
  wishlist: 'Wishlist',
  playing: 'Playing',
  completed: 'Completed',
}

function LibraryGameCard({ game, status }: { game: LibraryGame; status: LibraryStatus }) {
  const removeGame = useLibraryStore(state => state.removeGame)
  const moveGame = useLibraryStore(state => state.moveGame)

  function handleRemove() {
    removeGame(status, game.id)
  }

  function handleMove(to: LibraryStatus) {
    moveGame(status, to, game.id)
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
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
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-background/10 opacity-80 transition-opacity group-hover:opacity-95" />

        <span className={cn('absolute left-3 top-3 rounded-md border px-2 py-1 text-xs font-semibold', statusColors[status])}>
          {statusLabels[status]}
        </span>

        <button
          type="button"
          aria-label={`Remove ${game.title} from ${status}`}
          onClick={handleRemove}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            {game.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            Added {new Date(game.addedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {status !== 'wishlist' && (
            <button
              type="button"
              onClick={() => handleMove('wishlist')}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ListPlus className="h-3 w-3" />
              Wishlist
            </button>
          )}
          {status !== 'playing' && (
            <button
              type="button"
              onClick={() => handleMove('playing')}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Play className="h-3 w-3" />
              Playing
            </button>
          )}
          {status !== 'completed' && (
            <button
              type="button"
              onClick={() => handleMove('completed')}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <CheckCircle2 className="h-3 w-3" />
              Complete
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function EmptyLibraryState({ status }: { status: LibraryStatus }) {
  const config = {
    favorites: { icon: Heart, label: 'favorites', description: 'Games you love will appear here.' },
    wishlist: { icon: ListPlus, label: 'wishlist', description: 'Games you want to play will appear here.' },
    playing: { icon: Play, label: 'playing', description: 'Games you are currently playing will appear here.' },
    completed: { icon: CheckCircle2, label: 'completed', description: 'Games you have finished will appear here.' },
  }

  const { icon: Icon, label, description } = config[status]

  return (
    <EmptyState
      icon={<Icon className="h-7 w-7" />}
      title={`No ${label} yet`}
      description={description}
      action={
        <Link
          to="/search"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse games
        </Link>
      }
      className="min-h-[280px]"
    />
  )
}
