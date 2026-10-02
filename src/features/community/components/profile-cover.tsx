import { useState } from 'react'

export function ProfileCover({
  url,
  className = 'h-40 sm:h-52',
}: {
  url?: string | null
  className?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  return (
    <div
      className={`relative overflow-hidden bg-[linear-gradient(115deg,#0d2852,#1769d5_65%,#75aff4)] ${className}`}
    >
      {url && failedUrl !== url ? (
        <img
          src={url}
          alt="Capa do perfil"
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <>
          <div className="absolute -top-20 -right-8 size-72 rounded-full border-[32px] border-white/10" />
          <div className="absolute right-44 bottom-[-90px] size-48 rounded-full border-[24px] border-white/5" />
        </>
      )}
    </div>
  )
}
