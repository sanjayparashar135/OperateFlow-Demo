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

export interface TimelineEvent {
  id: string
  requestId: string
  timestamp: string
  title: string
  detail: string
  source: EvidenceSource
  category: TimelineEventCategory
}

/** Atomic post-submit simulation snapshot for REQ1235. */
export interface SubmittedSimulationBundle {
  mainRequest: DeliveryRequest
  requirements: StructuredRequirements
  linkedRecords: LinkedRecord[]
  timelineEvents: TimelineEvent[]
  activityEntries: ActivityEntry[]
}

export const MAIN_REQUEST_ID = 'REQ1235'
export const MAIN_JIRA_ID = 'JIRA-122345'
export const SIMULATION_STORAGE_KEY = 'operateflow.simulation.v1'
export const SIMULATION_STORAGE_VERSION = 1 as const

export interface PersistedSimulationV1 {
  version: typeof SIMULATION_STORAGE_VERSION
  bundle: SubmittedSimulationBundle
}
