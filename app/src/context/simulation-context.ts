import { createContext } from 'react'
import type {
  ConfirmStakeholderInput,
  RecordTroubleshootingInput,
  SelectCoordinationInput,
} from '../data/blockerResolutionHelpers'
import type { ConfirmEstimationInput } from '../data/estimationHelpers'
import type { FollowUpResponseInput } from '../data/followUpHelpers'
import type { ActivityEntry, DeliveryRequest } from '../types/delivery'
import type { PersonaId } from '../types/persona'
import type {
  ApprovalRecord,
  AssignmentRecord,
  BlockerResolutionRecord,
  CollaborationChannelId,
  EstimationDecision,
  ExecutionState,
  FollowUpRecord,
  LinkedRecord,
  StructuredRequirements,
  SubmittedSimulationBundle,
  TimelineEvent,
} from '../types/simulation'

export interface RequestBundle {
  request: DeliveryRequest
  requirements: StructuredRequirements
  linkedRecords: LinkedRecord[]
  timelineEvents: TimelineEvent[]
  estimation: EstimationDecision
  approval: ApprovalRecord | undefined
  assignment: AssignmentRecord | undefined
  execution: ExecutionState | undefined
  followUp: FollowUpRecord | undefined
  blockerResolution: BlockerResolutionRecord
}

export interface SimulationContextValue {
  /** Seed portfolio plus submitted main request when present. */
  requests: DeliveryRequest[]
  /** Seed activity plus post-submit intake activity. */
  activity: ActivityEntry[]
  hasMainRequest: boolean
  mainRequestId: string | null
  /** Authoritative simulated calendar date for the active demo session. */
  simulatedToday: string
  /** Presentation-only client collaboration channel (Teams default). */
  collaborationChannelId: CollaborationChannelId
  setCollaborationChannelId: (id: CollaborationChannelId) => void
  getRequestBundle: (id: string) => RequestBundle | null
  /**
   * Atomically persist the submitted bundle. Returns false if REQ1235
   * already exists (duplicate protection).
   */
  submitIntake: (requirements: StructuredRequirements) => boolean
  /**
   * Confirm or override the technical estimate. Returns false when the
   * bundle is missing, already confirmed, or input is invalid.
   */
  confirmEstimation: (input: ConfirmEstimationInput) => boolean
  /** John approves the business estimate. */
  approveBusinessEstimate: (approvedById: PersonaId) => boolean
  /** Radhe assigns Ajay and moves the request into Execution. */
  assignResources: (assignedById: PersonaId) => boolean
  /**
   * Presenter advance from baseline to October 21. Creates the
   * collaboration follow-up when trigger rules match.
   */
  advanceSimulatedDate: () => boolean
  /**
   * Ajay responds to the open follow-up. Returns false when invalid.
   */
  respondToFollowUp: (input: FollowUpResponseInput) => boolean
  /** Ajay records AI-assisted troubleshooting progress on the blocker. */
  recordTroubleshootingProgress: (
    input: RecordTroubleshootingInput,
  ) => boolean
  /** Radhe selects planned coordination actions. */
  selectCoordinationActions: (input: SelectCoordinationInput) => boolean
  /** Radhe confirms business-facing stakeholder communication. */
  confirmStakeholderCommunication: (input: ConfirmStakeholderInput) => boolean
  resetDemo: () => void
  /** Exposed for tests / validation helpers. */
  bundle: SubmittedSimulationBundle | null
}

export const SimulationContext = createContext<SimulationContextValue | null>(
  null,
)
