import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import type { Page } from '../services/community-service'

type Likeable = { id: string; likesCount: number; liked: boolean }
type FeedData<T> = InfiniteData<Page<T>>

export function useOptimisticLike<T extends Likeable>({
  id,
  scope,
  queryPrefixes,
  save,
}: {
  id: string
  scope: string
  queryPrefixes: string[]
  save: (liked: boolean) => Promise<{ liked: boolean }>
}) {
  const filter = {
    predicate: (query: { queryKey: readonly unknown[] }) =>
      queryPrefixes.includes(String(query.queryKey[0])),
  }
  const client = useQueryClient()
  const pending = useIsMutating({ mutationKey: [scope, id] }) > 0
  const mutation = useMutation({
    mutationKey: [scope, id],
    mutationFn: save,
    onMutate: async (liked) => {
      await client.cancelQueries(filter)
      const previous = client
        .getQueriesData<FeedData<T>>(filter)
        .flatMap(([key, data]) => {
          const post = data?.pages
            .flatMap((page) => page.items)
            .find((item) => item.id === id)
          return post
            ? [{ key, liked: post.liked, likesCount: post.likesCount }]
            : []
        })
      client.setQueriesData<FeedData<T>>(
        filter,
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === id
                  ? {
                      ...post,
                      liked,
                      likesCount: Math.max(
                        0,
                        post.likesCount +
                          (post.liked === liked ? 0 : liked ? 1 : -1),
                      ),
                    }
                  : post,
              ),
            })),
          },
      )
      return previous
    },
    onError: (_error, _liked, previous) => {
      for (const saved of previous ?? []) {
        client.setQueryData<FeedData<T>>(
          saved.key,
          (data) =>
            data && {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((post) =>
                  post.id === id
                    ? {
                        ...post,
                        liked: saved.liked,
                        likesCount: saved.likesCount,
                      }
                    : post,
                ),
              })),
            },
        )
      }
    },
    onSettled: () => {
      // Wait for other optimistic likes before refetching the shared cache.
      if (client.isMutating({ mutationKey: [scope] }) === 1) {
        void client.invalidateQueries(filter)
        void client.invalidateQueries({ queryKey: ['likes'] })
      }
    },
  })
  return { ...mutation, pending }
}
