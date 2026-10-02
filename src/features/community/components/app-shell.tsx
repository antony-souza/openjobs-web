import { Link, useLocation } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  Home,
  LoaderCircle,
  LogOut,
  Menu,
  Settings,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { useSession } from '../hooks/use-session'
import { getMenu } from '../services/community-service'
import type { MenuItem } from '../services/community-service'
import { Brand } from '../../auth/components/brand'
import { Avatar } from './avatar'

const defaultMenus: MenuItem[] = [
  { title: 'Início', iconName: 'Home', path: '/home' },
  {
    title: 'Explorar vagas',
    iconName: 'BriefcaseBusiness',
    path: '/home#vagas',
  },
  { title: 'Meu perfil', iconName: 'UserRound', path: '/perfil' },
  { title: 'Comunidade', iconName: 'UsersRound', path: '/home#feed' },
]
const icons: Record<string, typeof Home> = {
  Home,
  BriefcaseBusiness,
  Briefcase: BriefcaseBusiness,
  UserRound,
  User: UserRound,
  UsersRound,
  Users: UsersRound,
  Settings,
}

export function AppShell({
  session,
  children,
  hero,
}: {
  session: ReturnType<typeof useSession>
  children: ReactNode
  hero?: ReactNode
}) {
  const { profile, loading, error } = session
  const [mobileMenu, setMobileMenu] = useState(false)
  const [accountMenu, setAccountMenu] = useState(false)
  const location = useLocation()
  const menus = useQuery({
    queryKey: ['menu', profile?.id],
    queryFn: getMenu,
    enabled: !!profile,
  })

  if (!profile)
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f7f9fc] p-6 text-center">
        <div className="max-w-md">
          <Brand dark />
          {loading ? (
            <p className="mt-6 flex items-center justify-center gap-2 text-[#61738c]">
              <LoaderCircle className="size-5 animate-spin" />
              Carregando sua conta...
            </p>
          ) : (
            <>
              <p role="alert" className="mt-6 text-[#61738c]">
                {error?.message}
              </p>
              <button
                className="oj-button mt-5"
                onClick={() => void session.retry()}
              >
                Tentar novamente
              </button>
              <button
                className="ml-4 text-sm text-[#61738c]"
                onClick={session.signOut}
              >
                Voltar ao login
              </button>
            </>
          )}
        </div>
      </main>
    )

  const navigation = menus.data?.length ? menus.data : defaultMenus
  return (
    <div className="min-h-dvh bg-[#f5f7fb] text-[#142743]">
      <header className="sticky top-0 z-30 border-b border-[#e5ebf3] bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/home" aria-label="Open Jobs, página inicial">
            <Brand dark />
          </Link>
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 md:flex"
          >
            <Link
              className={`oj-toplink ${location.pathname === '/home' ? 'bg-[#edf5ff] text-[#1769d5]' : ''}`}
              to="/home"
            >
              <Home className="size-4" />
              Início
            </Link>
            <a className="oj-toplink" href="/home#vagas">
              <BriefcaseBusiness className="size-4" />
              Vagas
            </a>
            <a className="oj-toplink" href="/home#feed">
              <UsersRound className="size-4" />
              Comunidade
            </a>
          </nav>
          <div className="relative ml-auto">
            <button
              onClick={() => setAccountMenu(!accountMenu)}
              aria-expanded={accountMenu}
              aria-label="Menu da conta"
              className="flex cursor-pointer items-center gap-3 rounded-xl p-1.5 hover:bg-[#f5f7fb]"
            >
              <Avatar name={profile.name} url={profile.avatarUrl} />
              <span className="hidden text-left text-sm sm:block">
                <strong className="block max-w-40 truncate font-semibold">
                  {profile.name}
                </strong>
                <span className="text-xs text-[#71819a]">{profile.role}</span>
              </span>
              <ChevronDown className="size-4 text-[#71819a]" />
            </button>
            {accountMenu && (
              <div className="absolute top-full right-0 mt-3 w-52 rounded-xl border border-[#e5ebf3] bg-white p-2 shadow-xl">
                <Link
                  to="/perfil"
                  className="oj-toplink"
                  onClick={() => setAccountMenu(false)}
                >
                  <UserRound className="size-4" />
                  Editar perfil
                </Link>
                <button
                  className="oj-toplink w-full cursor-pointer text-[#bd3845]"
                  onClick={session.signOut}
                >
                  <LogOut className="size-4" />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
          <button
            className="cursor-pointer lg:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label={mobileMenu ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {hero}
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-start gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[228px_minmax(0,1fr)] xl:gap-7">
        <aside
          className={`${mobileMenu ? 'block' : 'hidden'} space-y-4 lg:sticky lg:top-[100px] lg:block`}
        >
          <div className="oj-card overflow-hidden">
            <div className="h-16 bg-[linear-gradient(120deg,#dceaff,#edf7ff)]" />
            <div className="px-5 pb-5">
              <Avatar
                name={profile.name}
                url={profile.avatarUrl}
                className="-mt-8 size-[68px] text-xl ring-4"
              />
              <h2 className="mt-3 truncate font-bold">{profile.name}</h2>
              <p className="mt-1 text-sm text-[#71819a]">@{profile.username}</p>
              <Link
                to="/perfil"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1769d5]"
              >
                Ver meu perfil
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <nav
            aria-label="Menu lateral"
            className="oj-card max-h-[min(420px,45dvh)] overflow-y-auto overscroll-contain p-2"
          >
            {navigation.map((item) => {
              const Icon = icons[item.iconName] ?? Home
              const active = item.path === location.pathname
              return (
                <a
                  key={item.path}
                  href={
                    item.path.startsWith('/') && !item.path.startsWith('//')
                      ? item.path
                      : '/home'
                  }
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${active ? 'bg-[#edf5ff] font-semibold text-[#1769d5]' : 'text-[#53657d] hover:bg-[#f5f7fb]'}`}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {item.title}
                </a>
              )
            })}
          </nav>
          {!profile.avatarUrl && (
            <div className="rounded-xl bg-[#eaf3ff] p-5">
              <span className="mb-2 block text-sm font-bold">
                Mostre quem você é
              </span>
              <p className="text-xs leading-relaxed text-[#61738c]">
                Adicione uma foto para deixar seu perfil com a sua cara.
              </p>
              <Link
                to="/perfil"
                className="mt-4 inline-flex text-sm font-semibold text-[#1769d5]"
              >
                Adicionar foto →
              </Link>
            </div>
          )}
          <p className="px-2 text-[11px] leading-relaxed text-[#91a0b4]">
            Open Jobs © 2026
            <br />
            Seu próximo passo começa aqui.
          </p>
        </aside>
        {children}
      </div>
    </div>
  )
}
