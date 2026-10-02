import { setLike } from '../services/community-service'
import type { Post } from '../services/community-service'
import { useOptimisticLike } from './use-optimistic-like'

export function usePostLike(postId: string) {
  return useOptimisticLike<Post>({
    id: postId,
    scope: 'post-like',
    queryPrefixes: ['feed'],
    save: (liked) => setLike(postId, liked),
  })
}
