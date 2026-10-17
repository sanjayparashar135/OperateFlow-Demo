import { Link } from 'react-router-dom'
import type { AttentionItem } from '../../data/portfolioSelectors'
import { personaRelatesToRequest } from '../../data/portfolioSelectors'
import { formatDisplayDate } from '../../lib/format'
import { primaryOwnerName } from '../../lib/requestParties'
import { useRole } from '../../context/useRole'
import { HealthBadge, StatusBadge } from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

interface NeedsAttentionPanelProps {
  items: AttentionItem[]
  onSelectRequest: (requestId: string) => void
}

export function NeedsAttentionPanel({
  items,
  onSelectRequest,
}: NeedsAttentionPanelProps) {
  const { currentPersona } = useRole()
  const preview = items.slice(0, 3)

  return (
    <Panel>
      <PanelHeader
        title="Needs Your Attention"
        description={`${items.length} in your view require follow-up.`}
        action={
          <Link
            to="/requests?view=attention"
            className="text-sm font-semibold text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            View all
          </Link>
        }
      />

      {preview.length === 0 ? (
        <p className="text-sm text-of-ink-muted">
          No attention items in your current request view.
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-of-border rounded-lg border border-of-border p-0">
          {preview.map((item) => {
            const isYours = personaRelatesToRequest(item, currentPersona.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectRequest(item.id)}
                  className="flex w-full flex-col gap-1.5 px-3 py-2.5 text-left transition-colors hover:bg-of-canvas focus-visible:bg-of-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-of-primary"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-of-primary">
                      {item.id}
                    </span>
                    {isYours ? (
                      <span className="rounded-md bg-of-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-of-primary uppercase">
                        You
                      </span>
                    ) : null}
                    <HealthBadge health={item.deliveryHealth} />
                  </div>
                  <p className="m-0 text-sm font-medium text-of-ink">
                    {item.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-of-ink-muted">
                    <span>{item.application}</span>
                    <span>{primaryOwnerName(item)}</span>
                    <StatusBadge status={item.workflowStatus} />
                    <span>Due {formatDisplayDate(item.targetDate)}</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
