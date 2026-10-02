import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { LoaderCircle, ThumbsUp } from 'lucide-react'
import { getCommentLikes, getPostLikes } from '../services/community-service'
import { Avatar } from './avatar'
import { Modal } from './modal'
import { ProfileLink } from './profile-link'

export function LikesButton({
  postId,
  commentId,
  count,
}: {
  postId: string
  commentId?: string
  count: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-left hover:text-[#1769d5] hover:underline"
        aria-label={`Ver quem curtiu ${commentId ? 'o comentário' : 'a publicação'}: ${count} curtidas`}
      >
        {count} {count === 1 ? 'curtida' : 'curtidas'}
      </button>
      {open && (
        <LikesModal
          postId={postId}
          commentId={commentId}
          close={() => setOpen(false)}
        />
      )}
    </>
  )
}

function LikesModal({
  postId,
  commentId,
  close,
}: {
  postId: string
  commentId?: string
  close: () => void
}) {
  const likes = useInfiniteQuery({
    queryKey: ['likes', postId, commentId ?? 'post'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      commentId
        ? getCommentLikes(postId, commentId, pageParam)
        : getPostLikes(postId, pageParam),
    getNextPageParam: (last) =>
      (last.page + 1) * last.size < last.total ? last.page + 1 : undefined,
  })
  const people = Array.from(
    new Map(
      likes.data?.pages
        .flatMap((page) => page.items)
        .map((person) => [person.id, person]),
    ).values(),
  )
  const total = likes.data?.pages[0]?.total
  return (
    <Modal
      title={commentId ? 'Curtidas do comentário' : 'Curtidas da publicação'}
      close={close}
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#edf5ff] p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1769d5] text-white">
          <ThumbsUp className="size-5" fill="currentColor" />
        </span>
        <div>
          <p className="text-sm font-bold">Quem gostou dessa conversa</p>
          <p className="mt-1 text-xs text-[#61738c]">
            {total === undefined
              ? 'Carregando curtidas...'
              : `${total} ${total === 1 ? 'pessoa curtiu' : 'pessoas curtiram'}`}
          </p>
        </div>
      </div>
      {likes.isPending && (
        <p
          role="status"
          className="flex items-center justify-center gap-2 py-8 text-sm text-[#71819a]"
        >
          <LoaderCircle className="size-4 animate-spin" />
          Carregando pessoas...
        </p>
      )}
      {likes.isError && (
        <div
          role="alert"
          className="rounded-lg bg-[#fff1f0] p-4 text-sm text-[#bd3845]"
        >
          <p>{likes.error.message}</p>
          <button
            type="button"
            className="mt-2 cursor-pointer font-semibold underline"
            onClick={() =>
              void (likes.isFetchNextPageError
                ? likes.fetchNextPage()
                : likes.refetch())
            }
          >
            Tentar novamente
          </button>
        </div>
      )}
      {!likes.isPending && !likes.isError && people.length === 0 && (
        <p className="py-8 text-center text-sm text-[#71819a]">
          Ainda não há curtidas por aqui.
        </p>
      )}
      <ul className="divide-y divide-[#edf0f6]">
        {people.map((person) => (
          <li key={person.id} className="flex items-center gap-3 py-4">
            <ProfileLink person={person}>
              <Avatar
                name={person.name}
                url={person.avatarUrl}
                className="size-12"
              />
            </ProfileLink>
            <div className="min-w-0">
              <p className="break-words text-sm font-bold">
                <ProfileLink person={person}>{person.name}</ProfileLink>
              </p>
              <p className="mt-1 break-words text-xs text-[#8392a8]">
                @{person.username}
              </p>
            </div>
            <ThumbsUp className="ml-auto size-4 shrink-0 text-[#1769d5]" />
          </li>
        ))}
      </ul>
      {likes.hasNextPage && !likes.isFetchNextPageError && (
        <button
          type="button"
          className="oj-button mt-4 w-full"
          disabled={likes.isFetchingNextPage}
          onClick={() => void likes.fetchNextPage()}
        >
          {likes.isFetchingNextPage ? 'Carregando...' : 'Ver mais pessoas'}
        </button>
      )}
    </Modal>
  )
}
