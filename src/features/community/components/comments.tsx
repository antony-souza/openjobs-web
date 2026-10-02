import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Reply, ThumbsUp } from 'lucide-react'
import {
  getComments,
  getReplies,
  setCommentLike,
} from '../services/community-service'
import type { Comment, Profile } from '../services/community-service'
import { useOptimisticLike } from '../hooks/use-optimistic-like'
import { Avatar } from './avatar'
import { CommentForm } from './comment-form'
import { CommentActions } from './comment-actions'
import { LikesButton } from './likes-modal'
import { ProfileLink } from './profile-link'
import { RelativeTime } from './relative-time'

const nextPage = (last: { page: number; size: number; total: number }) =>
  (last.page + 1) * last.size < last.total ? last.page + 1 : undefined

export function Comments({
  postId,
  profile,
}: {
  postId: string
  profile?: Profile
}) {
  const comments = useInfiniteQuery({
    queryKey: ['comments', postId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getComments(postId, pageParam),
    getNextPageParam: nextPage,
  })
  const items = Array.from(
    new Map(
      comments.data?.pages
        .flatMap((page) => page.items)
        .map((comment) => [comment.id, comment]),
    ).values(),
  )
  return (
    <section
      className="border-t border-[#edf0f6] bg-[#fafbfd] p-5"
      aria-label="Comentários"
    >
      {profile && <CommentForm postId={postId} profile={profile} />}
      {comments.isPending && (
        <p role="status" className="mt-4 text-xs text-[#71819a]">
          Carregando comentários...
        </p>
      )}
      {comments.isError && (
        <button
          type="button"
          className="mt-3 cursor-pointer text-xs text-[#bd3845]"
          onClick={() =>
            void (comments.isFetchNextPageError
              ? comments.fetchNextPage()
              : comments.refetch())
          }
        >
          Não foi possível carregar. Tentar novamente
        </button>
      )}
      {items.map((comment) => (
        <CommentThread
          key={comment.id}
          comment={comment}
          postId={postId}
          profile={profile}
          depth={0}
        />
      ))}
      {comments.hasNextPage && !comments.isFetchNextPageError && (
        <button
          type="button"
          className="mt-4 cursor-pointer text-xs font-semibold text-[#1769d5]"
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

function CommentThread({
  comment,
  postId,
  profile,
  depth,
}: {
  comment: Comment
  postId: string
  profile?: Profile
  depth: number
}) {
  const navigate = useNavigate()
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [pulse, setPulse] = useState(0)
  const like = useOptimisticLike<Comment>({
    id: comment.id,
    scope: 'comment-like',
    queryPrefixes: ['comments', 'replies'],
    save: (liked) => setCommentLike(postId, comment.id, liked),
  })
  const replies = useInfiniteQuery({
    queryKey: ['replies', postId, comment.id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getReplies(postId, comment.id, pageParam),
    getNextPageParam: nextPage,
    enabled: showReplies,
  })
  const items = Array.from(
    new Map(
      replies.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]),
    ).values(),
  )
  return (
    <div className="mt-3">
      <div className="flex items-start gap-2.5">
        <ProfileLink person={comment.author}>
          <Avatar
            name={comment.author.name}
            url={comment.author.avatarUrl}
            className={depth === 0 ? 'size-9 text-xs' : 'size-8 text-xs'}
          />
        </ProfileLink>
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-[#e4ebf4] bg-[#f1f5fa] px-3.5 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <strong className="block break-words text-sm leading-5">
                  <ProfileLink person={comment.author}>
                    {comment.author.name}
                  </ProfileLink>
                </strong>
                <p className="break-words text-[11px] leading-4 text-[#8392a8]">
                  @{comment.author.username} ·{' '}
                  <RelativeTime date={comment.createdAt} />
                </p>
              </div>
              {profile && comment.author.id === profile.id && (
                <CommentActions
                  postId={postId}
                  commentId={comment.id}
                  edit={() => {
                    setEditing(!editing)
                    setReplying(false)
                  }}
                />
              )}
            </div>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-5 text-[#53657d]">
              {comment.content}
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8392a8]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 font-semibold transition-colors disabled:cursor-default ${comment.liked ? 'bg-[#edf5ff] text-[#1769d5]' : 'text-[#61738c] hover:bg-[#edf2f8]'}`}
                aria-pressed={comment.liked}
                aria-busy={like.pending}
                disabled={like.pending}
                onClick={() => {
                  if (!profile) {
                    void navigate({ to: '/' })
                    return
                  }
                  if (!like.pending) {
                    setPulse((value) => value + 1)
                    like.mutate(!comment.liked)
                  }
                }}
              >
                <ThumbsUp
                  key={pulse}
                  className={`size-3.5 ${pulse ? 'oj-like-pop' : ''}`}
                  fill={comment.liked ? 'currentColor' : 'none'}
                />
                {comment.liked ? 'Curtiu' : 'Curtir'}
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-[#61738c] transition-colors hover:bg-[#edf2f8] hover:text-[#1769d5]"
                aria-expanded={replying}
                onClick={() => {
                  if (!profile) {
                    void navigate({ to: '/' })
                    return
                  }
                  setReplying(!replying)
                  setEditing(false)
                }}
              >
                <Reply className="size-3.5" />
                Responder
              </button>
            </div>
            {comment.likesCount > 0 && (
              <LikesButton
                postId={postId}
                commentId={comment.id}
                count={comment.likesCount}
              />
            )}
          </div>
          {like.error && (
            <p role="alert" className="mt-2 text-xs text-[#bd3845]">
              {like.error.message}
            </p>
          )}
        </div>
      </div>
      {editing && profile && (
        <div className="mt-3">
          <CommentForm
            postId={postId}
            profile={profile}
            editing={comment}
            onSaved={() => setEditing(false)}
            cancel={() => setEditing(false)}
          />
        </div>
      )}
      {replying && profile && (
        <div className="mt-3">
          <CommentForm
            postId={postId}
            profile={profile}
            parentCommentId={comment.id}
            placeholder={`Responder a ${comment.author.name}...`}
            onSaved={() => {
              setReplying(false)
              setShowReplies(true)
            }}
            cancel={() => setReplying(false)}
          />
        </div>
      )}
      {(comment.repliesCount > 0 || items.length > 0) && (
        <button
          type="button"
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#1769d5]"
          aria-expanded={showReplies}
          onClick={() => setShowReplies(!showReplies)}
        >
          {showReplies ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
          {showReplies
            ? 'Ocultar respostas'
            : `Ver ${comment.repliesCount} ${comment.repliesCount === 1 ? 'resposta' : 'respostas'}`}
        </button>
      )}
      {showReplies &&
        (comment.repliesCount > 0 || items.length > 0 || replies.isPending) && (
          <div
            className={depth < 2 ? 'ml-4 border-l-2 border-[#dbe5f2] pl-3' : ''}
          >
            {replies.isPending && (
              <p role="status" className="mt-3 text-xs text-[#71819a]">
                Carregando respostas...
              </p>
            )}
            {replies.isError && (
              <button
                type="button"
                className="mt-3 cursor-pointer text-xs text-[#bd3845]"
                onClick={() =>
                  void (replies.isFetchNextPageError
                    ? replies.fetchNextPage()
                    : replies.refetch())
                }
              >
                Não foi possível carregar as respostas. Tentar novamente
              </button>
            )}
            {items.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                postId={postId}
                profile={profile}
                depth={depth + 1}
              />
            ))}
            {replies.hasNextPage && !replies.isFetchNextPageError && (
              <button
                type="button"
                className="mt-3 cursor-pointer text-xs font-semibold text-[#1769d5]"
                disabled={replies.isFetchingNextPage}
                onClick={() => void replies.fetchNextPage()}
              >
                {replies.isFetchingNextPage
                  ? 'Carregando...'
                  : 'Ver mais respostas'}
              </button>
            )}
          </div>
        )}
    </div>
  )
}
