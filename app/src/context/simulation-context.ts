import { createContext } from 'react'
import type { ConfirmEstimationInput } from '../data/estimationHelpers'
import type { ActivityEntry, DeliveryRequest } from '../types/delivery'
import type {
  EstimationDecision,
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
}

export interface SimulationContextValue {
  /** Seed portfolio plus submitted main request when present. */
  requests: DeliveryRequest[]
  /** Seed activity plus post-submit intake activity. */
  activity: ActivityEntry[]
  hasMainRequest: boolean
  mainRequestId: string | null
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
  resetDemo: () => void
  /** Exposed for tests / validation helpers. */
  bundle: SubmittedSimulationBundle | null
}

export const SimulationContext = createContext<SimulationContextValue | null>(
  null,
)
