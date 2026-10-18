import type {
  EstimationDecision,
  EstimationMode,
  SubmittedSimulationBundle,
} from '../types/simulation'
import { MAIN_REQUEST_ID } from '../types/simulation'
import type { PersonaId } from '../types/persona'
import {
  ESTIMATION_ACTIVITY_ID,
  ESTIMATION_CONFIRMED_ATTENTION,
  ESTIMATION_SUGGESTION,
  ESTIMATION_TIMELINE_EVENT_ID,
} from './estimationDataset'
import { getSimulatedToday } from './simDate'

export interface ConfirmEstimationInput {
  mode: EstimationMode
  /** Required when mode is overridden; ignored when accepted. */
  confirmedHours?: number
  overrideJustification?: string
  confirmedApproach: string
  decidedById: PersonaId
  referenceDate: string
}

/** Maps UI form values onto the simulation confirm payload. */
export function buildConfirmEstimationInput(
  form: {
    mode: EstimationMode
    confirmedHours?: number
    overrideJustification?: string
    confirmedApproach: string
  },
  decidedById: PersonaId,
  referenceDate: string = getSimulatedToday(),
): ConfirmEstimationInput {
  return {
    mode: form.mode,
    confirmedHours: form.confirmedHours,
    overrideJustification: form.overrideJustification,
    confirmedApproach: form.confirmedApproach,
    decidedById,
    referenceDate,
  }
}

export type ConfirmEstimationResult =
  | { ok: true; bundle: SubmittedSimulationBundle }
  | { ok: false; reason: string }

export function getDefaultEstimationDecision(): EstimationDecision {
  return {
    decisionState: 'pending_review',
    mode: null,
    confirmedHours: null,
    overrideJustification: null,
    confirmedApproach: null,
    decidedById: null,
    decidedAt: null,
  }
}

/** Hydrate missing estimation from Build 3 sessionStorage payloads. */
export function hydrateEstimationDecision(
  decision: EstimationDecision | undefined,
): EstimationDecision {
  if (!decision) return getDefaultEstimationDecision()
  return {
    decisionState: decision.decisionState ?? 'pending_review',
    mode: decision.mode ?? null,
    confirmedHours:
      typeof decision.confirmedHours === 'number'
        ? decision.confirmedHours
        : null,
    overrideJustification: decision.overrideJustification ?? null,
    confirmedApproach: decision.confirmedApproach ?? null,
    decidedById: decision.decidedById ?? null,
    decidedAt: decision.decidedAt ?? null,
  }
}

export function isEstimationConfirmed(
  decision: EstimationDecision | undefined,
): boolean {
  return hydrateEstimationDecision(decision).decisionState === 'confirmed'
}

function normalizeApproach(value: string): string {
  return value.trim()
}

function isValidHours(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function validateConfirmEstimationInput(
  input: ConfirmEstimationInput,
): string | null {
  const approach = normalizeApproach(input.confirmedApproach)
  if (!approach) {
    return 'Delivery approach is required.'
  }

  if (input.mode === 'accepted') {
    return null
  }

  if (!isValidHours(input.confirmedHours)) {
    return 'Override requires a valid revised hour total.'
  }

  if (!input.overrideJustification?.trim()) {
    return 'Override requires a justification.'
  }

  return null
}

/**
 * Applies a human estimation confirmation to the submitted bundle.
 * Idempotent: repeated confirms with an existing estimation event return false.
 */
export function applyEstimationConfirmation(
  bundle: SubmittedSimulationBundle,
  input: ConfirmEstimationInput,
): ConfirmEstimationResult {
  const estimation = hydrateEstimationDecision(bundle.estimation)

  if (estimation.decisionState === 'confirmed') {
    return { ok: false, reason: 'Estimation already confirmed.' }
  }

  if (
    bundle.timelineEvents.some(
      (event) => event.id === ESTIMATION_TIMELINE_EVENT_ID,
    )
  ) {
    return { ok: false, reason: 'Estimation already confirmed.' }
  }

  const validationError = validateConfirmEstimationInput(input)
  if (validationError) {
    return { ok: false, reason: validationError }
  }

  const approach = normalizeApproach(input.confirmedApproach)
  const confirmedHours =
    input.mode === 'accepted'
      ? ESTIMATION_SUGGESTION.suggestedHours
      : (input.confirmedHours as number)
  const justification =
    input.mode === 'overridden'
      ? (input.overrideJustification?.trim() ?? null)
      : null

  const decidedAt = `${input.referenceDate}T10:15:00`
  const modeLabel =
    input.mode === 'accepted' ? 'accepted the suggested' : 'overrode to'

  const nextDecision: EstimationDecision = {
    decisionState: 'confirmed',
    mode: input.mode,
    confirmedHours,
    overrideJustification: justification,
    confirmedApproach: approach,
    decidedById: input.decidedById,
    decidedAt,
  }

  const timelineEvent = {
    id: ESTIMATION_TIMELINE_EVENT_ID,
    requestId: MAIN_REQUEST_ID,
    timestamp: decidedAt,
    title: 'Technical estimate confirmed',
    detail:
      input.mode === 'accepted'
        ? `Sanjay Parashar confirmed the AI-assisted estimate of ${confirmedHours} hours. Awaiting business approval.`
        : `Sanjay Parashar overrode the suggested ${ESTIMATION_SUGGESTION.suggestedHours}-hour estimate to ${confirmedHours} hours. Justification: ${justification}. Awaiting business approval.`,
    source: 'human' as const,
    category: 'estimation' as const,
  }

  const activityEntry = {
    id: ESTIMATION_ACTIVITY_ID,
    requestId: MAIN_REQUEST_ID,
    timestamp: decidedAt,
    actor: 'Sanjay Parashar',
    category: 'review' as const,
    message: `${MAIN_REQUEST_ID}: technical estimate ${modeLabel} ${confirmedHours} hours. Awaiting business approval.`,
  }

  return {
    ok: true,
    bundle: {
      ...bundle,
      mainRequest: {
        ...bundle.mainRequest,
        workflowStatus: 'Pending Approval',
        lifecycleStage: 'Approval & Planning',
        deliveryHealth: 'On Track',
        primaryOwnerId: 'sanjay-parashar',
        lastUpdated: input.referenceDate,
        attentionReasons: [ESTIMATION_CONFIRMED_ATTENTION],
        parties: {
          ...bundle.mainRequest.parties,
          developerId: undefined,
        },
      },
      estimation: nextDecision,
      timelineEvents: [...bundle.timelineEvents, timelineEvent],
      activityEntries: [...bundle.activityEntries, activityEntry],
    },
  }
}
