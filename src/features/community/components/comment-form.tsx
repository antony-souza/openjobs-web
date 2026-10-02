import { useId, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Send } from 'lucide-react'
import { createComment, updateComment } from '../services/community-service'
import type { Comment, Profile } from '../services/community-service'
import { Avatar } from './avatar'

export function CommentForm({
  postId,
  profile,
  parentCommentId,
  editing,
  placeholder = 'Escreva um comentário...',
  onSaved,
  cancel,
}: {
  postId: string
  profile: Profile
  parentCommentId?: string
  editing?: Comment
  placeholder?: string
  onSaved?: () => void
  cancel?: () => void
}) {
  const [content, setContent] = useState(editing?.content ?? '')
  const client = useQueryClient()
  const id = useId()
  const textarea = useRef<HTMLTextAreaElement>(null)
  const save = useMutation({
    mutationFn: async () => {
      if (editing) await updateComment(postId, editing.id, content.trim())
      else await createComment(postId, content.trim(), parentCommentId)
    },
    onSuccess: () => {
      setContent('')
      textarea.current?.style.removeProperty('height')
      void client.invalidateQueries({ queryKey: ['comments', postId] })
      void client.invalidateQueries({ queryKey: ['replies', postId] })
      if (!editing) void client.invalidateQueries({ queryKey: ['feed'] })
      onSaved?.()
    },
  })
  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        if (content.trim() && !save.isPending) save.mutate()
      }}
    >
      <div className="flex items-start gap-2">
        <Avatar
          name={profile.name}
          url={profile.avatarUrl}
          className="size-8 text-xs"
        />
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor={id}>
            {editing ? 'Editar comentário' : placeholder}
          </label>
          <textarea
            ref={textarea}
            id={id}
            className="oj-input min-h-10 resize-y !px-3 !py-2 text-xs"
            rows={editing ? 3 : 1}
            placeholder={placeholder}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={1000}
            required
            disabled={save.isPending}
            autoFocus={!!parentCommentId || !!editing}
          />
          {cancel && (
            <button
              type="button"
              onClick={cancel}
              disabled={save.isPending}
              className="mt-1 cursor-pointer text-xs text-[#71819a] hover:underline"
            >
              Cancelar
            </button>
          )}
        </div>
        <button
          type="submit"
          className="oj-button !px-2.5 !py-2.5"
          aria-label={
            editing
              ? 'Salvar comentário'
              : parentCommentId
                ? 'Publicar resposta'
                : 'Publicar comentário'
          }
          disabled={save.isPending || !content.trim()}
        >
          {save.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </div>
      {save.error && (
        <p role="alert" className="mt-2 text-xs text-[#bd3845]">
          {save.error.message}
        </p>
      )}
    </form>
  )
}
