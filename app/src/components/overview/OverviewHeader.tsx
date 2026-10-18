import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useRole } from '../../context/useRole'
import { canCreateRequest } from '../../data/capabilities'
import { getPersonaViewCopy } from '../../data/personaViews'
import type { PortfolioKpis } from '../../data/portfolioSelectors'
import { formatDisplayDate, greetingForPersona } from '../../lib/format'

interface OverviewHeaderProps {
  kpis: PortfolioKpis
  visibleCount: number
  simulatedToday: string
}

export function OverviewHeader({
  kpis,
  visibleCount,
  simulatedToday,
}: OverviewHeaderProps) {
  const { currentPersona } = useRole()
  const viewCopy = getPersonaViewCopy(currentPersona.id)
  const showNewRequest = canCreateRequest(currentPersona.id)

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        <p className="m-0 text-xs font-semibold tracking-[0.08em] text-of-primary uppercase">
          Northstar Financial Services · {viewCopy.contextLabel}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-of-ink sm:text-3xl">
          {greetingForPersona(currentPersona.name)}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-of-ink-secondary">
          {viewCopy.overviewBlurb} {visibleCount} visible · {kpis.activeRequests}{' '}
          active · {kpis.needsAttention} needing attention (as of{' '}
          {formatDisplayDate(simulatedToday)}).
        </p>
      </div>

      {showNewRequest ? (
        <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
          <Link
            to="/requests/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Request
          </Link>
          <p className="max-w-xs text-xs leading-relaxed text-of-ink-muted sm:text-right">
            Start Intelligent Intake for a Northstar enhancement request.
          </p>
        </div>
      ) : null}
    </header>
  )
}
