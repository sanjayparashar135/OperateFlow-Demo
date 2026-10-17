import type { LifecycleBucket } from '../../data/portfolioSelectors'
import { Panel, PanelHeader } from '../ui/Panel'

interface LifecycleDistributionProps {
  buckets: LifecycleBucket[]
}

const STAGE_COLORS = [
  'bg-sky-400',
  'bg-of-primary',
  'bg-indigo-500',
  'bg-of-ai',
  'bg-slate-400',
]

export function LifecycleDistribution({
  buckets,
}: LifecycleDistributionProps) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0)

  return (
    <Panel>
      <PanelHeader
        title="Lifecycle Distribution"
        description={`${total} visible requests, including closed work.`}
      />

      <div
        className="flex h-3 overflow-hidden rounded-full bg-of-canvas ring-1 ring-of-border"
        role="img"
        aria-label={buckets
          .map((bucket) => `${bucket.stage}: ${bucket.count}`)
          .join(', ')}
      >
        {buckets.map((bucket, index) => {
          if (bucket.count === 0 || total === 0) return null
          const width = `${(bucket.count / total) * 100}%`
          return (
            <div
              key={bucket.stage}
              className={`${STAGE_COLORS[index]} h-full`}
              style={{ width }}
              title={`${bucket.stage}: ${bucket.count}`}
            />
          )
        })}
      </div>

      <ul className="mt-4 m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
        {buckets.map((bucket, index) => (
          <li
            key={bucket.stage}
            className="flex items-center justify-between gap-3 rounded-lg border border-of-border px-3 py-2"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm text-of-ink-secondary">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${STAGE_COLORS[index]}`}
                aria-hidden="true"
              />
              <span className="truncate">{bucket.stage}</span>
            </span>
            <span className="text-sm font-semibold text-of-ink">
              {bucket.count}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
