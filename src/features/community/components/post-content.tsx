import { useEffect, useId, useRef, useState } from 'react'

export function PostContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const text = useRef<HTMLParagraphElement>(null)
  const textId = useId()

  useEffect(() => {
    const node = text.current
    if (!node || expanded) return
    const measure = () => setOverflow(node.scrollHeight > node.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [content, expanded])

  return (
    <div className="mt-4">
      <p
        ref={text}
        id={textId}
        className={`whitespace-pre-wrap break-words text-sm leading-[1.7] text-[#354961] ${expanded ? '' : 'line-clamp-4'}`}
      >
        {content}
      </p>
      {overflow && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={() => setExpanded(!expanded)}
          className="mt-2 cursor-pointer text-sm font-semibold text-[#1769d5] hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}
