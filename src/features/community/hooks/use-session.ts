import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, getProfile } from '../services/community-service'

export function useSession({ required = true }: { required?: boolean } = {}) {
  const [ready, setReady] = useState(false)
  const [checked, setChecked] = useState(false)
  const navigate = useNavigate()
  const client = useQueryClient()
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: ready,
    retry: false,
  })
  useEffect(() => {
    setChecked(true)
    if (!localStorage.getItem('openjobs:token')) {
      if (required) void navigate({ to: '/' })
      return
    }
    setReady(true)
  }, [navigate, required])
  useEffect(() => {
    if (
      profile.error instanceof ApiError &&
      (profile.error.status === 401 || profile.error.status === 403)
    ) {
      localStorage.removeItem('openjobs:token')
      client.clear()
      setReady(false)
      if (required) void navigate({ to: '/' })
    }
  }, [profile.error, client, navigate, required])

  function signOut() {
    localStorage.removeItem('openjobs:token')
    client.clear()
    void navigate({ to: '/' })
  }
  return {
    profile: ready ? profile.data : undefined,
    error: profile.error,
    loading: !checked || (ready && profile.isPending),
    retry: profile.refetch,
    signOut,
  }
}
