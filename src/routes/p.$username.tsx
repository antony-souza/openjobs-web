import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  BriefcaseBusiness,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  LoaderCircle,
  MapPin,
  Pencil,
} from 'lucide-react'
import { Brand } from '../features/auth/components/brand'
import { AppShell } from '../features/community/components/app-shell'
import { ProfileCover } from '../features/community/components/profile-cover'
import { ProfileAbout } from '../features/community/components/profile-about'
import { Avatar } from '../features/community/components/avatar'
import { Feed } from '../features/community/components/feed'
import { useSession } from '../features/community/hooks/use-session'
import {
  ApiError,
  getPublicProfile,
} from '../features/community/services/community-service'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/p/$username')({
  component: PublicProfilePage,
  head: ({ params }) => ({
    meta: [{ title: `@${params.username} | Open Jobs` }],
  }),
})

function PublicProfilePage() {
  const { username } = Route.useParams()
  const session = useSession({ required: false })
  const profile = useQuery({
    queryKey: ['public-profile', username],
    queryFn: () => getPublicProfile(username),
    retry: false,
  })
  let content: ReactNode
  if (profile.isPending) {
    content = (
      <div className="oj-card flex items-center justify-center gap-3 p-12 text-sm text-[#71819a]">
        <LoaderCircle className="size-5 animate-spin" />
        Carregando perfil...
      </div>
    )
  } else if (profile.isError) {
    const missing =
      profile.error instanceof ApiError && profile.error.status === 404
    content = (
      <div className="oj-card p-10 text-center">
        <h1 className="text-xl font-bold">
          {missing
            ? 'Perfil não encontrado'
            : 'Não foi possível carregar o perfil'}
        </h1>
        <p className="mt-3 text-sm text-[#71819a]">{profile.error.message}</p>
        {!missing && (
          <button
            className="oj-button mt-5"
            onClick={() => void profile.refetch()}
          >
            Tentar novamente
          </button>
        )}
        <Link
          to="/home"
          className="mt-5 block text-sm font-semibold text-[#1769d5]"
        >
          Voltar para a comunidade
        </Link>
      </div>
    )
  } else {
    const person = profile.data
    const own = session.profile?.id === person.id
    content = (
      <main className="min-w-0 space-y-6">
        <section className="oj-card overflow-hidden">
          <ProfileCover url={person.coverUrl} />
          <div className="px-6 pb-6 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Avatar
                name={person.name}
                url={person.avatarUrl}
                className="relative z-10 -mt-12 size-24 text-3xl ring-4 sm:-mt-14 sm:size-28"
              />
              {own && (
                <Link
                  to="/perfil"
                  search={{ section: 'editar' }}
                  className="oj-button mt-4 !py-2"
                >
                  <Pencil className="size-4" />
                  Editar perfil
                </Link>
              )}
            </div>
            <h1 className="mt-5 break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {person.name}
            </h1>
            {person.headline && (
              <p className="mt-2 text-base leading-relaxed text-[#53657d]">
                {person.headline}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#8392a8]">
              <span>@{person.username}</span>
              {person.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {person.location}
                </span>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-semibold text-[#1769d5]">
                <BriefcaseBusiness className="size-3.5" />
                {person.role}
              </span>
              <span className="text-xs text-[#71819a]">
                {person.postsCount}{' '}
                {person.postsCount === 1 ? 'publicação' : 'publicações'}
              </span>
            </div>
          </div>
        </section>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-6">
            <ProfileAbout key={`${person.id}:${person.bio}`} bio={person.bio} />
            <Feed
              profile={session.profile}
              scope="public"
              authorUsername={person.username}
            />
          </div>
          <aside className="space-y-4">
            <section className="oj-card p-5">
              <h2 className="font-bold">Portfólio e links</h2>
              {person.portfolioUrl || person.linkedinUrl ? (
                <div className="mt-4 space-y-3">
                  {person.portfolioUrl && (
                    <a
                      href={person.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-[#e3e9f2] p-3 text-sm font-semibold text-[#1769d5] hover:bg-[#edf5ff]"
                    >
                      <Globe className="size-5" />
                      <span className="flex-1">Meu portfólio</span>
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  {person.linkedinUrl && (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-[#e3e9f2] p-3 text-sm font-semibold text-[#1769d5] hover:bg-[#edf5ff]"
                    >
                      <LinkIcon className="size-5" />
                      <span className="flex-1">LinkedIn</span>
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-[#8392a8]">
                  Nenhum link adicionado ainda.
                </p>
              )}
            </section>
            <div className="rounded-xl border border-[#dce9fb] bg-[#edf5ff] p-5">
              <h3 className="text-sm font-semibold">
                Conexões começam por aqui
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#61738c]">
                Conheça as ideias, experiências e publicações de @
                {person.username}.
              </p>
            </div>
          </aside>
        </div>
      </main>
    )
  }
  if (session.profile) return <AppShell session={session}>{content}</AppShell>
  return (
    <div className="min-h-dvh bg-[#f5f7fb] text-[#142743]">
      <header className="border-b border-[#e5ebf3] bg-white">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/">
            <Brand dark />
          </Link>
          <Link to="/" className="oj-button !px-4">
            Entrar
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">{content}</div>
    </div>
  )
}
