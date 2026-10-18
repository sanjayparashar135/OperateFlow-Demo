import type {
  ApprovalRecord,
  AssignmentRecord,
  EstimationDecision,
  ExecutionState,
  SubmittedSimulationBundle,
} from '../types/simulation'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../types/simulation'
import type { PersonaId } from '../types/persona'
import { hydrateEstimationDecision, isEstimationConfirmed } from './estimationHelpers'

export const APPROVAL_TIMELINE_EVENT_ID = 'tl-req1235-07'
export const ASSIGNMENT_TIMELINE_EVENT_ID = 'tl-req1235-08'
export const APPROVAL_ACTIVITY_ID = 'act-req1235-04'
export const ASSIGNMENT_ACTIVITY_ID = 'act-req1235-05'

export const ASSIGNED_DEVELOPER_ID: PersonaId = 'ajay-raj'
export const ASSIGNMENT_OWNER_ID: PersonaId = 'radhe-shyam'
export const BUSINESS_APPROVER_ID: PersonaId = 'john-harrison'

export const DEFAULT_EXECUTION_STATE: ExecutionState = {
  reportedProgressPercent: 60,
  lastDeveloperUpdateDate: '2026-10-19',
}

export type ApplyTransitionResult =
  | { ok: true; bundle: SubmittedSimulationBundle }
  | { ok: false; reason: string }

/** Normalize ApprovalRecord; strips legacy assignedDeveloperId without inventing events. */
export function hydrateApprovalRecord(
  approval: ApprovalRecord | (ApprovalRecord & { assignedDeveloperId?: PersonaId }) | undefined,
): ApprovalRecord | undefined {
  if (!approval) return undefined
  if (typeof approval.approvedById !== 'string' || typeof approval.approvedAt !== 'string') {
    return undefined
  }
  return {
    approvedById: approval.approvedById,
    approvedAt: approval.approvedAt,
  }
}

/**
 * Hydrate assignment from explicit record, or from legacy combined Build 5
 * approval that already moved the request into Execution.
 */
export function hydrateAssignmentRecord(
  bundle: Pick<
    SubmittedSimulationBundle,
    'assignment' | 'approval' | 'execution' | 'mainRequest'
  >,
): AssignmentRecord | undefined {
  if (bundle.assignment) {
    return bundle.assignment
  }

  const legacy = bundle.approval as
    | (ApprovalRecord & { assignedDeveloperId?: PersonaId })
    | undefined
  const legacyDeveloper = legacy?.assignedDeveloperId
  const inExecution =
    bundle.mainRequest.lifecycleStage === 'Execution' &&
    Boolean(bundle.execution) &&
    bundle.mainRequest.parties.developerId === 'ajay-raj'

  if (legacyDeveloper && inExecution) {
    return {
      assignedById: ASSIGNMENT_OWNER_ID,
      assignedAt: legacy?.approvedAt ?? `${bundle.mainRequest.lastUpdated}T11:01:00`,
      assignedDeveloperId: legacyDeveloper,
    }
  }

  return undefined
}

export function canApplyBusinessApproval(
  bundle: SubmittedSimulationBundle,
): string | null {
  const estimation = hydrateEstimationDecision(bundle.estimation)
  if (!isEstimationConfirmed(estimation)) {
    return 'Technical estimate must be confirmed before business approval.'
  }
  if (bundle.mainRequest.workflowStatus !== 'Pending Approval') {
    return 'Request must be Pending Approval before business approval.'
  }
  if (bundle.mainRequest.lifecycleStage !== 'Approval & Planning') {
    return 'Request must remain in Approval & Planning before business approval.'
  }
  const approval = hydrateApprovalRecord(bundle.approval)
  if (
    approval ||
    bundle.timelineEvents.some((event) => event.id === APPROVAL_TIMELINE_EVENT_ID)
  ) {
    return 'Business estimate already approved.'
  }
  return null
}

export function canApplyResourceAssignment(
  bundle: SubmittedSimulationBundle,
): string | null {
  const approval = hydrateApprovalRecord(bundle.approval)
  if (!approval) {
    return 'Business estimate must be approved before resource assignment.'
  }
  if (bundle.mainRequest.workflowStatus !== 'Approved — Awaiting Assignment') {
    return 'Request must be Approved — Awaiting Assignment before resource assignment.'
  }
  if (bundle.mainRequest.lifecycleStage !== 'Approval & Planning') {
    return 'Request must remain in Approval & Planning before resource assignment.'
  }
  const assignment = hydrateAssignmentRecord(bundle)
  if (
    assignment ||
    bundle.timelineEvents.some((event) => event.id === ASSIGNMENT_TIMELINE_EVENT_ID)
  ) {
    return 'Developer already assigned.'
  }
  return null
}

export function applyBusinessApproval(
  bundle: SubmittedSimulationBundle,
  approvedById: PersonaId,
  referenceDate: string,
): ApplyTransitionResult {
  if (approvedById !== BUSINESS_APPROVER_ID) {
    return { ok: false, reason: 'Only John Harrison may approve the business estimate.' }
  }
  const blocked = canApplyBusinessApproval(bundle)
  if (blocked) {
    return { ok: false, reason: blocked }
  }

  const estimation = hydrateEstimationDecision(bundle.estimation)
  const approvedAt = `${referenceDate}T10:45:00`
  const hours = estimation.confirmedHours ?? 56

  const approval: ApprovalRecord = {
    approvedById,
    approvedAt,
  }

  return {
    ok: true,
    bundle: {
      ...bundle,
      approval,
      mainRequest: {
        ...bundle.mainRequest,
        lifecycleStage: 'Approval & Planning',
        workflowStatus: 'Approved — Awaiting Assignment',
        deliveryHealth: 'On Track',
        lastUpdated: referenceDate,
        attentionReasons: [
          'Business estimate approved. Awaiting project manager resource assignment.',
        ],
      },
      timelineEvents: [
        ...bundle.timelineEvents,
        {
          id: APPROVAL_TIMELINE_EVENT_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: approvedAt,
          title: 'Business estimate approved',
          detail: `John Harrison approved the confirmed technical estimate of ${hours} hours and delivery approach for ${MAIN_REQUEST_ID}. Awaiting resource assignment.`,
          source: 'human',
          category: 'review',
        },
      ],
      activityEntries: [
        ...bundle.activityEntries,
        {
          id: APPROVAL_ACTIVITY_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: approvedAt,
          actor: 'John Harrison',
          category: 'review',
          message: `${MAIN_REQUEST_ID} business estimate approved; awaiting resource assignment.`,
        },
      ],
    },
  }
}

export function applyResourceAssignment(
  bundle: SubmittedSimulationBundle,
  assignedById: PersonaId,
  referenceDate: string,
): ApplyTransitionResult {
  if (assignedById !== ASSIGNMENT_OWNER_ID) {
    return { ok: false, reason: 'Only Radhe Shyam may assign delivery resources.' }
  }
  const blocked = canApplyResourceAssignment(bundle)
  if (blocked) {
    return { ok: false, reason: blocked }
  }

  const assignedAt = `${referenceDate}T11:01:00`
  const assignment: AssignmentRecord = {
    assignedById,
    assignedAt,
    assignedDeveloperId: ASSIGNED_DEVELOPER_ID,
  }

  const linkedRecords = bundle.linkedRecords.map((record) => {
    if (record.id !== MAIN_JIRA_ID) return record
    return {
      ...record,
      detail:
        'Assigned to Ajay Raj in Application Delivery. Work is in progress toward the October 23 target.',
    }
  })

  return {
    ok: true,
    bundle: {
      ...bundle,
      approval: hydrateApprovalRecord(bundle.approval),
      assignment,
      execution: { ...DEFAULT_EXECUTION_STATE },
      linkedRecords,
      mainRequest: {
        ...bundle.mainRequest,
        lifecycleStage: 'Execution',
        workflowStatus: 'In Progress',
        deliveryHealth: 'On Track',
        primaryOwnerId: ASSIGNMENT_OWNER_ID,
        lastUpdated: referenceDate,
        attentionReasons: undefined,
        parties: {
          ...bundle.mainRequest.parties,
          requesterId: 'john-harrison',
          technicalLeadId: 'sanjay-parashar',
          developerId: ASSIGNED_DEVELOPER_ID,
        },
      },
      timelineEvents: [
        ...bundle.timelineEvents,
        {
          id: ASSIGNMENT_TIMELINE_EVENT_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: assignedAt,
          title: 'Developer assigned',
          detail: `Radhe Shyam assigned Ajay Raj to ${MAIN_JIRA_ID}. Request moved to Execution / In Progress. Target date remains 2026-10-23.`,
          source: 'human',
          category: 'assignment',
        },
      ],
      activityEntries: [
        ...bundle.activityEntries,
        {
          id: ASSIGNMENT_ACTIVITY_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: assignedAt,
          actor: 'Radhe Shyam',
          category: 'assignment',
          message: `${MAIN_JIRA_ID} assigned to Ajay Raj; ${MAIN_REQUEST_ID} moved to Execution.`,
        },
      ],
    },
  }
}

export function getConfirmedEstimateSummary(estimation: EstimationDecision): {
  hours: number
  modeLabel: string
  approach: string
  overrideJustification: string | null
} {
  const hydrated = hydrateEstimationDecision(estimation)
  return {
    hours: hydrated.confirmedHours ?? 56,
    modeLabel:
      hydrated.mode === 'overridden'
        ? 'Overridden estimate'
        : 'Accepted AI suggestion',
    approach:
      hydrated.confirmedApproach ??
      'Implement configurable approval routing and related onboarding controls.',
    overrideJustification: hydrated.overrideJustification,
  }
}
