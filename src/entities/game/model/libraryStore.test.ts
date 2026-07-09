import { beforeEach, describe, expect, test, vi } from 'vitest'

const mockFrom = vi.fn()
const mockChannelOn = vi.fn()
const mockChannelSubscribe = vi.fn(() => 'fake-channel')
const mockRemoveChannel = vi.fn()
const mockPushToast = vi.fn()

vi.mock('@shared/api/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    channel: () => ({
      on: (...args: unknown[]) => {
        mockChannelOn(...args)
        return { subscribe: mockChannelSubscribe }
      },
    }),
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  },
}))

vi.mock('@shared/ui/toast', () => ({
  pushToast: (...args: unknown[]) => mockPushToast(...args),
}))

// Imported after the mocks above so the store picks up the mocked client.
const { useLibraryStore } = await import('./libraryStore')

type QueryResult = { data?: unknown; error: { message: string } | null }

/** A chainable query-builder stub that resolves immediately with `result`. */
function createQueryBuilder(result: QueryResult) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    then: (onFulfilled: (value: QueryResult) => unknown) => Promise.resolve(result).then(onFulfilled),
  }
  return builder
}

/** A chainable query-builder stub whose resolution is triggered manually. */
function createDeferredQueryBuilder() {
  let resolveFn!: (result: QueryResult) => void
  const promise = new Promise<QueryResult>(resolve => {
    resolveFn = resolve
  })
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (onFulfilled: (value: QueryResult) => unknown) => promise.then(onFulfilled),
  }
  return { builder, resolve: resolveFn }
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function libraryRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    game_id: 1,
    status: 'favorites',
    title: 'Sample Game',
    image: 'image.jpg',
    rating: 4.5,
    release_year: 2020,
    platforms: ['PC'],
    genres: ['Action'],
    added_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function sampleGame(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    title: 'Sample Game',
    image: 'image.jpg',
    rating: 4.5,
    releaseYear: 2020,
    platforms: ['PC'],
    genres: ['Action'],
    addedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as never
}

function resetStoreData(userId: string | null) {
  useLibraryStore.setState({
    userId,
    isHydrated: true,
    isLoading: false,
    pendingIds: {},
    favorites: [],
    wishlist: [],
    playing: [],
    completed: [],
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetStoreData('user-1')
})

describe('addGame', () => {
  test('adds the game optimistically, then clears the pending flag once the write succeeds', async () => {
    mockFrom.mockReturnValue(createQueryBuilder({ data: null, error: null }))

    useLibraryStore.getState().addGame('favorites', sampleGame())

    expect(useLibraryStore.getState().favorites).toHaveLength(1)
    expect(useLibraryStore.getState().pendingIds[1]).toBe(true)

    await flushPromises()

    expect(useLibraryStore.getState().pendingIds[1]).toBeUndefined()
    expect(useLibraryStore.getState().favorites).toHaveLength(1)
    expect(mockPushToast).not.toHaveBeenCalled()
  })

  test('rolls back the optimistic update and notifies the user if the write fails', async () => {
    mockFrom.mockReturnValue(createQueryBuilder({ data: null, error: { message: 'network error' } }))

    useLibraryStore.getState().addGame('favorites', sampleGame())
    expect(useLibraryStore.getState().favorites).toHaveLength(1)

    await flushPromises()

    expect(useLibraryStore.getState().favorites).toHaveLength(0)
    expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }))
  })
})

describe('removeGame', () => {
  test('rolls back and restores the game if the delete fails', async () => {
    useLibraryStore.setState({ favorites: [sampleGame()] })
    mockFrom.mockReturnValue(createQueryBuilder({ data: null, error: { message: 'network error' } }))

    useLibraryStore.getState().removeGame('favorites', 1)
    expect(useLibraryStore.getState().favorites).toHaveLength(0)

    await flushPromises()

    expect(useLibraryStore.getState().favorites).toHaveLength(1)
    expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }))
  })
})

describe('moveGame', () => {
  test('moves the game with a single remote call and rolls back both lists on failure', async () => {
    useLibraryStore.setState({ wishlist: [sampleGame()] })
    const builder = createQueryBuilder({ data: null, error: { message: 'network error' } })
    mockFrom.mockReturnValue(builder)

    useLibraryStore.getState().moveGame('wishlist', 'favorites', 1)

    expect(useLibraryStore.getState().wishlist).toHaveLength(0)
    expect(useLibraryStore.getState().favorites).toHaveLength(1)
    // Exactly one remote call (an UPDATE) — never a separate delete + insert.
    expect(builder.update).toHaveBeenCalledTimes(1)
    expect(builder.delete).not.toHaveBeenCalled()

    await flushPromises()

    expect(useLibraryStore.getState().wishlist).toHaveLength(1)
    expect(useLibraryStore.getState().favorites).toHaveLength(0)
    expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }))
  })
})

describe('getGameStatus', () => {
  test('reports the list a game currently belongs to', () => {
    useLibraryStore.setState({ playing: [sampleGame({ id: 9 })] })
    expect(useLibraryStore.getState().getGameStatus(9)).toBe('playing')
    expect(useLibraryStore.getState().getGameStatus(999)).toBeNull()
  })
})

describe('hydrate', () => {
  test('drops a stale response that resolves after a newer hydrate() call', async () => {
    resetStoreData(null)

    const first = createDeferredQueryBuilder()
    const second = createDeferredQueryBuilder()
    mockFrom.mockReturnValueOnce(first.builder).mockReturnValueOnce(second.builder)

    const { hydrate } = useLibraryStore.getState()
    const p1 = hydrate('user-a')
    const p2 = hydrate('user-b')

    // Newer call resolves first...
    second.resolve({ data: [libraryRow({ game_id: 42 })], error: null })
    await p2

    // ...then the older, now-stale call resolves late.
    first.resolve({ data: [libraryRow({ game_id: 7 })], error: null })
    await p1

    const state = useLibraryStore.getState()
    expect(state.userId).toBe('user-b')
    expect(state.favorites.some(g => g.id === 42)).toBe(true)
    expect(state.favorites.some(g => g.id === 7)).toBe(false)
  })

  test('reset() invalidates an in-flight hydrate so its late response is dropped', async () => {
    resetStoreData(null)

    const deferred = createDeferredQueryBuilder()
    mockFrom.mockReturnValueOnce(deferred.builder)

    const { hydrate, reset } = useLibraryStore.getState()
    const pending = hydrate('user-a')

    reset()
    deferred.resolve({ data: [libraryRow({ game_id: 1 })], error: null })
    await pending

    const state = useLibraryStore.getState()
    expect(state.userId).toBeNull()
    expect(state.favorites).toHaveLength(0)
  })
})
