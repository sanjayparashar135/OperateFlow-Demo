import type { EffortBreakdownItem } from '../../types/simulation'

interface EffortBreakdownProps {
  breakdown: EffortBreakdownItem[]
  totalHours: number
  /** Clarifies this is the AI-suggested allocation, not a confirmed split. */
  caption?: string
}

export function EffortBreakdown({
  breakdown,
  totalHours,
  caption = 'Suggested effort breakdown',
}: EffortBreakdownProps) {
  return (
    <section>
      <h3 className="m-0 text-sm font-semibold text-of-ink">{caption}</h3>
      <ul className="mt-3 m-0 divide-y divide-of-border overflow-hidden rounded-lg border border-of-border p-0">
        {breakdown.map((item) => (
          <li
            key={item.component}
            className="flex list-none items-center justify-between gap-3 bg-of-surface px-4 py-2.5 text-sm"
          >
            <span className="text-of-ink-secondary">{item.component}</span>
            <span className="font-semibold text-of-ink">{item.hours}h</span>
          </li>
        ))}
        <li className="flex list-none items-center justify-between gap-3 bg-of-ai-soft/40 px-4 py-2.5 text-sm">
          <span className="font-semibold text-of-ink">Suggested total</span>
          <span className="font-semibold text-of-ai">{totalHours}h</span>
        </li>
      </ul>
    </section>
  )
}
