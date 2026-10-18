import { Sparkles } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { ESTIMATION_SUGGESTION } from '../../data/estimationDataset'
import { EffortBreakdown } from './EffortBreakdown'
import { HistoricalComparables } from './HistoricalComparables'

export function EstimationRecommendation() {
  const suggestion = ESTIMATION_SUGGESTION

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-of-ai-border bg-of-ai-soft/50 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-of-ai-soft text-of-ai">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <Badge tone="ai">AI-assisted recommendation</Badge>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
          <div className="flex min-w-0 flex-col">
            <p className="m-0 min-h-4 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
              Suggested estimate
            </p>
            <p className="mt-2 flex min-h-10 items-baseline gap-1.5 text-3xl font-semibold tracking-tight text-of-ink">
              <span>{suggestion.suggestedHours}</span>
              <span className="text-lg font-semibold text-of-ink-secondary">
                hours
              </span>
            </p>
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="m-0 min-h-4 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
              Suggested range
            </p>
            <p className="mt-2 flex min-h-10 items-baseline text-lg font-semibold text-of-ink-secondary">
              {suggestion.rangeMin}–{suggestion.rangeMax} hours
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-of-ink-secondary">
          {suggestion.rationale}
        </p>
      </div>

      <HistoricalComparables comparables={suggestion.comparables} />
      <EffortBreakdown
        breakdown={suggestion.breakdown}
        totalHours={suggestion.suggestedHours}
      />
    </div>
  )
}
