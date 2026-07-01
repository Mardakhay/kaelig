import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { type GameListParams } from '../model/types'
import { gameQueryKeys } from './queryKeys'
import { gameService } from './gameService'

interface UseGamesQueryOptions {
  enabled?: boolean
}

export function useGamesQuery(
  params: GameListParams = {},
  options: UseGamesQueryOptions = {}
) {
  return useQuery({
    queryKey: gameQueryKeys.list(params),
    queryFn: ({ signal }) => gameService.getGames(params, signal),
    enabled: options.enabled,
  })
}

export function useInfiniteGamesQuery(
  params: GameListParams = {},
  options: UseGamesQueryOptions = {}
) {
  return useInfiniteQuery({
    queryKey: gameQueryKeys.infiniteList(params),
    queryFn: ({ pageParam, signal }) =>
      gameService.getGames({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    enabled: options.enabled,
  })
}

export function usePrefetchNextGamesPage(params: GameListParams = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    (page: number) => {
      void queryClient.prefetchQuery({
        queryKey: gameQueryKeys.list({ ...params, page }),
        queryFn: ({ signal }) => gameService.getGames({ ...params, page }, signal),
      })
    },
    [params, queryClient]
  )
}

export function useGameDetailsQuery(id: number | string) {
  return useQuery({
    queryKey: gameQueryKeys.detail(id),
    queryFn: ({ signal }) => gameService.getGameDetails(id, signal),
    enabled: Boolean(id),
  })
}
