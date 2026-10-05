export function publicationTimestamp(date: string) {
  // Legacy API timestamps come from the UTC production server without an offset.
  const value = date.trim()
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
  return new Date(hasOffset ? value : `${value}Z`).getTime()
}

export function timeAgo(date: string, now = Date.now()) {
  const elapsed = Math.max(0, now - publicationTimestamp(date))
  if (!Number.isFinite(elapsed)) return 'Data indisponível'
  const seconds = Math.floor(elapsed / 1000)
  if (seconds === 0) return 'Agora'
  if (seconds < 60) return `há ${seconds} s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes} min`
  if (minutes < 1440) return `há ${Math.floor(minutes / 60)} h`
  const days = Math.floor(minutes / 1440)
  return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
}
