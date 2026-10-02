import { useEffect, useRef, useState } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  LoaderCircle,
  MessageCircle,
  Send,
  ThumbsUp,
  UsersRound,
} from 'lucide-react'
import {
  createComment,
  getComments,
  getFeed,
  getMyPosts,
  timeAgo,
} from '../services/community-service'
import type { Post, Profile } from '../services/community-service'
import { Avatar } from './avatar'
import { PostComposer } from './post-composer'
import { PostActions } from './post-actions'
import { PostContent } from './post-content'
import { usePostLike } from '../hooks/use-post-like'

export function Feed({
  profile,
  scope = 'community',
}: {
  profile: Profile
  scope?: 'community' | 'profile'
}) {
  const client = useQueryClient()
  const sentinel = useRef<HTMLDivElement>(null)
  const feed = useInfiniteQuery({
    queryKey: ['feed', scope, profile.id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      scope === 'profile' ? getMyPosts(pageParam) : getFeed(pageParam),
    getNextPageParam: (last) =>
      (last.page + 1) * last.size < last.total ? last.page + 1 : undefined,
  })
  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetchNextPageError,
  } = feed
  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasNextPage || isFetchingNextPage || isFetchNextPageError)
      return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void fetchNextPage()
      },
      { rootMargin: '250px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isFetchNextPageError])

  const posts = Array.from(
    new Map(
      feed.data?.pages
        .flatMap((page) => page.items)
        .map((post) => [post.id, post]),
    ).values(),
  )
  return (
    <section id="feed" className="min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">
          {scope === 'profile' ? 'Minhas publicações' : 'Feed da comunidade'}
        </h2>
        <span className="rounded-full border border-[#e0e8f4] bg-white px-3 py-1 text-[11px] font-medium text-[#71819a]">
          Mais recentes
        </span>
      </div>
      <PostComposer
        profile={profile}
        onPublished={() =>
          void client.invalidateQueries({ queryKey: ['feed'] })
        }
      />
      {feed.isPending && (
        <div
          className="oj-card space-y-4 p-6"
          aria-label="Carregando publicações"
        >
          <div className="h-10 w-48 animate-pulse rounded bg-[#edf2f8]" />
          <div className="h-24 animate-pulse rounded bg-[#edf2f8]" />
        </div>
      )}
      {feed.isError && !feed.data && (
        <div className="oj-card p-6">
          <p role="alert" className="text-sm text-[#bd3845]">
            {feed.error.message}
          </p>
          <button
            className="oj-button mt-4"
            onClick={() => void feed.refetch()}
          >
            Tentar novamente
          </button>
        </div>
      )}
      {!feed.isPending && !feed.isError && posts.length === 0 && (
        <div className="oj-card grid justify-items-center p-10 text-center">
          <UsersRound className="mb-4 size-10 text-[#a2bbde]" />
          <h2 className="font-semibold">
            {scope === 'profile'
              ? 'Sua história começa aqui'
              : 'A comunidade começa com uma conversa'}
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#71819a]">
            Compartilhe uma ideia, uma oportunidade ou o próximo passo da sua
            carreira.
          </p>
        </div>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} profile={profile} />
      ))}
      <div
        ref={sentinel}
        className="flex min-h-12 justify-center py-3 text-sm text-[#71819a]"
      >
        {isFetchingNextPage ? (
          <span className="flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando mais publicações
          </span>
        ) : hasNextPage ? (
          <button
            onClick={() => void feed.fetchNextPage()}
            className="cursor-pointer text-[#1769d5]"
          >
            {isFetchNextPageError
              ? 'Tentar carregar novamente'
              : 'Carregar mais publicações'}
          </button>
        ) : posts.length > 0 ? (
          'Você chegou ao fim das publicações.'
        ) : null}
      </div>
    </section>
  )
}

function PostCard({ post, profile }: { post: Post; profile: Profile }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const [likePulse, setLikePulse] = useState(0)
  const like = usePostLike(post.id)
  return (
    <article className="oj-card overflow-hidden">
      <div className="p-5">
        <header className="flex items-center gap-3">
          <Avatar name={post.author.name} url={post.author.avatarUrl} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">{post.author.name}</h2>
            <p className="mt-0.5 text-xs text-[#8392a8]">
              @{post.author.username} <span className="px-1">·</span>{' '}
              <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
            </p>
          </div>
          {post.author.id === profile.id && (
            <PostActions post={post} profile={profile} />
          )}
        </header>
        <PostContent key={post.content} content={post.content} />
      </div>
      {post.fileUrl &&
        /^https?:\/\//.test(post.fileUrl) &&
        (failedImage === post.fileUrl ? (
          <a
            href={post.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="mx-5 mb-4 block text-sm text-[#1769d5]"
          >
            Ver anexo da publicação ↗
          </a>
        ) : (
          <img
            src={post.fileUrl}
            alt="Imagem da publicação"
            loading="lazy"
            className="max-h-[480px] w-full object-contain bg-[#f5f7fb]"
            onError={() => setFailedImage(post.fileUrl)}
          />
        ))}
      <div className="px-5">
        <div className="flex justify-between py-3 text-xs text-[#8392a8]">
          <span>
            {post.likesCount} {post.likesCount === 1 ? 'curtida' : 'curtidas'}
          </span>
          <button
            className="cursor-pointer hover:text-[#1769d5]"
            onClick={() => setCommentsOpen(!commentsOpen)}
          >
            {post.commentsCount}{' '}
            {post.commentsCount === 1 ? 'comentário' : 'comentários'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-[#edf0f6] py-2">
          <button
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[.97] disabled:cursor-default ${post.liked ? 'bg-[#edf5ff] text-[#1769d5] hover:bg-[#e3efff]' : 'text-[#61738c] hover:bg-[#f5f7fb]'}`}
            onClick={() => {
              if (like.pending) return
              setLikePulse((value) => value + 1)
              like.mutate(!post.liked)
            }}
            disabled={like.pending}
            aria-busy={like.pending}
            aria-pressed={post.liked}
          >
            <ThumbsUp
              key={likePulse}
              className={`size-[18px] ${likePulse ? 'oj-like-pop' : ''}`}
              fill={post.liked ? 'currentColor' : 'none'}
            />
            {post.liked ? 'Curtiu' : 'Curtir'}
          </button>
          <button
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-[#61738c] hover:bg-[#f5f7fb]"
            onClick={() => setCommentsOpen(!commentsOpen)}
            aria-expanded={commentsOpen}
          >
            <MessageCircle className="size-[18px]" />
            Comentar
          </button>
        </div>
        {like.error && (
          <p className="pb-3 text-xs text-[#bd3845]" role="alert">
            {like.error.message}
          </p>
        )}
      </div>
      {commentsOpen && <Comments postId={post.id} profile={profile} />}
    </article>
  )
}

function Comments({ postId, profile }: { postId: string; profile: Profile }) {
  const [content, setContent] = useState('')
  const client = useQueryClient()
  const comments = useInfiniteQuery({
    queryKey: ['comments', postId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getComments(postId, pageParam),
    getNextPageParam: (last) =>
      (last.page + 1) * last.size < last.total ? last.page + 1 : undefined,
  })
  const add = useMutation({
    mutationFn: () => createComment(postId, content.trim()),
    onSuccess: () => {
      setContent('')
      void client.invalidateQueries({ queryKey: ['comments', postId] })
      void client.invalidateQueries({ queryKey: ['feed'] })
    },
  })
  return (
    <section
      className="border-t border-[#edf0f6] bg-[#fafbfd] p-5"
      aria-label="Comentários"
    >
      <form
        method="post"
        className="flex items-start gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (content.trim()) add.mutate()
        }}
      >
        <Avatar
          name={profile.name}
          url={profile.avatarUrl}
          className="size-8 text-xs"
        />
        <label className="sr-only" htmlFor={`comment-${postId}`}>
          Seu comentário
        </label>
        <input
          id={`comment-${postId}`}
          className="oj-input !px-3 !py-2"
          placeholder="Escreva um comentário..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={1000}
          required
        />
        <button
          className="oj-button !px-2.5 !py-2.5"
          aria-label="Publicar comentário"
          disabled={add.isPending || !content.trim()}
        >
          <Send className="size-4" />
        </button>
      </form>
      {add.error && (
        <p role="alert" className="mt-2 text-xs text-[#bd3845]">
          {add.error.message}
        </p>
      )}
      {comments.isPending && (
        <p className="mt-4 text-xs text-[#71819a]">Carregando comentários...</p>
      )}
      {comments.isError && (
        <button
          className="mt-3 text-xs text-[#bd3845]"
          onClick={() => void comments.refetch()}
        >
          Não foi possível carregar. Tentar novamente
        </button>
      )}
      {comments.data?.pages
        .flatMap((page) => page.items)
        .map((comment) => (
          <div key={comment.id} className="mt-4 flex items-start gap-2">
            <Avatar
              name={comment.author.name}
              url={comment.author.avatarUrl}
              className="size-8 text-xs"
            />
            <div className="min-w-0 flex-1 rounded-lg bg-[#edf2f8] p-3">
              <div className="flex flex-wrap justify-between gap-1">
                <strong className="text-xs">{comment.author.name}</strong>
                <time
                  className="text-[10px] text-[#8392a8]"
                  dateTime={comment.createdAt}
                >
                  {timeAgo(comment.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-[#53657d]">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      {comments.hasNextPage && (
        <button
          className="mt-4 text-xs font-semibold text-[#1769d5]"
          onClick={() => void comments.fetchNextPage()}
          disabled={comments.isFetchingNextPage}
        >
          {comments.isFetchingNextPage
            ? 'Carregando...'
            : 'Ver mais comentários'}
        </button>
      )}
    </section>
  )
}
