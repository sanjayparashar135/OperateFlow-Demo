import type { EstimationDecision } from '../../types/simulation'
import type { PersonaId } from '../../types/persona'
import { canConfirmEstimation } from '../../data/capabilities'
import { ConfirmedEstimationSummary } from './ConfirmedEstimationSummary'
import {
  EstimationDecisionForm,
  type EstimationFormSubmit,
} from './EstimationDecisionForm'
import { EstimationRecommendation } from './EstimationRecommendation'

export type { EstimationFormSubmit }

interface EstimationPanelProps {
  estimation: EstimationDecision
  personaId: PersonaId
  /** True when this is the main demo request with estimation available. */
  available: boolean
  onConfirm: (input: EstimationFormSubmit) => boolean
}

export function EstimationPanel({
  estimation,
  personaId,
  available,
  onConfirm,
}: EstimationPanelProps) {
  if (!available) {
    return (
      <div className="rounded-lg border border-dashed border-of-border bg-of-canvas/50 px-4 py-6 text-center">
        <p className="m-0 text-sm font-semibold text-of-ink">Estimation</p>
        <p className="mt-2 text-sm leading-relaxed text-of-ink-muted">
          AI-assisted estimation is available for submitted technical review
          requests after Intelligent Intake.
        </p>
      </div>
    )
  }

  const confirmed = estimation.decisionState === 'confirmed'
  const canDecide = canConfirmEstimation(personaId) && !confirmed

  return (
    <div className="flex flex-col gap-6">
      {confirmed ? (
        <ConfirmedEstimationSummary estimation={estimation} />
      ) : (
        <>
          <EstimationRecommendation />
          {canDecide ? (
            <EstimationDecisionForm onConfirm={onConfirm} />
          ) : (
            <div className="rounded-lg border border-of-border bg-of-canvas/40 px-4 py-3 text-sm text-of-ink-secondary">
              Technical estimate is awaiting review by Sanjay Parashar. You can
              view the recommendation; confirmation is limited to the solution
              architect.
            </div>
          )}
        </>
      )}
    </div>
  )
}
