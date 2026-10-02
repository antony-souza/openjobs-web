import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, getProfile } from '../services/community-service'

export function useSession() {
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()
  const client = useQueryClient()
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: ready,
    retry: false,
  })
  useEffect(() => {
    if (!localStorage.getItem('openjobs:token')) {
      void navigate({ to: '/' })
      return
    }
    setReady(true)
  }, [navigate])
  useEffect(() => {
    if (profile.error instanceof ApiError && profile.error.status === 401) {
      localStorage.removeItem('openjobs:token')
      client.clear()
      void navigate({ to: '/' })
    }
  }, [profile.error, client, navigate])

  function signOut() {
    localStorage.removeItem('openjobs:token')
    client.clear()
    void navigate({ to: '/' })
  }
  return {
    profile: profile.data,
    error: profile.error,
    loading: !ready || profile.isPending,
    retry: profile.refetch,
    signOut,
  }
}
