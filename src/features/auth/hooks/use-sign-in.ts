import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { signIn } from '../services/auth-service'

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    setError(null)
    setIsLoading(true)

    try {
      const { token } = await signIn({ email, password })
      localStorage.setItem('openjobs:token', token)
      await navigate({ to: '/home' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return { error, isLoading, submit }
}
