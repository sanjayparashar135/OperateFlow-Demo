import { useMemo, useState } from 'react'
import type {
  DeliveryHealth,
  DeliveryRequest,
  LifecycleStage,
  RequestsViewPreset,
} from '../../types/delivery'
import { LIFECYCLE_STAGES } from '../../types/delivery'
import { formatDisplayDate } from '../../lib/format'
import { requestsViewLabel } from '../../data/portfolioSelectors'
import { HealthBadge, StageBadge } from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

const HEALTH_OPTIONS: Array<DeliveryHealth | 'All'> = [
  'All',
  'On Track',
  'At Risk',
  'Delayed',
]

interface RequestsPortfolioTableProps {
  requests: DeliveryRequest[]
  view: RequestsViewPreset
  onClearView: () => void
  onSelectRequest: (requestId: string) => void
  emptyPersona: boolean
}

export function RequestsPortfolioTable({
  requests,
  view,
  onClearView,
  onSelectRequest,
  emptyPersona,
}: RequestsPortfolioTableProps) {
  const [stageFilter, setStageFilter] = useState<LifecycleStage | 'All'>('All')
  const [healthFilter, setHealthFilter] = useState<DeliveryHealth | 'All'>(
    'All',
  )
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter((request) => {
      const stageOk =
        stageFilter === 'All' || request.lifecycleStage === stageFilter
      const healthOk =
        healthFilter === 'All' || request.deliveryHealth === healthFilter
      const searchOk =
        query.length === 0 ||
        request.id.toLowerCase().includes(query) ||
        request.title.toLowerCase().includes(query)
      return stageOk && healthOk && searchOk
    })
  }, [requests, stageFilter, healthFilter, search])

  const hasLocalFilters =
    stageFilter !== 'All' || healthFilter !== 'All' || search.trim().length > 0

  return (
    <Panel padding="lg">
      <PanelHeader
        title="Request list"
        description="Read-only view. Select a row for ownership, status, and summary."
      />

      <div className="mb-4 flex flex-col gap-3">
        {view !== 'all' ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-of-primary-border bg-of-primary-soft px-3 py-2 text-sm text-of-primary">
            <span>
              Showing preset: <strong>{requestsViewLabel(view)}</strong>
            </span>
            <button
              type="button"
              onClick={onClearView}
              className="ml-auto text-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            >
              Clear preset
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[12rem] flex-[1.2] flex-col gap-1 text-xs font-medium text-of-ink-muted">
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Request ID or title"
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            />
          </label>

          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-medium text-of-ink-muted">
            Lifecycle stage
            <select
              value={stageFilter}
              onChange={(event) =>
                setStageFilter(event.target.value as LifecycleStage | 'All')
              }
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            >
              <option value="All">All stages</option>
              {LIFECYCLE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-medium text-of-ink-muted">
            Delivery health
            <select
              value={healthFilter}
              onChange={(event) =>
                setHealthFilter(event.target.value as DeliveryHealth | 'All')
              }
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            >
              {HEALTH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All health' : option}
                </option>
              ))}
            </select>
          </label>

          <p className="text-sm text-of-ink-muted sm:ml-auto">
            Showing {filtered.length} of {requests.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-of-border">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-of-canvas text-xs tracking-wide text-of-ink-muted uppercase">
            <tr>
              <th className="px-3 py-3 font-semibold">Request</th>
              <th className="px-3 py-3 font-semibold">Lifecycle</th>
              <th className="px-3 py-3 font-semibold">Health</th>
              <th className="px-3 py-3 font-semibold">Target</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((request) => (
              <tr
                key={request.id}
                className="border-t border-of-border transition-colors hover:bg-of-canvas"
              >
                <td className="px-3 py-3 align-top">
                  <button
                    type="button"
                    onClick={() => onSelectRequest(request.id)}
                    className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
                  >
                    <span className="block text-xs font-semibold text-of-primary">
                      {request.id}
                    </span>
                    <span className="mt-0.5 block font-medium text-of-ink">
                      {request.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-of-ink-muted">
                      {request.application}
                    </span>
                  </button>
                </td>
                <td className="px-3 py-3 align-top">
                  <StageBadge stage={request.lifecycleStage} />
                </td>
                <td className="px-3 py-3 align-top">
                  <HealthBadge health={request.deliveryHealth} />
                </td>
                <td className="px-3 py-3 align-top whitespace-nowrap text-of-ink-secondary">
                  {formatDisplayDate(request.targetDate)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-sm text-of-ink-muted"
                >
                  {emptyPersona
                    ? 'No requests are assigned to this persona in the current portfolio.'
                    : hasLocalFilters || view !== 'all'
                      ? 'No requests match the current filters or search.'
                      : 'No requests to display.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
