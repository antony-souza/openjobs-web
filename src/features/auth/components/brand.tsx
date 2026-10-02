export function Brand({
  dark = false,
  className = '',
}: {
  dark?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="OpenJobs"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <img
        src="/brand/openjobs-symbol.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        width={40}
        height={40}
        className={`pointer-events-none size-10 shrink-0 object-contain ${dark ? '' : 'rounded-lg bg-white p-1'}`}
      />
      <span
        className={`text-[22px] font-extrabold tracking-[-1.1px] ${dark ? 'text-[#102446]' : 'text-white'}`}
      >
        Open
        <span className={dark ? 'text-[#1769d5]' : 'text-[#8dc2ff]'}>Jobs</span>
      </span>
    </span>
  )
}
