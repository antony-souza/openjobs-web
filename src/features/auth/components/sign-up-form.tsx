import { Link } from '@tanstack/react-router'
import { ArrowRight, AtSign, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'

import { useSignUp } from '../hooks/use-sign-up'
import { Brand } from './brand'

const inputClass = 'w-full min-w-0 border-0 bg-transparent text-[15px] text-[#102446] outline-none placeholder:text-[#92a0b5]'
const inputWrapClass = 'flex h-12 items-center gap-3 rounded-xl border border-[#d8e2ee] bg-white px-4 text-[#637994] transition focus-within:border-[#2378e8] focus-within:ring-4 focus-within:ring-[#2378e8]/10'
const labelClass = 'mb-1.5 block text-sm font-semibold text-[#243b59]'

export function SignUpForm() {
  const { error, isLoading, success, submit } = useSignUp()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="w-full max-w-[440px]">
      <Brand dark className="mb-8 lg:hidden" />
      <div className="mb-7">
        <span className="mb-2 block text-xs font-bold tracking-[.17em] text-[#2378e8] uppercase">Comece por aqui</span>
        <h1 className="text-[clamp(32px,3vw,42px)] leading-tight font-bold tracking-[-.045em] text-[#102446]">Crie sua conta</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#61738c]">Seu próximo passo começa com um perfil Open Jobs.</p>
      </div>

      <form method="post" onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="name">Nome completo</label>
          <div className={inputWrapClass}>
            <UserRound className="size-5 shrink-0" aria-hidden="true" />
            <input className={inputClass} id="name" name="name" type="text" placeholder="Como você se chama?" autoComplete="name" required />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="username">Seu @usuário</label>
          <div className={inputWrapClass}>
            <AtSign className="size-5 shrink-0" aria-hidden="true" />
            <input className={inputClass} id="username" name="username" type="text" placeholder="seunome" autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={30} pattern="[a-zA-Z0-9._]{3,30}" title="Use de 3 a 30 letras, números, ponto ou _; sem @" required onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/^@/, '').toLowerCase() }} />
          </div>
          <p className="mt-1.5 text-xs text-[#7a8ba2]">Exemplo: @seunome · letras, números, ponto ou _</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="email">E-mail</label>
          <div className={inputWrapClass}>
            <Mail className="size-5 shrink-0" aria-hidden="true" />
            <input className={inputClass} id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="password">Senha</label>
          <div className={inputWrapClass}>
            <LockKeyhole className="size-5 shrink-0" aria-hidden="true" />
            <input className={inputClass} id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo de 6 caracteres" autoComplete="new-password" minLength={6} maxLength={100} required />
            <button className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-[#637994] hover:bg-[#edf4fd] hover:text-[#1769d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2378e8]" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar senhas' : 'Mostrar senhas'} aria-pressed={showPassword}>
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="passwordConfirmation">Confirme sua senha</label>
          <div className={inputWrapClass}>
            <LockKeyhole className="size-5 shrink-0" aria-hidden="true" />
            <input className={inputClass} id="passwordConfirmation" name="passwordConfirmation" type={showPassword ? 'text' : 'password'} placeholder="Repita sua senha" autoComplete="new-password" minLength={6} maxLength={100} required />
          </div>
        </div>

        {error && <p className="rounded-lg bg-[#fff1f0] px-4 py-3 text-sm text-[#b3261e]" role="alert">{error}</p>}
        {success && <p className="rounded-lg bg-[#edf9f1] px-4 py-3 text-sm text-[#18794e]" role="status">{success}</p>}
        <button className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1769d5] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(23,105,213,.18)] transition hover:bg-[#0e58bd] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1769d5] disabled:cursor-wait disabled:opacity-70" disabled={isLoading} type="submit">
          {isLoading ? 'Criando conta...' : 'Criar conta'}
          {!isLoading && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>

      <div className="mt-6 border-t border-[#e2e9f2] pt-5 text-center text-sm text-[#61738c]">
        Já tem uma conta?{' '}
        <Link className="font-semibold text-[#1769d5] underline-offset-4 hover:underline" to="/">Entrar</Link>
      </div>
    </main>
  )
}
