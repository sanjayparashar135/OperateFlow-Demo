import { Link } from 'react-router-dom'
import type { EstimationDecision } from '../../types/simulation'
import type { PersonaId } from '../../types/persona'
import type { WorkflowStatus } from '../../types/delivery'
import {
  canApproveBusinessEstimate,
  canConfirmEstimation,
} from '../../data/capabilities'
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
  workflowStatus: WorkflowStatus
  businessApproved: boolean
  /** True when this is the main demo request with estimation available. */
  available: boolean
  onConfirm: (input: EstimationFormSubmit) => boolean
  onApproveBusiness: () => boolean
}

export function EstimationPanel({
  estimation,
  personaId,
  workflowStatus,
  businessApproved,
  available,
  onConfirm,
  onApproveBusiness,
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
  const canBusinessApprove =
    canApproveBusinessEstimate(personaId) &&
    confirmed &&
    !businessApproved &&
    workflowStatus === 'Pending Approval'

  return (
    <div className="flex flex-col gap-6">
      {confirmed ? (
        <>
          <ConfirmedEstimationSummary estimation={estimation} />
          {canBusinessApprove ? (
            <div className="rounded-xl border border-of-primary-border bg-of-primary-soft/40 px-4 py-4">
              <p className="m-0 text-sm font-semibold text-of-ink">
                Business approval required
              </p>
              <p className="mt-1 text-sm text-of-ink-secondary">
                Review the confirmed hours and delivery approach, then approve
                the estimate. Resource assignment remains a separate project
                manager step.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onApproveBusiness()}
                  className="inline-flex rounded-lg bg-of-primary px-4 py-2 text-sm font-semibold text-white hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
                >
                  Approve estimate
                </button>
                <Link
                  to="/approvals-planning"
                  className="inline-flex items-center text-sm font-semibold text-of-primary hover:underline"
                >
                  Open Approvals &amp; Planning
                </Link>
              </div>
            </div>
          ) : null}
          {businessApproved && workflowStatus === 'Approved — Awaiting Assignment' ? (
            <div className="rounded-lg border border-of-border bg-of-canvas/40 px-4 py-3 text-sm text-of-ink-secondary">
              Business estimate approved. Awaiting project manager resource
              assignment.
            </div>
          ) : null}
        </>
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
