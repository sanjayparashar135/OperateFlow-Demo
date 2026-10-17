import { useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { RequestSummaryModal } from '../components/requests/RequestSummaryModal'
import { RequestsPortfolioTable } from '../components/requests/RequestsPortfolioTable'
import { Panel } from '../components/ui/Panel'
import { useRole } from '../context/useRole'
import { getPersonaViewCopy } from '../data/personaViews'
import {
  applyRequestsViewPreset,
  getVisibleRequests,
  parseRequestsViewPreset,
} from '../data/portfolioSelectors'
import { getSimulatedToday } from '../data/simDate'
import { useRequestSummary } from '../hooks/useRequestSummary'

export function RequestsPage() {
  const { currentPersona } = useRole()
  const [searchParams, setSearchParams] = useSearchParams()
  const referenceDate = getSimulatedToday()
  const viewCopy = getPersonaViewCopy(currentPersona.id)
  const summary = useRequestSummary(currentPersona.id, referenceDate)
  const previousPersonaId = useRef(currentPersona.id)

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
    () => getVisibleRequests(currentPersona.id),
    [currentPersona.id],
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

      <Panel className="border-of-ai-border bg-of-ai-soft/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-of-ai" aria-hidden="true" />
              <p className="m-0 text-sm font-semibold text-of-ai">
                Intelligent Intake — coming soon
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-of-ink-secondary">
              The + New Request path will open a guided intake conversation in
              the next milestone. This page remains a read-only portfolio view.
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 text-sm font-semibold text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            Back to Overview
          </Link>
        </div>
      </Panel>

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
