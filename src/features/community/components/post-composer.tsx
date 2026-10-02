import { useEffect, useId, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ImagePlus, LoaderCircle, Send, X } from 'lucide-react'
import { createPost, updatePost } from '../services/community-service'
import type { Post, Profile } from '../services/community-service'
import { Avatar } from './avatar'

const POST_CONTENT_MAX_LENGTH = 3000

export function PostComposer({
  profile,
  onPublished,
  post,
}: {
  profile: Profile
  onPublished: () => void
  post?: Post
}) {
  const [content, setContent] = useState(post?.content ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removeFile, setRemoveFile] = useState(false)
  const contentId = useId()
  const limitId = useId()
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
  const image = preview ?? (removeFile ? null : post?.fileUrl)
  const publish = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.set('content', content.trim())
      if (file) form.set('file', file)
      if (post) {
        form.set('removeFile', String(removeFile))
        return updatePost(post.id, form)
      }
      return createPost(form)
    },
    onSuccess: () => {
      setContent('')
      setFile(null)
      setRemoveFile(false)
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
        if (content.trim() && !publish.isPending && !fileError) publish.mutate()
      }}
      className={post ? '' : 'oj-card p-5'}
    >
      <div className="flex items-start gap-3">
        <Avatar name={profile.name} url={profile.avatarUrl} />
        <label className="sr-only" htmlFor={contentId}>
          Escreva uma publicação
        </label>
        <textarea
          ref={textareaRef}
          id={contentId}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={`O que você quer compartilhar, ${profile.name.split(' ')[0]}?`}
          maxLength={POST_CONTENT_MAX_LENGTH}
          aria-describedby={limitId}
          required
          disabled={publish.isPending}
          rows={5}
          className="min-h-[140px] w-full resize-y rounded-lg bg-[#f6f8fc] px-4 py-3 text-sm outline-none placeholder:text-[#8392a8] focus:ring-2 focus:ring-[#2378e8]/30"
        />
      </div>
      <p
        id={limitId}
        className={`mt-2 text-right text-xs ${content.length >= POST_CONTENT_MAX_LENGTH ? 'font-medium text-[#bd3845]' : 'text-[#8392a8]'}`}
      >
        {content.length.toLocaleString('pt-BR')} /{' '}
        {POST_CONTENT_MAX_LENGTH.toLocaleString('pt-BR')} caracteres
      </p>
      {image && (
        <div className="relative mt-4">
          <img
            src={image}
            alt="Prévia da imagem da publicação"
            className="max-h-56 w-full rounded-lg object-contain bg-[#f5f7fb]"
          />
          <button
            type="button"
            disabled={publish.isPending}
            onClick={() => {
              setFile(null)
              setRemoveFile(true)
              setFileError(null)
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
          {image ? 'Trocar foto' : 'Adicionar foto'}
          <input
            disabled={publish.isPending}
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={(event) => {
              const selected = event.target.files?.[0]
              setFileError(null)
              if (
                selected &&
                (!['image/jpeg', 'image/png', 'image/gif'].includes(
                  selected.type,
                ) ||
                  selected.size > 5 * 1024 * 1024)
              ) {
                setFileError('Escolha uma imagem JPG, PNG ou GIF de até 5 MB.')
                event.target.value = ''
                return
              }
              if (selected) {
                setFile(selected)
                setRemoveFile(false)
              }
            }}
          />
        </label>
        <button
          className="oj-button !px-4 !py-2"
          type="submit"
          disabled={publish.isPending || !content.trim() || !!fileError}
        >
          {publish.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {publish.isPending
            ? 'Salvando...'
            : post
              ? 'Salvar alterações'
              : 'Publicar'}
        </button>
      </div>
    </form>
  )
}
