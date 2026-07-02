import { motion } from 'framer-motion'
import {
  BarChart3,
  Calendar,
  Gamepad2,
  MonitorSmartphone,
  PieChart,
  Play,
  Star,
  Trophy,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { useLibraryStore, useLibraryStats } from '@entities/game'
import { EmptyState } from '@shared/ui/empty-state'
import { cn } from '@shared/lib/cn'

const motionProps = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export function ProfilePage() {
  const stats = useLibraryStats()
  const favorites = useLibraryStore(state => state.favorites)
  const wishlist = useLibraryStore(state => state.wishlist)
  const playing = useLibraryStore(state => state.playing)
  const completed = useLibraryStore(state => state.completed)

  const allGames = [...favorites, ...wishlist, ...playing, ...completed]

  if (stats.totalGames === 0) {
    return (
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">
              View your gaming statistics and preferences.
            </p>
          </div>
        </section>

        <EmptyState
          icon={<Gamepad2 className="h-7 w-7" />}
          title="No games in your library yet"
          description="Add games to your library to see personalized statistics and insights."
          action={
            <a
              href="/search"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse games
            </a>
          }
          className="min-h-[320px]"
        />
      </div>
    )
  }

  const genreEntries = Object.entries(stats.genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const platformEntries = Object.entries(stats.platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const completionRate = stats.totalGames > 0
    ? Math.round((stats.completedCount / stats.totalGames) * 100)
    : 0

  const averageYear = allGames.length > 0
    ? Math.round(allGames.reduce((sum, g) => sum + g.releaseYear, 0) / allGames.length)
    : null

  const topRatedGame = allGames.reduce((top, game) =>
    game.rating > top.rating ? game : top
  , allGames[0])

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Your gaming statistics and preferences.
          </p>
        </div>
      </section>

      <motion.section {...motionProps} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Gamepad2}
          label="Total Games"
          value={stats.totalGames}
          color="text-primary"
        />
        <StatCard
          icon={Trophy}
          label="Completion Rate"
          value={`${completionRate}%`}
          color="text-warning"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={stats.averageRating.toFixed(1)}
          color="text-accent"
        />
        <StatCard
          icon={Calendar}
          label="Avg Release Year"
          value={averageYear?.toString() ?? '—'}
          color="text-info"
        />
      </motion.section>

      <motion.section {...motionProps} className="grid gap-4 lg:grid-cols-3">
        <ProgressBarCard
          title="Library Breakdown"
          items={[
            { label: 'Favorites', count: stats.favoritesCount, total: stats.totalGames, color: 'bg-error' },
            { label: 'Wishlist', count: stats.wishlistCount, total: stats.totalGames, color: 'bg-warning' },
            { label: 'Playing', count: stats.playingCount, total: stats.totalGames, color: 'bg-accent' },
            { label: 'Completed', count: stats.completedCount, total: stats.totalGames, color: 'bg-success' },
          ]}
        />

        <GenreChart title="Top Genres" data={genreEntries} />

        <PlatformChart title="Top Platforms" data={platformEntries} />
      </motion.section>

      <motion.section {...motionProps} className="grid gap-4 lg:grid-cols-2">
        <TopGameCard game={topRatedGame} />

        <RecentActivity
          recentGames={allGames
            .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
            .slice(0, 5)}
        />
      </motion.section>

      <motion.section {...motionProps} className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          Gaming Insights
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            label="Favorite Genre"
            value={stats.topGenre ?? '—'}
            icon={PieChart}
          />
          <InsightCard
            label="Favorite Platform"
            value={stats.favoritePlatform ?? '—'}
            icon={MonitorSmartphone}
          />
          <InsightCard
            label="Currently Playing"
            value={stats.playingCount.toString()}
            icon={Play}
          />
          <InsightCard
            label="Games Completed"
            value={stats.completedCount.toString()}
            icon={CheckCircle2}
          />
        </div>
      </motion.section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Gamepad2
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <span className={cn('flex h-12 w-12 items-center justify-center rounded-lg bg-muted', color)}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ProgressBarCard({
  title,
  items,
}: {
  title: string
  items: { label: string; count: number; total: number; color: string }[]
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <BarChart3 className="h-5 w-5 text-primary" />
        {title}
      </h3>

      <div className="space-y-4">
        {items.map(item => {
          const percentage = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', item.color)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GenreChart({ title, data }: { title: string; data: [string, number][] }) {
  const maxCount = Math.max(...data.map(([, count]) => count), 1)

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <PieChart className="h-5 w-5 text-primary" />
        {title}
      </h3>

      <div className="space-y-3">
        {data.map(([genre, count]) => {
          const percentage = (count / maxCount) * 100

          return (
            <div key={genre} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{genre}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          )
        })}

        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">No genre data yet.</p>
        )}
      </div>
    </div>
  )
}

function PlatformChart({ title, data }: { title: string; data: [string, number][] }) {
  const maxCount = Math.max(...data.map(([, count]) => count), 1)

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <MonitorSmartphone className="h-5 w-5 text-primary" />
        {title}
      </h3>

      <div className="space-y-3">
        {data.map(([platform, count]) => {
          const percentage = (count / maxCount) * 100

          return (
            <div key={platform} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{platform}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-accent"
                />
              </div>
            </div>
          )
        })}

        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">No platform data yet.</p>
        )}
      </div>
    </div>
  )
}

function TopGameCard({ game }: { game: { title: string; image: string; rating: number; releaseYear: number } }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid lg:grid-cols-[200px_1fr]">
        <div className="aspect-video overflow-hidden lg:aspect-square">
          <img
            src={game.image}
            alt={game.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center gap-3 p-5">
          <div className="inline-flex w-fit items-center gap-1 rounded-md bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
            <Trophy className="h-3.5 w-3.5" />
            Highest Rated
          </div>
          <h3 className="text-xl font-bold text-foreground">{game.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {game.rating.toFixed(1)}
            </span>
            <span>{game.releaseYear}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentActivity({ recentGames }: { recentGames: { title: string; addedAt: string }[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Calendar className="h-5 w-5 text-primary" />
        Recently Added
      </h3>

      <div className="space-y-3">
        {recentGames.map(game => (
          <div key={`${game.title}-${game.addedAt}`} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
            <span className="text-sm text-foreground">{game.title}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(game.addedAt).toLocaleDateString()}
            </span>
          </div>
        ))}

        {recentGames.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        )}
      </div>
    </div>
  )
}

function InsightCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof PieChart
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}
