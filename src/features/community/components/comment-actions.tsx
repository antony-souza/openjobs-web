import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Pencil, Trash2 } from 'lucide-react'
import { deleteComment } from '../services/community-service'
import { Modal } from './modal'

export function CommentActions({
  postId,
  commentId,
  edit,
}: {
  postId: string
  commentId: string
  edit: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const client = useQueryClient()
  const remove = useMutation({
    mutationFn: () => deleteComment(postId, commentId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['comments', postId] })
      void client.invalidateQueries({ queryKey: ['replies', postId] })
      void client.invalidateQueries({ queryKey: ['feed'] })
      setConfirm(false)
    },
  })
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label="Editar comentário"
        title="Editar comentário"
        onClick={edit}
        className="cursor-pointer rounded-lg p-1.5 text-[#8392a8] transition-colors hover:bg-white hover:text-[#1769d5]"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Excluir comentário"
        title="Excluir comentário"
        onClick={() => {
          remove.reset()
          setConfirm(true)
        }}
        className="cursor-pointer rounded-lg p-1.5 text-[#8392a8] transition-colors hover:bg-[#fff1f0] hover:text-[#bd3845]"
      >
        <Trash2 className="size-4" />
      </button>
      {confirm && (
        <Modal
          title="Excluir comentário?"
          close={() => {
            if (!remove.isPending) setConfirm(false)
          }}
        >
          <p className="text-sm leading-relaxed text-[#61738c]">
            Este comentário e as respostas dele deixarão de aparecer na
            conversa. Esta ação não pode ser desfeita pela tela.
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
              onClick={() => setConfirm(false)}
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
              {remove.isPending ? 'Excluindo...' : 'Excluir comentário'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
