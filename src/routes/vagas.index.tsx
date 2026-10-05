import { createFileRoute, Link } from '@tanstack/react-router'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { AppShell } from '../features/community/components/app-shell'
import { Avatar } from '../features/community/components/avatar'
import { JobDetails } from '../features/community/components/jobs'
import { Modal } from '../features/community/components/modal'
import { RelativeTime } from '../features/community/components/relative-time'
import { useSession } from '../features/community/hooks/use-session'
import {
  getJobCapabilities,
  getJobs,
} from '../features/community/services/community-service'
import type { Job } from '../features/community/services/community-service'

export const Route = createFileRoute('/vagas/')({
  validateSearch: (search: Record<string, unknown>) => ({
    busca: typeof search.busca === 'string' ? search.busca : '',
    publicada: search.publicada === true || search.publicada === 'true',
  }),
  component: JobsPage,
  head: () => ({ meta: [{ title: 'Vagas | OpenJobs' }] }),
})

function JobsPage() {
  const session = useSession()
  const { busca, publicada } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [search, setSearch] = useState(busca)
  const [selected, setSelected] = useState<Job | null>(null)
  const capabilities = useQuery({
    queryKey: ['job-capabilities', session.profile?.id],
    queryFn: getJobCapabilities,
    enabled: !!session.profile,
  })
  const jobs = useInfiniteQuery({
    queryKey: ['jobs', busca],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getJobs(pageParam, busca, 10),
    getNextPageParam: (last) =>
      (last.page + 1) * last.size < last.total ? last.page + 1 : undefined,
    enabled: !!session.profile,
  })
  const items = jobs.data?.pages.flatMap((page) => page.items) ?? []

  return (
    <AppShell session={session}>
      {session.profile && (
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl bg-[linear-gradient(115deg,#102b53,#1769d5)] p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-[.16em] text-blue-200">
                  OPORTUNIDADES
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Seu próximo passo começa aqui.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Explore as vagas da comunidade e encontre uma oportunidade
                  para sua carreira.
                </p>
              </div>
              {capabilities.data?.canPublish && (
                <Link
                  to="/vagas/publicar"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1769d5] hover:bg-blue-50"
                >
                  <Plus className="size-4" />
                  Publicar vaga
                </Link>
              )}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void navigate({
                  search: { busca: search.trim(), publicada: false },
                })
              }}
              className="mt-7 flex gap-2 rounded-xl bg-white p-2"
            >
              <label htmlFor="jobs-search" className="sr-only">
                Buscar vagas por cargo
              </label>
              <Search className="ml-2 size-5 self-center text-[#71819a]" />
              <input
                id="jobs-search"
                className="min-w-0 flex-1 px-2 text-sm text-[#142743] outline-none placeholder:text-[#91a0b4]"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Qual cargo você está procurando?"
              />
              <button type="submit" className="oj-button !px-3 sm:!px-5">
                Buscar
              </button>
            </form>
          </section>
          {publicada && (
            <p
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800"
            >
              Sua vaga foi publicada! Ela já está disponível para a comunidade.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                {busca ? `Resultados para “${busca}”` : 'Vagas disponíveis'}
              </h2>
              {jobs.data && (
                <p className="mt-1 text-sm text-[#71819a]">
                  {jobs.data.pages[0].total}{' '}
                  {jobs.data.pages[0].total === 1
                    ? 'oportunidade encontrada'
                    : 'oportunidades encontradas'}
                </p>
              )}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e0e8f2] bg-white px-3 py-2 text-xs text-[#61738c]">
              <SlidersHorizontal className="size-3.5" />
              Mais recentes
            </span>
          </div>
          {jobs.isPending && (
            <div aria-label="Carregando vagas" className="space-y-3">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="oj-card h-40 animate-pulse bg-[#edf2f8]"
                />
              ))}
            </div>
          )}
          {jobs.isError && (
            <section className="oj-card p-6">
              <p role="alert" className="text-sm text-[#bd3845]">
                {jobs.error.message}
              </p>
              <button
                className="oj-button mt-4"
                onClick={() => void jobs.refetch()}
              >
                Tentar novamente
              </button>
            </section>
          )}
          {!jobs.isPending && !jobs.isError && !items.length && (
            <section className="oj-card py-14 text-center">
              <BriefcaseBusiness className="mx-auto mb-4 size-10 text-[#1769d5]" />
              <h3 className="font-bold">
                {busca
                  ? 'Nenhuma vaga encontrada'
                  : 'As oportunidades começam aqui'}
              </h3>
              <p className="mt-2 px-5 text-sm text-[#71819a]">
                {busca
                  ? 'Experimente outro cargo ou palavra-chave.'
                  : 'As novas vagas aparecerão aqui assim que forem publicadas.'}
              </p>
            </section>
          )}
          <div className="space-y-3">
            {items.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelected(job)}
                className="oj-card group block w-full cursor-pointer p-5 text-left transition hover:border-[#99bdf0] hover:shadow-md sm:p-6"
              >
                <div className="flex gap-4">
                  <Avatar
                    name={job.publishedBy.name}
                    url={job.publishedBy.avatarUrl}
                    className="size-12 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-bold group-hover:text-[#1769d5]">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#61738c]">
                      {job.publishedBy.name}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-5 shrink-0 text-[#91a0b4] group-hover:text-[#1769d5]" />
                </div>
                <p className="mt-4 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#61738c]">
                  {job.description}
                </p>
                <div className="mt-4 flex justify-between border-t border-[#edf0f6] pt-3 text-xs text-[#8392a8]">
                  <RelativeTime date={job.createdAt} />
                  <span className="font-semibold text-[#1769d5]">
                    Ver oportunidade
                  </span>
                </div>
              </button>
            ))}
          </div>
          {jobs.hasNextPage && (
            <button
              className="oj-button w-full"
              disabled={jobs.isFetchingNextPage}
              onClick={() => void jobs.fetchNextPage()}
            >
              {jobs.isFetchingNextPage
                ? 'Carregando...'
                : 'Carregar mais vagas'}
            </button>
          )}
        </div>
      )}
      {selected && (
        <Modal title="Detalhes da oportunidade" close={() => setSelected(null)}>
          <JobDetails key={selected.id} job={selected} />
        </Modal>
      )}
    </AppShell>
  )
}
