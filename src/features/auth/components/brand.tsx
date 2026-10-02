import { BriefcaseBusiness } from 'lucide-react'

export function Brand({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="Open Jobs">
      <span className={`grid size-10 place-items-center rounded-xl ${dark ? 'bg-[#0b2245] text-white' : 'bg-white/15 text-white ring-1 ring-white/25'}`}>
        <BriefcaseBusiness aria-hidden="true" className="size-5" strokeWidth={2.2} />
      </span>
      <span className={`text-[22px] font-extrabold tracking-[-1.1px] ${dark ? 'text-[#102446]' : 'text-white'}`}>
        Open <span className={dark ? 'text-[#1769d5]' : 'text-[#8dc2ff]'}>Jobs</span>
      </span>
    </span>
  )
}
