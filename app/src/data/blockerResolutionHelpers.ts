import type { PersonaId } from '../types/persona'
import type {
  BlockerResolutionRecord,
  CollaborationChannelId,
  CoordinationActionId,
  DiagnosticDirectionId,
  SubmittedSimulationBundle,
} from '../types/simulation'
import { MAIN_REQUEST_ID } from '../types/simulation'
import {
  getCoordinationActionLabels,
  STAKEHOLDER_RECIPIENT_ID,
} from './blockerCoordinationDataset'
import {
  canConfirmStakeholderCommunication,
  canRecordTroubleshooting,
  canSelectCoordinationActions,
} from './capabilities'
import { isCollaborationChannelId } from './collaborationChannel'
import { getDiagnosticDirection } from './blockerTroubleshootingDataset'
import { BLOCKED_TECHNICAL_DETAIL } from './followUpDataset'

export const TROUBLESHOOTING_TIMELINE_EVENT_ID = 'tl-req1235-11'
export const TROUBLESHOOTING_ACTIVITY_ID = 'act-req1235-08'
export const STAKEHOLDER_TIMELINE_EVENT_ID = 'tl-req1235-12'
export const STAKEHOLDER_ACTIVITY_ID = 'act-req1235-09'

const DIAGNOSTIC_DIRECTION_IDS: DiagnosticDirectionId[] = [
  'regional_timeout',
  'callback_persistence',
  'integration_dependency',
]

const COORDINATION_ACTION_IDS: CoordinationActionId[] = [
  'coordinate_investigation',
  'assess_target_impact',
  'update_business_owner',
  'arrange_focused_discussion',
]

export function getDefaultBlockerResolution(): BlockerResolutionRecord {
  return {
    troubleshooting: {
      decisionState: 'pending',
      selectedDirectionId: null,
      progressNote: null,
      needsIntegrationAssist: false,
      recordedById: null,
      recordedAt: null,
    },
    coordination: {
      selectedActionIds: [],
      selectedById: null,
      selectedAt: null,
    },
    stakeholderCommunication: {
      decisionState: 'pending_review',
      confirmedMessage: null,
      recipientId: null,
      confirmedById: null,
      confirmedAt: null,
      nextUpdateNote: null,
      channelId: null,
    },
  }
}

function isDiagnosticDirectionId(value: unknown): value is DiagnosticDirectionId {
  return (
    typeof value === 'string' &&
    DIAGNOSTIC_DIRECTION_IDS.includes(value as DiagnosticDirectionId)
  )
}

function isCoordinationActionId(value: unknown): value is CoordinationActionId {
  return (
    typeof value === 'string' &&
    COORDINATION_ACTION_IDS.includes(value as CoordinationActionId)
  )
}

/** Hydrate missing Build 3–5 payloads without inventing timeline events. */
export function hydrateBlockerResolution(
  record: BlockerResolutionRecord | undefined,
): BlockerResolutionRecord {
  const defaults = getDefaultBlockerResolution()
  if (!record) return defaults

  const directionId = record.troubleshooting?.selectedDirectionId
  const selectedActionIds = Array.isArray(record.coordination?.selectedActionIds)
    ? record.coordination.selectedActionIds.filter(isCoordinationActionId)
    : []

  const channelId = record.stakeholderCommunication?.channelId

  return {
    troubleshooting: {
      decisionState:
        record.troubleshooting?.decisionState === 'recorded'
          ? 'recorded'
          : 'pending',
      selectedDirectionId: isDiagnosticDirectionId(directionId)
        ? directionId
        : null,
      progressNote:
        typeof record.troubleshooting?.progressNote === 'string'
          ? record.troubleshooting.progressNote
          : null,
      needsIntegrationAssist: Boolean(
        record.troubleshooting?.needsIntegrationAssist,
      ),
      recordedById: record.troubleshooting?.recordedById ?? null,
      recordedAt: record.troubleshooting?.recordedAt ?? null,
    },
    coordination: {
      selectedActionIds,
      selectedById: record.coordination?.selectedById ?? null,
      selectedAt: record.coordination?.selectedAt ?? null,
    },
    stakeholderCommunication: {
      decisionState:
        record.stakeholderCommunication?.decisionState === 'confirmed'
          ? 'confirmed'
          : 'pending_review',
      confirmedMessage:
        typeof record.stakeholderCommunication?.confirmedMessage === 'string'
          ? record.stakeholderCommunication.confirmedMessage
          : null,
      recipientId: record.stakeholderCommunication?.recipientId ?? null,
      confirmedById: record.stakeholderCommunication?.confirmedById ?? null,
      confirmedAt: record.stakeholderCommunication?.confirmedAt ?? null,
      nextUpdateNote:
        typeof record.stakeholderCommunication?.nextUpdateNote === 'string'
          ? record.stakeholderCommunication.nextUpdateNote
          : null,
      channelId: isCollaborationChannelId(channelId) ? channelId : null,
    },
  }
}

export function isMainRequestBlocked(
  bundle: SubmittedSimulationBundle,
): boolean {
  return (
    bundle.followUp?.responseKind === 'blocked' &&
    bundle.mainRequest.workflowStatus === 'Blocked'
  )
}

export interface RecordTroubleshootingInput {
  directionId: DiagnosticDirectionId
  progressNote: string
  needsIntegrationAssist: boolean
  recordedById: PersonaId
  referenceDate: string
}

export type ApplyBlockerResult =
  | { ok: true; bundle: SubmittedSimulationBundle }
  | { ok: false; reason: string }

export function applyTroubleshootingProgress(
  bundle: SubmittedSimulationBundle,
  input: RecordTroubleshootingInput,
): ApplyBlockerResult {
  if (!canRecordTroubleshooting(input.recordedById)) {
    return {
      ok: false,
      reason: 'Only Ajay Raj may record troubleshooting progress.',
    }
  }
  if (!isMainRequestBlocked(bundle)) {
    return { ok: false, reason: 'REQ1235 is not in a blocked state.' }
  }
  if (bundle.followUp?.responseDetail !== BLOCKED_TECHNICAL_DETAIL) {
    return { ok: false, reason: 'Original blocker evidence is missing or altered.' }
  }

  const current = hydrateBlockerResolution(bundle.blockerResolution)
  if (current.troubleshooting.decisionState === 'recorded') {
    return { ok: false, reason: 'Troubleshooting progress already recorded.' }
  }
  if (
    bundle.timelineEvents.some(
      (event) => event.id === TROUBLESHOOTING_TIMELINE_EVENT_ID,
    )
  ) {
    return { ok: false, reason: 'Troubleshooting progress already recorded.' }
  }

  if (!isDiagnosticDirectionId(input.directionId)) {
    return { ok: false, reason: 'Select a valid diagnostic direction.' }
  }
  const note = input.progressNote.trim()
  if (!note) {
    return { ok: false, reason: 'A short progress note is required.' }
  }

  const direction = getDiagnosticDirection(input.directionId)
  const recordedAt = `${input.referenceDate}T11:00:00`
  const next: BlockerResolutionRecord = {
    ...current,
    troubleshooting: {
      decisionState: 'recorded',
      selectedDirectionId: input.directionId,
      progressNote: note,
      needsIntegrationAssist: input.needsIntegrationAssist,
      recordedById: input.recordedById,
      recordedAt,
    },
  }

  const assistClause = input.needsIntegrationAssist
    ? ' Integration Lead assistance flagged as potentially needed.'
    : ''

  return {
    ok: true,
    bundle: {
      ...bundle,
      blockerResolution: next,
      mainRequest: {
        ...bundle.mainRequest,
        lastUpdated: input.referenceDate,
      },
      timelineEvents: [
        ...bundle.timelineEvents,
        {
          id: TROUBLESHOOTING_TIMELINE_EVENT_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: recordedAt,
          title: 'Developer troubleshooting progress recorded',
          detail:
            `Ajay Raj selected diagnostic direction "${direction?.title ?? input.directionId}" ` +
            `and recorded: ${note}.${assistClause}`,
          source: 'human',
          category: 'follow_up',
        },
      ],
      activityEntries: [
        ...bundle.activityEntries,
        {
          id: TROUBLESHOOTING_ACTIVITY_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: recordedAt,
          actor: 'Ajay Raj',
          category: 'risk',
          message: `${MAIN_REQUEST_ID}: troubleshooting progress recorded (${direction?.title ?? input.directionId}).`,
        },
      ],
    },
  }
}

export interface SelectCoordinationInput {
  actionIds: CoordinationActionId[]
  selectedById: PersonaId
  referenceDate: string
}

export function applyCoordinationSelection(
  bundle: SubmittedSimulationBundle,
  input: SelectCoordinationInput,
): ApplyBlockerResult {
  if (!canSelectCoordinationActions(input.selectedById)) {
    return {
      ok: false,
      reason: 'Only Radhe Shyam may select coordination actions.',
    }
  }
  if (!isMainRequestBlocked(bundle)) {
    return { ok: false, reason: 'REQ1235 is not in a blocked state.' }
  }

  const current = hydrateBlockerResolution(bundle.blockerResolution)
  if (current.stakeholderCommunication.decisionState === 'confirmed') {
    return {
      ok: false,
      reason: 'Coordination actions are locked after stakeholder confirmation.',
    }
  }

  const uniqueIds = [
    ...new Set(input.actionIds.filter(isCoordinationActionId)),
  ]
  if (uniqueIds.length === 0) {
    return { ok: false, reason: 'Select at least one coordination action.' }
  }

  const selectedAt = `${input.referenceDate}T11:10:00`
  const next: BlockerResolutionRecord = {
    ...current,
    coordination: {
      selectedActionIds: uniqueIds,
      selectedById: input.selectedById,
      selectedAt,
    },
  }

  // Planned actions persist in shared state for the delivery-risk UI.
  // Timeline/activity events are reserved for troubleshooting and confirmed communication.
  return {
    ok: true,
    bundle: {
      ...bundle,
      blockerResolution: next,
      mainRequest: {
        ...bundle.mainRequest,
        lastUpdated: input.referenceDate,
      },
    },
  }
}

export interface ConfirmStakeholderInput {
  message: string
  recipientId: PersonaId
  nextUpdateNote: string | null
  channelId: CollaborationChannelId
  confirmedById: PersonaId
  referenceDate: string
  /** Coordination actions to retain if not already persisted. */
  actionIds?: CoordinationActionId[]
}

export function applyStakeholderCommunication(
  bundle: SubmittedSimulationBundle,
  input: ConfirmStakeholderInput,
): ApplyBlockerResult {
  if (!canConfirmStakeholderCommunication(input.confirmedById)) {
    return {
      ok: false,
      reason: 'Only Radhe Shyam may confirm stakeholder communication.',
    }
  }
  if (!isMainRequestBlocked(bundle)) {
    return { ok: false, reason: 'REQ1235 is not in a blocked state.' }
  }
  if (bundle.followUp?.responseDetail !== BLOCKED_TECHNICAL_DETAIL) {
    return { ok: false, reason: 'Original blocker evidence is missing or altered.' }
  }

  const current = hydrateBlockerResolution(bundle.blockerResolution)
  if (current.stakeholderCommunication.decisionState === 'confirmed') {
    return { ok: false, reason: 'Stakeholder communication already confirmed.' }
  }
  if (
    bundle.timelineEvents.some(
      (event) => event.id === STAKEHOLDER_TIMELINE_EVENT_ID,
    )
  ) {
    return { ok: false, reason: 'Stakeholder communication already confirmed.' }
  }

  const message = input.message.trim()
  if (!message) {
    return { ok: false, reason: 'Stakeholder update message is required.' }
  }
  if (input.recipientId !== STAKEHOLDER_RECIPIENT_ID) {
    return {
      ok: false,
      reason: 'John Harrison must be the business recipient.',
    }
  }

  let coordination = current.coordination
  if (input.actionIds && input.actionIds.length > 0) {
    const uniqueIds = [
      ...new Set(input.actionIds.filter(isCoordinationActionId)),
    ]
    if (uniqueIds.length > 0) {
      coordination = {
        selectedActionIds: uniqueIds,
        selectedById: input.confirmedById,
        selectedAt: `${input.referenceDate}T11:10:00`,
      }
    }
  }

  if (coordination.selectedActionIds.length === 0) {
    return {
      ok: false,
      reason: 'Select at least one planned coordination action before confirming.',
    }
  }

  const confirmedAt = `${input.referenceDate}T11:15:00`
  const nextUpdate =
    input.nextUpdateNote?.trim() ? input.nextUpdateNote.trim() : null
  const labels = getCoordinationActionLabels(coordination.selectedActionIds)

  const next: BlockerResolutionRecord = {
    troubleshooting: current.troubleshooting,
    coordination,
    stakeholderCommunication: {
      decisionState: 'confirmed',
      confirmedMessage: message,
      recipientId: input.recipientId,
      confirmedById: input.confirmedById,
      confirmedAt,
      nextUpdateNote: nextUpdate,
      channelId: input.channelId,
    },
  }

  const nextUpdateClause = nextUpdate
    ? ` Next update commitment: ${nextUpdate}.`
    : ''

  return {
    ok: true,
    bundle: {
      ...bundle,
      blockerResolution: next,
      mainRequest: {
        ...bundle.mainRequest,
        lifecycleStage: 'Execution',
        workflowStatus: 'Blocked',
        deliveryHealth: 'At Risk',
        lastUpdated: input.referenceDate,
        attentionReasons: [
          'Business owner notified; October 23 target under assessment',
        ],
      },
      timelineEvents: [
        ...bundle.timelineEvents,
        {
          id: STAKEHOLDER_TIMELINE_EVENT_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: confirmedAt,
          title: 'Stakeholder communication confirmed',
          detail:
            `Radhe Shyam confirmed a business update for John Harrison. ` +
            `Planned coordination: ${labels.join('; ')}.${nextUpdateClause}`,
          source: 'human',
          category: 'communication',
        },
      ],
      activityEntries: [
        ...bundle.activityEntries,
        {
          id: STAKEHOLDER_ACTIVITY_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: confirmedAt,
          actor: 'Radhe Shyam',
          category: 'risk',
          message: `${MAIN_REQUEST_ID}: stakeholder update confirmed for John Harrison.`,
        },
      ],
    },
  }
}

/** Confirmed message visible to John; null when unapproved. */
export function getConfirmedStakeholderMessage(
  record: BlockerResolutionRecord | undefined,
): string | null {
  const hydrated = hydrateBlockerResolution(record)
  if (hydrated.stakeholderCommunication.decisionState !== 'confirmed') {
    return null
  }
  return hydrated.stakeholderCommunication.confirmedMessage
}
