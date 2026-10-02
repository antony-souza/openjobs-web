import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { deletePost } from '../services/community-service'
import type { Post, Profile } from '../services/community-service'
import { Modal } from './modal'
import { PostComposer } from './post-composer'

export function PostActions({
  post,
  profile,
}: {
  post: Post
  profile: Profile
}) {
  const [action, setAction] = useState<'edit' | 'delete' | null>(null)
  const menu = useRef<HTMLDetailsElement>(null)
  const client = useQueryClient()
  const remove = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: async () => {
      client.removeQueries({ queryKey: ['comments', post.id] })
      await client.invalidateQueries({ queryKey: ['feed'] })
      setAction(null)
    },
  })
  const select = (value: 'edit' | 'delete') => {
    if (menu.current) menu.current.open = false
    remove.reset()
    setAction(value)
  }

  return (
    <div className="relative ml-auto shrink-0">
      <details ref={menu} className="group">
        <summary
          aria-label="Opções da publicação"
          className="flex cursor-pointer list-none items-center rounded-lg p-2 text-[#71819a] hover:bg-[#edf5ff] [&::-webkit-details-marker]:hidden"
        >
          <MoreHorizontal className="size-5" />
        </summary>
        <div className="absolute top-full right-0 z-20 w-48 rounded-xl border border-[#e0e8f4] bg-white p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => select('edit')}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#f5f7fb]"
          >
            <Pencil className="size-4" /> Editar publicação
          </button>
          <button
            type="button"
            onClick={() => select('delete')}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#bd3845] hover:bg-[#fff1f0]"
          >
            <Trash2 className="size-4" /> Excluir publicação
          </button>
        </div>
      </details>
      {action === 'edit' && (
        <Modal title="Editar publicação" close={() => setAction(null)}>
          <PostComposer
            post={post}
            profile={profile}
            onPublished={() => {
              void client.invalidateQueries({ queryKey: ['feed'] })
              setAction(null)
            }}
          />
        </Modal>
      )}
      {action === 'delete' && (
        <Modal
          title="Excluir publicação?"
          close={() => {
            if (!remove.isPending) setAction(null)
          }}
        >
          <p className="text-sm leading-relaxed text-[#61738c]">
            Sua publicação deixará de aparecer no perfil e no feed da
            comunidade. Esta ação não pode ser desfeita pela tela.
          </p>
          {remove.error && (
            <p role="alert" className="mt-4 text-sm text-[#bd3845]">
              {remove.error.message}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-[#dbe4f1] px-4 py-2 text-sm font-semibold disabled:opacity-50"
              disabled={remove.isPending}
              onClick={() => setAction(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="oj-button !bg-[#bd3845] hover:!bg-[#a42c39]"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              {remove.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {remove.isPending ? 'Excluindo...' : 'Excluir publicação'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
