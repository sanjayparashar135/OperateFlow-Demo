import { useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { RequestSummaryModal } from '../components/requests/RequestSummaryModal'
import { RequestsPortfolioTable } from '../components/requests/RequestsPortfolioTable'
import { Panel } from '../components/ui/Panel'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import { canCreateRequest } from '../data/capabilities'
import { getPersonaViewCopy } from '../data/personaViews'
import {
  applyRequestsViewPreset,
  getVisibleRequests,
  parseRequestsViewPreset,
} from '../data/portfolioSelectors'
import { useRequestSummary } from '../hooks/useRequestSummary'

export function RequestsPage() {
  const { currentPersona } = useRole()
  const {
    requests,
    hasMainRequest,
    mainRequestId,
    simulatedToday,
  } = useSimulation()
  const [searchParams, setSearchParams] = useSearchParams()
  const referenceDate = simulatedToday
  const viewCopy = getPersonaViewCopy(currentPersona.id)
  const summary = useRequestSummary(currentPersona.id, requests, referenceDate)
  const previousPersonaId = useRef(currentPersona.id)
  const showIntakeEntry = canCreateRequest(currentPersona.id)

  const view = parseRequestsViewPreset(searchParams.get('view'))

  useEffect(() => {
    if (previousPersonaId.current === currentPersona.id) return
    previousPersonaId.current = currentPersona.id
    setSearchParams(
      (prev) => {
        if (!prev.get('view')) return prev
        const next = new URLSearchParams(prev)
        next.delete('view')
        return next
      },
      { replace: true },
    )
  }, [currentPersona.id, setSearchParams])

  const visible = useMemo(
    () => getVisibleRequests(currentPersona.id, requests),
    [currentPersona.id, requests],
  )

  const listed = useMemo(
    () => applyRequestsViewPreset(visible, view, referenceDate),
    [visible, view, referenceDate],
  )

  const clearView = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('view')
        return next
      },
      { replace: true },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="m-0 text-xs font-semibold tracking-[0.08em] text-of-primary uppercase">
          Northstar Financial Services
        </p>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-of-ink">
          {viewCopy.requestsLabel} — {visible.length}{' '}
          {visible.length === 1 ? 'request' : 'requests'}
        </h1>
        <p className="m-0 text-sm text-of-ink-muted">
          {currentPersona.name} · {currentPersona.role}
        </p>
      </header>

      {showIntakeEntry ? (
        <Panel className="border-of-ai-border bg-of-ai-soft/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-of-ai" aria-hidden="true" />
                <p className="m-0 text-sm font-semibold text-of-ai">
                  Intelligent Intake
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-of-ink-secondary">
                {hasMainRequest
                  ? `${mainRequestId} is already in your portfolio. Open the request or use Reset Demo in the header to start again.`
                  : 'Start a guided clarification with the AI Intake Assistant to create a structured enhancement request.'}
              </p>
            </div>
            {hasMainRequest && mainRequestId ? (
              <Link
                to={`/requests/${mainRequestId}`}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-of-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              >
                Open {mainRequestId}
              </Link>
            ) : (
              <Link
                to="/requests/new"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-of-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Request
              </Link>
            )}
          </div>
        </Panel>
      ) : null}

      <RequestsPortfolioTable
        key={currentPersona.id}
        requests={listed}
        view={view}
        onClearView={clearView}
        onSelectRequest={summary.openRequest}
        emptyPersona={visible.length === 0}
      />

      <RequestSummaryModal
        request={summary.request}
        reasons={summary.reasons}
        open={summary.open}
        onClose={summary.closeRequest}
      />
    </div>
  )
}
