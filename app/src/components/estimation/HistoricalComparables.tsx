import type { HistoricalComparable } from '../../types/simulation'

interface HistoricalComparablesProps {
  comparables: HistoricalComparable[]
}

export function HistoricalComparables({
  comparables,
}: HistoricalComparablesProps) {
  return (
    <section>
      <h3 className="m-0 text-sm font-semibold text-of-ink">
        Historical comparable work
      </h3>
      <p className="mt-1 text-sm text-of-ink-muted">
        Fictional reference examples used for planning context. Historical
        effort is shown separately from the proposed estimate.
      </p>
      <ul className="mt-3 m-0 flex list-none flex-col gap-2 p-0">
        {comparables.map((item) => (
          <li
            key={item.jiraId}
            className="rounded-lg border border-of-border bg-of-canvas/50 px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="m-0 text-sm font-semibold text-of-ink">
                {item.jiraId} · {item.title}
              </p>
              <p className="m-0 text-sm font-semibold text-of-ink-secondary">
                Historical effort: {item.historicalEffortHours}h
              </p>
            </div>
            <p className="mt-1 text-sm text-of-ink-secondary">{item.relevance}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
