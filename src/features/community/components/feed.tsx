import { useEffect, useRef, useState } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Send,
  ThumbsUp,
  UsersRound,
  X,
} from 'lucide-react'
import {
  createComment,
  createPost,
  getComments,
  getFeed,
  setLike,
  timeAgo,
} from '../services/community-service'
import type { Post, Profile } from '../services/community-service'
import { Avatar } from './avatar'

export function Feed({ profile }: { profile: Profile }) {
  const client = useQueryClient()
  const sentinel = useRef<HTMLDivElement>(null)
  const feed = useInfiniteQuery({
    queryKey: ['feed', profile.id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getFeed(pageParam),
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
        <h1 className="text-xl font-bold tracking-tight">Feed da comunidade</h1>
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
            A comunidade começa com uma conversa
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

const POST_CONTENT_MAX_LENGTH = 3000

function PostComposer({
  profile,
  onPublished,
}: {
  profile: Profile
  onPublished: () => void
}) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const publish = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.set('content', content.trim())
      if (file) form.set('file', file)
      return createPost(form)
    },
    onSuccess: () => {
      setContent('')
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      if (textareaRef.current) {
        textareaRef.current.style.removeProperty('height')
        textareaRef.current.style.removeProperty('width')
      }
      onPublished()
    },
  })
  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        if (content.trim()) publish.mutate()
      }}
      className="oj-card p-5"
    >
      <div className="flex items-start gap-3">
        <Avatar name={profile.name} url={profile.avatarUrl} />
        <label className="sr-only" htmlFor="post-content">
          Escreva uma publicação
        </label>
        <textarea
          ref={textareaRef}
          id="post-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={`O que você quer compartilhar, ${profile.name.split(' ')[0]}?`}
          maxLength={POST_CONTENT_MAX_LENGTH}
          aria-describedby="post-content-limit"
          required
          disabled={publish.isPending}
          rows={5}
          className="min-h-[140px] w-full resize-y rounded-lg bg-[#f6f8fc] px-4 py-3 text-sm outline-none placeholder:text-[#8392a8] focus:ring-2 focus:ring-[#2378e8]/30"
        />
      </div>
      <p
        id="post-content-limit"
        className={`mt-2 text-right text-xs ${content.length >= POST_CONTENT_MAX_LENGTH ? 'font-medium text-[#bd3845]' : 'text-[#8392a8]'}`}
      >
        {content.length.toLocaleString('pt-BR')} /{' '}
        {POST_CONTENT_MAX_LENGTH.toLocaleString('pt-BR')} caracteres
      </p>
      {preview && (
        <div className="relative mt-4">
          <img
            src={preview}
            alt="Prévia da imagem da publicação"
            className="max-h-56 w-full rounded-lg object-contain bg-[#f5f7fb]"
          />
          <button
            type="button"
            onClick={() => {
              setFile(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow"
            aria-label="Remover imagem"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      {(publish.error || fileError) && (
        <p role="alert" className="mt-3 text-sm text-[#bd3845]">
          {fileError ?? publish.error?.message}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-[#edf0f6] pt-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-[#61738c] hover:bg-[#f5f7fb]">
          <ImagePlus className="size-[18px] text-[#1769d5]" />
          Adicionar foto
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={(event) => {
              const selected = event.target.files?.[0]
              setFileError(null)
              if (selected && selected.size > 5 * 1024 * 1024) {
                setFileError('Use uma foto de até 5 MB.')
                event.target.value = ''
                return
              }
              setFile(selected ?? null)
            }}
          />
        </label>
        <button
          className="oj-button !px-4 !py-2"
          type="submit"
          disabled={publish.isPending || !content.trim()}
        >
          {publish.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Publicar
        </button>
      </div>
    </form>
  )
}

function PostCard({ post, profile }: { post: Post; profile: Profile }) {
  const client = useQueryClient()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const like = useMutation({
    mutationFn: () => setLike(post.id, !post.liked),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['feed'] }),
  })
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
        </header>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-[1.7] text-[#354961]">
          {post.content}
        </p>
      </div>
      {post.fileUrl &&
        /^https?:\/\//.test(post.fileUrl) &&
        (imageFailed ? (
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
            onError={() => setImageFailed(true)}
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
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium hover:bg-[#f5f7fb] ${post.liked ? 'bg-[#edf5ff] text-[#1769d5]' : 'text-[#61738c]'}`}
            onClick={() => like.mutate()}
            disabled={like.isPending}
            aria-pressed={post.liked}
          >
            <ThumbsUp
              className="size-[18px]"
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
