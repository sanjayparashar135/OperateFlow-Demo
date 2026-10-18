import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { DeliveryInsight } from '../../types/delivery'
import { Panel, PanelHeader } from '../ui/Panel'

interface DeliveryIntelligenceProps {
  insights: DeliveryInsight[]
  onSelectRequest: (requestId: string) => void
}

const KIND_LABEL: Record<DeliveryInsight['kind'], string> = {
  deadline: 'Deadline',
  approval: 'Approval',
  risk: 'Risk',
}

export function DeliveryIntelligence({
  insights,
  onSelectRequest,
}: DeliveryIntelligenceProps) {
  return (
    <Panel className="border-of-ai-border bg-gradient-to-br from-of-surface to-of-ai-soft/40">
      <PanelHeader
        title="Delivery Intelligence"
        description="Priority signals across your visible requests."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-md bg-of-ai-soft px-2 py-1 text-xs font-medium text-of-ai ring-1 ring-of-ai-border">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            AI insights
          </span>
        }
      />

      {insights.length === 0 ? (
        <p className="m-0 rounded-lg border border-of-border bg-of-surface/90 px-4 py-3 text-sm text-of-ink-muted">
          No delivery insights apply to your current request view.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className="rounded-lg border border-of-border bg-of-surface/90 px-4 py-3 transition-colors hover:border-of-ai-border"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-of-ai-soft px-2 py-0.5 text-[11px] font-semibold tracking-wide text-of-ai uppercase">
                  {KIND_LABEL[insight.kind]}
                </span>
                <p className="m-0 text-sm font-semibold text-of-ink">
                  {insight.title}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-of-ink-secondary">
                {insight.detail}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {insight.requestIds.map((requestId) => (
                  <button
                    key={requestId}
                    type="button"
                    onClick={() => onSelectRequest(requestId)}
                    className="rounded-md bg-of-primary-soft px-2 py-1 text-xs font-semibold text-of-primary transition-colors hover:bg-of-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
                  >
                    {requestId}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-of-ink-muted">
        <Link
          to="/requests"
          className="font-medium text-of-primary hover:underline"
        >
          Browse your requests
        </Link>
      </p>
    </Panel>
  )
}
