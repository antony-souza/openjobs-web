import { useEffect, useState } from 'react'
import { publicationTimestamp, timeAgo } from '../services/relative-time'

export function RelativeTime({ date }: { date: string }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const update = () => {
      const current = Date.now()
      setNow(current)
      const elapsed = Math.max(0, current - publicationTimestamp(date))
      const unit =
        elapsed < 60_000
          ? 1000
          : elapsed < 3_600_000
            ? 60_000
            : elapsed < 86_400_000
              ? 3_600_000
              : 86_400_000
      timer = setTimeout(
        update,
        Number.isFinite(elapsed) ? unit - (elapsed % unit) : 60_000,
      )
    }
    update()
    return () => clearTimeout(timer)
  }, [date])
  return <time dateTime={date}>{timeAgo(date, now)}</time>
}
