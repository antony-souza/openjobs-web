import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'

import { useSignIn } from '../hooks/use-sign-in'
import { Brand } from './brand'

const inputClass = 'w-full min-w-0 border-0 bg-transparent text-[15px] text-[#102446] outline-none placeholder:text-[#92a0b5]'
const inputWrapClass = 'flex h-13 items-center gap-3 rounded-xl border border-[#d8e2ee] bg-white px-4 text-[#637994] transition focus-within:border-[#2378e8] focus-within:ring-4 focus-within:ring-[#2378e8]/10'

export function LoginForm() {
  const { error, isLoading, submit } = useSignIn()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('password')) return

    url.searchParams.delete('password')
    url.searchParams.delete('email')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])

  return (
    <main className="w-full max-w-[440px]">
      <Brand dark className="mb-12 lg:hidden" />
      <div className="mb-9">
        <span className="mb-3 block text-xs font-bold tracking-[.17em] text-[#2378e8] uppercase">Bem-vindo de volta</span>
        <h1 className="text-[clamp(32px,3vw,42px)] leading-tight font-bold tracking-[-.045em] text-[#102446]">Entre na sua conta</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#61738c]">Acesse suas vagas e continue de onde parou.</p>
      </div>

      <form method="post" onSubmit={submit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#243b59]" htmlFor="email">E-mail</label>
          <div className={inputWrapClass}>
            <Mail className="size-5 shrink-0" aria-hidden="true" />
            <input className={inputClass} id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#243b59]" htmlFor="password">Senha</label>
          <div className={inputWrapClass}>
            <LockKeyhole className="size-5 shrink-0" aria-hidden="true" />
            <input className={inputClass} id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" required />
            <button className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-[#637994] hover:bg-[#edf4fd] hover:text-[#1769d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2378e8]" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        {error && <p className="rounded-lg bg-[#fff1f0] px-4 py-3 text-sm text-[#b3261e]" role="alert">{error}</p>}
        <button className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1769d5] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(23,105,213,.18)] transition hover:bg-[#0e58bd] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1769d5] disabled:cursor-wait disabled:opacity-70" disabled={isLoading} type="submit">
          {isLoading ? 'Entrando...' : 'Entrar'}
          {!isLoading && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>

      <div className="mt-8 border-t border-[#e2e9f2] pt-7 text-center text-sm text-[#61738c]">
        Ainda não tem uma conta?{' '}
        <Link className="font-semibold text-[#1769d5] underline-offset-4 hover:underline" to="/cadastro">Criar conta</Link>
      </div>
    </main>
  )
}
