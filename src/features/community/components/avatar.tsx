import { useState } from 'react'

export function Avatar({
  name,
  url,
  className = 'size-10',
}: {
  name: string
  url?: string | null
  className?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f0ff] font-bold text-[#1769d5] ring-2 ring-white ${className}`}
    >
      {url && failedUrl !== url ? (
        <img
          className="size-full object-cover"
          src={url}
          alt={`Foto de ${name}`}
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <span aria-label={name}>{initials}</span>
      )}
    </span>
  )
}
