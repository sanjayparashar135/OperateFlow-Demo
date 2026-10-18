import type {
  ActivityEntry,
  DeliveryRequest,
  Priority,
} from './delivery'
import type { PersonaId } from './persona'

export type EvidenceSource = 'system' | 'human' | 'ai_suggested'

export type RequirementsConfirmationState = 'ai_draft' | 'human_confirmed'

export interface StructuredRequirements {
  title: string
  category: string
  application: string
  highValueThreshold: string
  approverRole: string
  activationConstraint: string
  pendingRejectedBehavior: string
  businessObjective: string
  acceptanceCriteria: string[]
  requesterId: PersonaId
  priority: Priority
  confirmationState: RequirementsConfirmationState
}

export interface LinkedRecord {
  system: 'ServiceNow' | 'Jira'
  id: string
  label: string
  detail: string
}

export type TimelineEventCategory =
  | 'intake'
  | 'integration'
  | 'review'
  | 'assignment'
  | 'estimation'
  | 'follow_up'
  | 'communication'

export type CollaborationChannelId = 'teams' | 'slack'

export type DiagnosticDirectionId =
  | 'regional_timeout'
  | 'callback_persistence'
  | 'integration_dependency'

export type TroubleshootingDecisionState = 'pending' | 'recorded'

export interface DeveloperTroubleshootingDecision {
  decisionState: TroubleshootingDecisionState
  selectedDirectionId: DiagnosticDirectionId | null
  progressNote: string | null
  needsIntegrationAssist: boolean
  recordedById: PersonaId | null
  recordedAt: string | null
}

export type CoordinationActionId =
  | 'coordinate_investigation'
  | 'assess_target_impact'
  | 'update_business_owner'
  | 'arrange_focused_discussion'

export interface CoordinationDecision {
  selectedActionIds: CoordinationActionId[]
  selectedById: PersonaId | null
  selectedAt: string | null
}

export type StakeholderCommunicationDecisionState =
  | 'pending_review'
  | 'confirmed'

export interface StakeholderCommunicationDecision {
  decisionState: StakeholderCommunicationDecisionState
  /** Human-edited message; null until Radhe confirms. */
  confirmedMessage: string | null
  recipientId: PersonaId | null
  confirmedById: PersonaId | null
  confirmedAt: string | null
  nextUpdateNote: string | null
  channelId: CollaborationChannelId | null
}

/** Human decisions for AI-assisted blocker resolution on REQ1235. */
export interface BlockerResolutionRecord {
  troubleshooting: DeveloperTroubleshootingDecision
  coordination: CoordinationDecision
  stakeholderCommunication: StakeholderCommunicationDecision
}

export interface TimelineEvent {
  id: string
  requestId: string
  timestamp: string
  title: string
  detail: string
  source: EvidenceSource
  category: TimelineEventCategory
}

/** Business estimate approval by the requester (John). */
export interface ApprovalRecord {
  approvedById: PersonaId
  approvedAt: string
}

/** Resource assignment by the project manager (Radhe). */
export interface AssignmentRecord {
  assignedById: PersonaId
  assignedAt: string
  assignedDeveloperId: PersonaId
}

export interface ExecutionState {
  reportedProgressPercent: number
  lastDeveloperUpdateDate: string
}

export type FollowUpResponseKind =
  | 'on_track'
  | 'blocked'
  | 'completed'
  | 'other'

export type FollowUpStatus = 'open' | 'responded'

export interface FollowUpRecord {
  id: string
  status: FollowUpStatus
  triggeredAt: string
  message: string
  /** Channel used when the follow-up was opened (presentation metadata). */
  channelId: CollaborationChannelId
  responseKind: FollowUpResponseKind | null
  responseDetail: string | null
  respondedAt: string | null
}

export interface HistoricalComparable {
  jiraId: string
  title: string
  historicalEffortHours: number
  relevance: string
}

export interface EffortBreakdownItem {
  component: string
  hours: number
}

export interface EstimationSuggestion {
  suggestedHours: number
  rangeMin: number
  rangeMax: number
  breakdown: EffortBreakdownItem[]
  comparables: HistoricalComparable[]
  rationale: string
  defaultApproach: string
}

export type EstimationDecisionState = 'pending_review' | 'confirmed'

export type EstimationMode = 'accepted' | 'overridden'

/** Human decision persisted with the submitted REQ1235 bundle. */
export interface EstimationDecision {
  decisionState: EstimationDecisionState
  mode: EstimationMode | null
  confirmedHours: number | null
  overrideJustification: string | null
  confirmedApproach: string | null
  decidedById: PersonaId | null
  decidedAt: string | null
}

/** Atomic post-submit simulation snapshot for REQ1235. */
export interface SubmittedSimulationBundle {
  mainRequest: DeliveryRequest
  requirements: StructuredRequirements
  linkedRecords: LinkedRecord[]
  timelineEvents: TimelineEvent[]
  activityEntries: ActivityEntry[]
  /** Optional for Build 3 session hydration; defaults to pending review. */
  estimation?: EstimationDecision
  /** Optional; set when John approves the business estimate. */
  approval?: ApprovalRecord
  /** Optional; set when Radhe assigns the developer. */
  assignment?: AssignmentRecord
  /** Optional; set on resource assignment into Execution. */
  execution?: ExecutionState
  /** Optional; created by deadline trigger. */
  followUp?: FollowUpRecord
  /** Optional; Build 6 blocker resolution human decisions. */
  blockerResolution?: BlockerResolutionRecord
}

export const MAIN_REQUEST_ID = 'REQ1235'
export const MAIN_JIRA_ID = 'JIRA-122345'
export const SIMULATION_STORAGE_KEY = 'operateflow.simulation.v1'
export const SIMULATION_STORAGE_VERSION = 1 as const

export interface PersistedSimulationV1 {
  version: typeof SIMULATION_STORAGE_VERSION
  bundle: SubmittedSimulationBundle
  /** Optional for Build 3/4 hydration; defaults to baseline Oct 17. */
  simulatedToday?: string
}
