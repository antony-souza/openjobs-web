import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { signUp } from '../services/auth-service'

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const password = String(form.get('password') ?? '')
    const passwordConfirmation = String(form.get('passwordConfirmation') ?? '')
    const username = String(form.get('username') ?? '').trim().replace(/^@/, '').toLowerCase()

    setError(null)
    setSuccess(null)

    if (password !== passwordConfirmation) {
      setError('As senhas precisam ser iguais.')
      return
    }

    if (!/^[a-z0-9._]{3,30}$/.test(username)) {
      setError('O @usuário deve ter de 3 a 30 caracteres: letras, números, ponto ou _.')
      return
    }

    setIsLoading(true)

    try {
      const { message, token } = await signUp({
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        username,
        password,
      })
      setSuccess(message)
      localStorage.setItem('openjobs:token', token)
      formElement.reset()
      await navigate({ to: '/home' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return { error, isLoading, success, submit }
}
