import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8082/api',
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('openjobs:token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
