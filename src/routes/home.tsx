import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useState } from 'react'
import loginHero from '../assets/login-hero.png'
import { AppShell } from '../features/community/components/app-shell'
import { Feed } from '../features/community/components/feed'
import { LatestJobs } from '../features/community/components/jobs'
import { useSession } from '../features/community/hooks/use-session'

export const Route = createFileRoute('/home')({
  component: HomePage,
  head: () => ({ meta: [{ title: 'Open Jobs | Comunidade e oportunidades' }] }),
})

function HomePage() {
  const session = useSession()
  const [search, setSearch] = useState('')
  const navigate = Route.useNavigate()
  return (
    <AppShell
      session={session}
      hero={
        <section className="relative isolate overflow-hidden bg-[#102944] text-white">
          <img
            src={loginHero}
            alt=""
            className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[center_43%] opacity-35 sm:w-3/5 sm:opacity-70"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#102944_15%,rgba(16,41,68,.8)_48%,rgba(16,41,68,.2))]" />
          <div className="mx-auto max-w-[1360px] px-5 py-9 sm:px-8 sm:py-11">
            <h2 className="max-w-xl text-[clamp(28px,3vw,42px)] leading-[1.15] font-bold tracking-tight">
              Seu próximo passo.
              <br />
              Sua próxima oportunidade.
            </h2>
            <p className="mt-3 text-sm text-[#c1d3e9]">
              Encontre vagas e faça parte de uma comunidade que cresce com você.
            </p>
            <form
              method="post"
              onSubmit={(event) => {
                event.preventDefault()
                void navigate({
                  to: '/vagas',
                  search: { busca: search.trim(), publicada: false },
                })
              }}
              className="mt-6 flex max-w-[650px] items-center gap-3 rounded-xl border border-white/25 bg-white p-1.5 shadow-lg"
            >
              <Search className="ml-3 size-5 shrink-0 text-[#71819a]" />
              <label htmlFor="job-search" className="sr-only">
                Buscar vagas por cargo ou palavra-chave
              </label>
              <input
                id="job-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cargo ou palavra-chave"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#142743] outline-none placeholder:text-[#91a0b4]"
              />
              <button
                className="oj-button shrink-0 !px-3 sm:!px-5"
                type="submit"
              >
                Buscar vagas
              </button>
            </form>
          </div>
        </section>
      }
    >
      {session.profile && (
        <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
          <Feed profile={session.profile} />
          <LatestJobs
            openAll={() =>
              void navigate({
                to: '/vagas',
                search: { busca: '', publicada: false },
              })
            }
          />
        </div>
      )}
    </AppShell>
  )
}
