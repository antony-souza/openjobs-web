import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  LoaderCircle,
  X,
} from 'lucide-react'
import { applyForJob, getJobs, timeAgo } from '../services/community-service'
import type { Job } from '../services/community-service'
import { Avatar } from './avatar'

export function Modal({
  title,
  children,
  close,
}: {
  title: string
  children: ReactNode
  close: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(640px,calc(100%-32px))] overflow-y-auto rounded-2xl border border-[#e3e9f2] bg-white p-0 text-[#142743] shadow-2xl backdrop:bg-[#0b2245]/50"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#e3e9f2] bg-white px-6 py-5">
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        <button
          className="cursor-pointer rounded-lg p-1 hover:bg-[#f5f7fb]"
          onClick={close}
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  )
}

export function LatestJobs({ openAll }: { openAll: () => void }) {
  const jobs = useQuery({ queryKey: ['latest-jobs'], queryFn: () => getJobs() })
  const [selected, setSelected] = useState<Job | null>(null)
  return (
    <aside id="vagas" className="space-y-4 xl:sticky xl:top-[100px]">
      <section className="oj-card p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Vagas em destaque</h2>
          <button
            onClick={openAll}
            className="cursor-pointer text-xs font-semibold text-[#1769d5]"
          >
            Ver todas
          </button>
        </div>
        <p className="mb-4 text-[11px] text-[#8392a8]">
          As 3 oportunidades mais recentes
        </p>
        {jobs.isPending && (
          <div className="h-52 animate-pulse rounded bg-[#edf2f8]" />
        )}
        {jobs.isError && (
          <div>
            <p role="alert" className="text-xs text-[#bd3845]">
              {jobs.error.message}
            </p>
            <button
              className="mt-3 text-xs text-[#1769d5]"
              onClick={() => void jobs.refetch()}
            >
              Tentar novamente
            </button>
          </div>
        )}
        {jobs.data?.items.map((job) => (
          <button
            key={job.id}
            onClick={() => setSelected(job)}
            className="group -mx-2 flex w-[calc(100%+16px)] cursor-pointer items-start gap-3 rounded-lg border-b border-[#edf0f6] px-2 py-4 text-left last:border-0 hover:bg-[#f7faff]"
          >
            <Avatar
              name={job.publishedBy.name}
              url={job.publishedBy.avatarUrl}
              className="size-10 rounded-xl text-xs"
            />
            <div className="min-w-0">
              <h3 className="text-sm leading-snug font-semibold group-hover:text-[#1769d5]">
                {job.title}
              </h3>
              <p className="mt-1 text-xs text-[#71819a]">
                {job.publishedBy.name}
              </p>
              <time
                className="mt-2 block text-[10px] text-[#91a0b4]"
                dateTime={job.createdAt}
              >
                {timeAgo(job.createdAt)}
              </time>
            </div>
          </button>
        ))}
        {jobs.data?.items.length === 0 && (
          <p className="py-5 text-sm leading-relaxed text-[#71819a]">
            As novas vagas aparecerão aqui assim que forem publicadas.
          </p>
        )}
      </section>
      <div className="rounded-xl border border-[#dce9fb] bg-[#edf5ff] p-5">
        <BriefcaseBusiness className="mb-3 size-7 text-[#1769d5]" />
        <h2 className="text-sm font-bold">Um novo passo para sua carreira</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#61738c]">
          Explore as oportunidades publicadas na Open Jobs.
        </p>
        <button
          className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#1769d5]"
          onClick={openAll}
        >
          Explorar vagas
          <ArrowRight className="size-3.5" />
        </button>
      </div>
      {selected && (
        <Modal title="Detalhes da oportunidade" close={() => setSelected(null)}>
          <JobDetails job={selected} />
        </Modal>
      )}
    </aside>
  )
}

export function JobsDialog({
  search,
  close,
}: {
  search: string
  close: () => void
}) {
  const [selected, setSelected] = useState<Job | null>(null)
  const jobs = useInfiniteQuery({
    queryKey: ['jobs', search],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getJobs(pageParam, search, 10),
    getNextPageParam: (last) =>
      (last.page + 1) * last.size < last.total ? last.page + 1 : undefined,
  })
  return (
    <Modal
      title={
        selected
          ? 'Detalhes da oportunidade'
          : search
            ? `Vagas para “${search}”`
            : 'Explore as oportunidades'
      }
      close={close}
    >
      {selected ? (
        <>
          <button
            className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-[#1769d5]"
            onClick={() => setSelected(null)}
          >
            <ArrowLeft className="size-4" />
            Voltar às vagas
          </button>
          <JobDetails key={selected.id} job={selected} />
        </>
      ) : (
        <div className="space-y-3">
          {jobs.isPending && (
            <p className="text-sm text-[#71819a]">
              Carregando oportunidades...
            </p>
          )}
          {jobs.isError && (
            <button
              className="text-sm text-[#bd3845]"
              onClick={() => void jobs.refetch()}
            >
              Não foi possível carregar. Tentar novamente
            </button>
          )}
          {jobs.data?.pages
            .flatMap((page) => page.items)
            .map((job) => (
              <button
                key={job.id}
                className="oj-card w-full cursor-pointer p-4 text-left hover:border-[#1769d5]"
                onClick={() => setSelected(job)}
              >
                <h3 className="font-semibold">{job.title}</h3>
                <p className="mt-1 text-xs text-[#71819a]">
                  {job.publishedBy.name} · {timeAgo(job.createdAt)}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#61738c]">
                  {job.description}
                </p>
              </button>
            ))}
          {jobs.data?.pages[0].total === 0 && (
            <p className="py-8 text-center text-sm text-[#71819a]">
              Nenhuma vaga encontrada. Tente outro termo.
            </p>
          )}
          {jobs.hasNextPage && (
            <button
              className="oj-button w-full"
              onClick={() => void jobs.fetchNextPage()}
              disabled={jobs.isFetchingNextPage}
            >
              Carregar mais vagas
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}

function JobDetails({ job }: { job: Job }) {
  const apply = useMutation({ mutationFn: () => applyForJob(job.id) })
  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar
          name={job.publishedBy.name}
          url={job.publishedBy.avatarUrl}
          className="size-12 rounded-xl"
        />
        <div>
          <p className="text-sm font-medium">{job.publishedBy.name}</p>
          <p className="mt-1 text-xs text-[#8392a8]">
            Publicada {timeAgo(job.createdAt)}
          </p>
        </div>
      </div>
      <h3 className="mt-6 text-2xl font-bold tracking-tight">{job.title}</h3>
      <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#53657d]">
        {job.description}
      </p>
      {apply.error && (
        <p
          className="mt-5 rounded-lg bg-[#fff1f0] p-3 text-sm text-[#bd3845]"
          role="alert"
        >
          {apply.error.message}
        </p>
      )}
      {apply.isSuccess ? (
        <p
          role="status"
          className="mt-6 flex items-center gap-2 rounded-lg bg-[#edf9f1] p-4 text-sm font-medium text-[#18794e]"
        >
          <CheckCircle2 className="size-5" />
          Sua candidatura foi enviada.
        </p>
      ) : (
        <button
          className="oj-button mt-7 w-full"
          disabled={apply.isPending}
          onClick={() => apply.mutate()}
        >
          {apply.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <BriefcaseBusiness className="size-4" />
          )}
          Candidatar-me à vaga
        </button>
      )}
    </div>
  )
}
