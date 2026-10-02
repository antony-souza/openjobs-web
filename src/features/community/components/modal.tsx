import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({
  title,
  children,
  close,
}: {
  title: string
  children: ReactNode
  close: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_32px)] max-w-[640px] overflow-y-auto rounded-2xl border border-[#e3e9f2] bg-white p-0 text-[#142743] shadow-2xl backdrop:bg-[#0b2245]/50"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#e3e9f2] bg-white px-6 py-5">
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        <button
          className="cursor-pointer rounded-lg p-1 hover:bg-[#f5f7fb]"
          onClick={close}
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  )
}
