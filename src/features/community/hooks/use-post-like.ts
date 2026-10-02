import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { setLike } from '../services/community-service'
import type { Page, Post } from '../services/community-service'

type FeedData = InfiniteData<Page<Post>>

export function usePostLike(postId: string) {
  const client = useQueryClient()
  const pending = useIsMutating({ mutationKey: ['post-like', postId] }) > 0
  const mutation = useMutation({
    mutationKey: ['post-like', postId],
    mutationFn: (liked: boolean) => setLike(postId, liked),
    onMutate: async (liked) => {
      await client.cancelQueries({ queryKey: ['feed'] })
      const previous = client
        .getQueriesData<FeedData>({ queryKey: ['feed'] })
        .flatMap(([key, data]) => {
          const post = data?.pages
            .flatMap((page) => page.items)
            .find((item) => item.id === postId)
          return post
            ? [{ key, liked: post.liked, likesCount: post.likesCount }]
            : []
        })
      client.setQueriesData<FeedData>(
        { queryKey: ['feed'] },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === postId
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
        client.setQueryData<FeedData>(
          saved.key,
          (data) =>
            data && {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((post) =>
                  post.id === postId
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
      // Wait for other optimistic likes before refetching the shared feed.
      if (client.isMutating({ mutationKey: ['post-like'] }) === 1) {
        void client.invalidateQueries({ queryKey: ['feed'] })
      }
    },
  })
  return { ...mutation, pending }
}
