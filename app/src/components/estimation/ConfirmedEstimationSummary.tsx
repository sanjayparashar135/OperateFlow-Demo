import type { EstimationDecision } from '../../types/simulation'
import { ESTIMATION_SUGGESTION } from '../../data/estimationDataset'
import { personaDisplayName } from '../../lib/requestParties'
import { Badge } from '../ui/Badge'
import { EffortBreakdown } from './EffortBreakdown'

interface ConfirmedEstimationSummaryProps {
  estimation: EstimationDecision
}

export function ConfirmedEstimationSummary({
  estimation,
}: ConfirmedEstimationSummaryProps) {
  const suggestion = ESTIMATION_SUGGESTION
  const isOverride = estimation.mode === 'overridden'
  const decidedBy = estimation.decidedById
    ? personaDisplayName(estimation.decidedById)
    : 'Solution architect'

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-of-border bg-of-canvas/40 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success">Technical estimate confirmed</Badge>
          <Badge tone={isOverride ? 'warning' : 'ai'}>
            {isOverride ? 'Human override' : 'Accepted recommendation'}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
              Confirmed effort
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-of-ink">
              {estimation.confirmedHours}{' '}
              <span className="text-lg font-semibold text-of-ink-secondary">
                hours
              </span>
            </p>
          </div>
          {isOverride ? (
            <div>
              <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Original AI suggestion
              </p>
              <p className="mt-1 text-lg font-semibold text-of-ink-secondary">
                {suggestion.suggestedHours} hours (
                {suggestion.rangeMin}–{suggestion.rangeMax})
              </p>
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-of-ink-secondary">
          Confirmed by {decidedBy}. Technical estimate confirmed. Awaiting
          business approval.
        </p>
        {isOverride && estimation.overrideJustification ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2">
            <p className="m-0 text-xs font-semibold tracking-wide text-amber-900 uppercase">
              Override justification
            </p>
            <p className="mt-1 text-sm text-amber-950">
              {estimation.overrideJustification}
            </p>
          </div>
        ) : null}
      </div>

      <section>
        <h3 className="m-0 text-sm font-semibold text-of-ink">
          Confirmed delivery approach
        </h3>
        <p className="mt-2 rounded-lg border border-of-border bg-of-surface px-4 py-3 text-sm leading-relaxed text-of-ink-secondary">
          {estimation.confirmedApproach}
        </p>
      </section>

      <EffortBreakdown
        breakdown={suggestion.breakdown}
        totalHours={suggestion.suggestedHours}
        caption={
          isOverride
            ? 'Original AI-suggested breakdown (reference only — not the confirmed allocation)'
            : 'Confirmed using suggested effort breakdown'
        }
      />
    </div>
  )
}
