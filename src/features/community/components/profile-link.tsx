import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MapPin } from 'lucide-react'
import { getPublicProfile } from '../services/community-service'
import type { Author } from '../services/community-service'
import { Avatar } from './avatar'
import { ProfileCover } from './profile-cover'

export function ProfileLink({
  person,
  children,
  className = '',
}: {
  person: Author
  children: ReactNode
  className?: string
}) {
  const [position, setPosition] = useState<{
    left: number
    top: number
  } | null>(null)
  const anchor = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardId = useId()
  const profile = useQuery({
    queryKey: ['public-profile', person.username],
    queryFn: () => getPublicProfile(person.username),
    enabled: !!position,
    staleTime: 60_000,
    retry: false,
  })
  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current)
  }
  const show = () => {
    clearTimer()
    const rect = anchor.current?.getBoundingClientRect()
    if (!rect) return
    timer.current = setTimeout(
      () =>
        setPosition({
          left: Math.max(12, Math.min(rect.left, window.innerWidth - 312)),
          top:
            rect.bottom + 290 > window.innerHeight
              ? Math.max(12, rect.top - 280)
              : rect.bottom + 8,
        }),
      180,
    )
  }
  const hide = () => {
    clearTimer()
    timer.current = setTimeout(() => setPosition(null), 140)
  }
  useEffect(() => () => clearTimer(), [])
  useEffect(() => {
    if (!position) return
    const close = () => setPosition(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [position])
  const data = profile.data
  return (
    <span
      ref={anchor}
      className={`inline-flex max-w-full ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <Link
        to="/p/$username"
        params={{ username: person.username }}
        className="max-w-full hover:text-[#1769d5]"
        onFocus={show}
        onBlur={hide}
        onClick={() => {
          clearTimer()
          setPosition(null)
        }}
        aria-describedby={position ? cardId : undefined}
      >
        {children}
      </Link>
      {position &&
        createPortal(
          <div
            id={cardId}
            role="region"
            aria-label={`Mini perfil de ${person.name}`}
            onMouseEnter={clearTimer}
            onMouseLeave={hide}
            onFocusCapture={clearTimer}
            onBlurCapture={hide}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setPosition(null)
            }}
            className="fixed z-[100] w-[288px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-[#dce6f3] bg-white text-[#142743] shadow-[0_16px_48px_rgba(15,42,77,.2)]"
            style={position}
          >
            <ProfileCover url={data?.coverUrl} className="h-24" />
            <div className="px-5 pb-5">
              <Avatar
                name={data?.name ?? person.name}
                url={data?.avatarUrl ?? person.avatarUrl}
                className="relative z-10 -mt-7 size-14 ring-4"
              />
              <h3 className="mt-3 break-words text-base font-bold">
                {data?.name ?? person.name}
              </h3>
              <p className="mt-1 text-xs text-[#8392a8]">@{person.username}</p>
              {data?.headline && (
                <p className="mt-3 text-sm leading-relaxed text-[#53657d]">
                  {data.headline}
                </p>
              )}
              {data?.location && (
                <p className="mt-2 flex items-center gap-1 text-xs text-[#8392a8]">
                  <MapPin className="size-3.5 shrink-0" />
                  {data.location}
                </p>
              )}
              {data?.bio && (
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#71819a]">
                  {data.bio}
                </p>
              )}
              {profile.isPending && (
                <p className="mt-3 text-xs text-[#8392a8]">
                  Carregando perfil...
                </p>
              )}
              <Link
                to="/p/$username"
                params={{ username: person.username }}
                onClick={() => setPosition(null)}
                className="mt-4 flex items-center justify-between rounded-lg bg-[#edf5ff] px-3 py-2.5 text-xs font-bold text-[#1769d5] hover:bg-[#e0edff]"
              >
                Ver perfil completo
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>,
          anchor.current?.closest('dialog') ?? document.body,
        )}
    </span>
  )
}
