import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { getMyJobs, updateJob } from '../services/community-service'
import type { MyJob } from '../services/community-service'
import { RelativeTime } from './relative-time'

export function JobManager({
  userId,
  canPublish,
  canEdit,
}: {
  userId: string
  canPublish: boolean
  canEdit: boolean
}) {
  const jobs = useInfiniteQuery({
    queryKey: ['my-jobs', userId],
    queryFn: ({ pageParam }) => getMyJobs(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) =>
      (last.page + 1) * last.size < last.total ? last.page + 1 : undefined,
  })
  const items = jobs.data?.pages.flatMap((page) => page.items) ?? []
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Gerenciador de vagas</h2>
          <p className="mt-1 text-sm text-[#71819a]">
            Acompanhe e atualize as oportunidades que você publicou.
          </p>
        </div>
        {canPublish && (
          <Link className="oj-button" to="/vagas/publicar">
            Publicar vaga
          </Link>
        )}
      </div>
      {jobs.isPending && (
        <p className="oj-card p-6 text-sm text-[#71819a]">
          Carregando suas vagas...
        </p>
      )}
      {jobs.isError && (
        <div className="oj-card p-6">
          <p role="alert" className="text-sm text-[#bd3845]">
            {jobs.error.message}
          </p>
          <button
            className="oj-button mt-4"
            onClick={() => void jobs.refetch()}
          >
            Tentar novamente
          </button>
        </div>
      )}
      {jobs.isSuccess && items.length === 0 && (
        <div className="oj-card p-8">
          <h3 className="font-bold">Você ainda não publicou vagas.</h3>
          <p className="mt-2 text-sm text-[#71819a]">
            Suas oportunidades aparecerão aqui depois de publicadas.
          </p>
        </div>
      )}
      {items.map((job) => (
        <ManagedJob key={job.id} job={job} canEdit={canEdit} />
      ))}
      {jobs.hasNextPage && (
        <button
          className="oj-button"
          disabled={jobs.isFetchingNextPage}
          onClick={() => void jobs.fetchNextPage()}
        >
          {jobs.isFetchingNextPage ? 'Carregando...' : 'Carregar mais vagas'}
        </button>
      )}
    </section>
  )
}

function ManagedJob({ job, canEdit }: { job: MyJob; canEdit: boolean }) {
  const client = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(job.title)
  const [description, setDescription] = useState(job.description)
  const save = useMutation({
    mutationFn: () =>
      updateJob(job.id, {
        title: title.trim(),
        description: description.trim(),
      }),
    onSuccess: async () => {
      setEditing(false)
      await Promise.all(
        ['my-jobs', 'jobs', 'latest-jobs'].map((key) =>
          client.invalidateQueries({ queryKey: [key] }),
        ),
      )
    },
  })
  return (
    <article className="oj-card p-6">
      {editing ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (title.trim() && description.trim()) save.mutate()
          }}
        >
          <div>
            <label
              className="mb-2 block text-sm font-semibold"
              htmlFor={`title-${job.id}`}
            >
              Título da vaga
            </label>
            <input
              id={`title-${job.id}`}
              className="oj-input"
              required
              maxLength={255}
              value={title}
              disabled={save.isPending}
              onChange={(event) => {
                setTitle(event.target.value)
                save.reset()
              }}
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-semibold"
              htmlFor={`description-${job.id}`}
            >
              Descrição
            </label>
            <textarea
              id={`description-${job.id}`}
              className="oj-input min-h-64 resize-y"
              required
              maxLength={3000}
              value={description}
              disabled={save.isPending}
              onChange={(event) => {
                setDescription(event.target.value)
                save.reset()
              }}
            />
            <p className="mt-1 text-right text-xs text-[#8392a8]">
              {description.length.toLocaleString('pt-BR')} / 3.000 caracteres
            </p>
          </div>
          {save.isError && (
            <p role="alert" className="text-sm text-[#bd3845]">
              {save.error.message}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="cursor-pointer px-4 text-sm text-[#61738c]"
              disabled={save.isPending}
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
            <button
              className="oj-button"
              type="submit"
              disabled={save.isPending || !title.trim() || !description.trim()}
            >
              {save.isPending ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="break-words text-lg font-bold">{job.title}</h3>
              <p className="mt-1 text-xs text-[#8392a8]">
                Publicada <RelativeTime date={job.createdAt} />
              </p>
            </div>
            {canEdit && (
              <button
                className="shrink-0 cursor-pointer text-sm font-semibold text-[#1769d5]"
                onClick={() => {
                  setTitle(job.title)
                  setDescription(job.description)
                  save.reset()
                  setEditing(true)
                }}
              >
                Editar vaga
              </button>
            )}
          </div>
          <p className="mt-4 line-clamp-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#61738c]">
            {job.description}
          </p>
          {save.isSuccess && (
            <p role="status" className="mt-4 text-sm text-[#18794e]">
              Vaga atualizada com sucesso.
            </p>
          )}
        </>
      )}
    </article>
  )
}
