import { useEffect, useId, useRef, useState } from 'react'

export function ProfileAbout({ bio }: { bio: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const text = useRef<HTMLParagraphElement>(null)
  const id = useId()

  useEffect(() => {
    const element = text.current
    if (!element) return
    const measure = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight)
      setCanExpand(element.scrollHeight > lineHeight * 4 + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [bio])

  return (
    <section className="oj-card p-6">
      <h2 className="text-lg font-bold">Sobre</h2>
      <p
        ref={text}
        id={id}
        className={`mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#61738c] ${expanded ? '' : 'line-clamp-4'}`}
      >
        {bio ?? 'Esta pessoa ainda não adicionou uma apresentação.'}
      </p>
      {canExpand && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
          className="mt-3 cursor-pointer rounded text-sm font-semibold text-[#1769d5] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1769d5]"
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </section>
  )
}
