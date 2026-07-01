export interface GameFilterValues {
  genre?: string
  platform?: string
  year?: string
  metacritic?: string
  rating?: string
  ordering?: string
}

interface FilterOption {
  label: string
  value: string
}

interface GameFiltersProps {
  values: GameFilterValues
  onChange: (nextValues: GameFilterValues) => void
  onClear: () => void
  className?: string
}

const genreOptions: FilterOption[] = [
  { label: 'Action', value: 'action' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'RPG', value: 'role-playing-games-rpg' },
  { label: 'Shooter', value: 'shooter' },
  { label: 'Strategy', value: 'strategy' },
  { label: 'Racing', value: 'racing' },
  { label: 'Sports', value: 'sports' },
]

const platformOptions: FilterOption[] = [
  { label: 'PC', value: '1' },
  { label: 'PlayStation', value: '2' },
  { label: 'Xbox', value: '3' },
  { label: 'Nintendo', value: '7' },
  { label: 'macOS', value: '5' },
  { label: 'Linux', value: '6' },
  { label: 'Mobile', value: '4,8' },
]

const currentYear = new Date().getFullYear()
const yearOptions: FilterOption[] = Array.from({ length: 10 }, (_, index) => {
  const year = String(currentYear - index)
  return { label: year, value: year }
})

const metacriticOptions: FilterOption[] = [
  { label: '90+', value: '90,100' },
  { label: '80+', value: '80,100' },
  { label: '70+', value: '70,100' },
  { label: '60+', value: '60,100' },
]

const ratingOptions: FilterOption[] = [
  { label: '4.5+', value: '4.5' },
  { label: '4.0+', value: '4' },
  { label: '3.5+', value: '3.5' },
  { label: '3.0+', value: '3' },
]

const orderingOptions: FilterOption[] = [
  { label: 'Relevance', value: '' },
  { label: 'Highest rated', value: '-rating' },
  { label: 'Most popular', value: '-added' },
  { label: 'Newest', value: '-released' },
  { label: 'Oldest', value: 'released' },
  { label: 'Metacritic', value: '-metacritic' },
]

export function GameFilters({ values, onChange, onClear, className }: GameFiltersProps) {
  const hasActiveFilters = Object.values(values).some(Boolean)

  function updateFilter(key: keyof GameFilterValues, value: string) {
    onChange({
      ...values,
      [key]: value || undefined,
    })
  }

  return (
    <aside className={className} aria-label="Game filters">
      <div className="space-y-5 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <p className="text-xs text-muted-foreground">Refine live RAWG results.</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={!hasActiveFilters}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Reset
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <SelectFilter
            label="Genre"
            value={values.genre ?? ''}
            options={genreOptions}
            onChange={value => updateFilter('genre', value)}
          />
          <SelectFilter
            label="Platform"
            value={values.platform ?? ''}
            options={platformOptions}
            onChange={value => updateFilter('platform', value)}
          />
          <SelectFilter
            label="Release year"
            value={values.year ?? ''}
            options={yearOptions}
            onChange={value => updateFilter('year', value)}
          />
          <SelectFilter
            label="Metacritic"
            value={values.metacritic ?? ''}
            options={metacriticOptions}
            onChange={value => updateFilter('metacritic', value)}
          />
          <SelectFilter
            label="Rating"
            value={values.rating ?? ''}
            options={ratingOptions}
            onChange={value => updateFilter('rating', value)}
          />
          <SelectFilter
            label="Ordering"
            value={values.ordering ?? ''}
            options={orderingOptions}
            onChange={value => updateFilter('ordering', value)}
          />
        </div>
      </div>
    </aside>
  )
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Any</option>
        {options.map(option => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
