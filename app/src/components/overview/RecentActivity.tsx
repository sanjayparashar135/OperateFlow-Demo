import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  GitBranch,
  UserPlus,
} from 'lucide-react'
import type { ActivityEntry } from '../../types/delivery'
import { formatDisplayDateTime } from '../../lib/format'
import { Panel, PanelHeader } from '../ui/Panel'

interface RecentActivityProps {
  entries: ActivityEntry[]
  onSelectRequest: (requestId: string) => void
}

const CATEGORY_META: Record<
  ActivityEntry['category'],
  { label: string; icon: typeof UserPlus; className: string }
> = {
  review: {
    label: 'Review',
    icon: ClipboardCheck,
    className: 'bg-amber-50 text-amber-700',
  },
  assignment: {
    label: 'Assignment',
    icon: UserPlus,
    className: 'bg-of-primary-soft text-of-primary',
  },
  progress: {
    label: 'Progress',
    icon: GitBranch,
    className: 'bg-sky-50 text-sky-700',
  },
  uat_release: {
    label: 'UAT / Release',
    icon: CheckCircle2,
    className: 'bg-of-ai-soft text-of-ai',
  },
  risk: {
    label: 'Risk',
    icon: AlertTriangle,
    className: 'bg-rose-50 text-rose-700',
  },
}

export function RecentActivity({
  entries,
  onSelectRequest,
}: RecentActivityProps) {
  return (
    <Panel>
      <PanelHeader
        title="Recent Activity"
        description="Fictional portfolio updates aligned to active delivery work."
      />

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {entries.map((entry) => {
          const meta = CATEGORY_META[entry.category]
          const Icon = meta.icon
          return (
            <li
              key={entry.id}
              className="flex gap-3 rounded-lg border border-of-border px-3 py-3 transition-colors hover:bg-of-canvas"
            >
              <span
                className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectRequest(entry.requestId)}
                    className="text-xs font-semibold text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
                  >
                    {entry.requestId}
                  </button>
                  <span className="text-[11px] font-medium tracking-wide text-of-ink-muted uppercase">
                    {meta.label}
                  </span>
                  <span className="text-xs text-of-ink-muted">
                    {formatDisplayDateTime(entry.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-of-ink-secondary">
                  <span className="font-medium text-of-ink">{entry.actor}</span>
                  {' — '}
                  {entry.message}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
