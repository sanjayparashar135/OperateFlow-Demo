import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyBusinessApproval,
  applyResourceAssignment,
  hydrateApprovalRecord,
  hydrateAssignmentRecord,
} from '../data/approvalHelpers'
import {
  readStoredCollaborationChannel,
  writeStoredCollaborationChannel,
} from '../data/collaborationChannel'
import {
  applyEstimationConfirmation,
  hydrateEstimationDecision,
  type ConfirmEstimationInput,
} from '../data/estimationHelpers'
import {
  applyCoordinationSelection,
  applyStakeholderCommunication,
  applyTroubleshootingProgress,
  hydrateBlockerResolution,
  type ConfirmStakeholderInput,
  type RecordTroubleshootingInput,
  type SelectCoordinationInput,
} from '../data/blockerResolutionHelpers'
import {
  applyFollowUpResponse,
  applyFollowUpTrigger,
  hydrateFollowUp,
  type FollowUpResponseInput,
} from '../data/followUpHelpers'
import {
  applyMeetingConfirmation,
  hydrateMeeting,
  type ConfirmMeetingInput,
} from '../data/meetingHelpers'
import { createSubmittedMainRequestBundle } from '../data/mainRequestFactory'
import { PORTFOLIO_REQUESTS, RECENT_ACTIVITY } from '../data/portfolio'
import {
  SIMULATED_ADVANCE_DATE,
  SIMULATED_TODAY,
} from '../data/simDate'
import type { PersonaId } from '../types/persona'
import type {
  CollaborationChannelId,
  StructuredRequirements,
  SubmittedSimulationBundle,
} from '../types/simulation'
import {
  MAIN_REQUEST_ID,
  SIMULATION_STORAGE_KEY,
  SIMULATION_STORAGE_VERSION,
  type PersistedSimulationV1,
} from '../types/simulation'
import {
  SimulationContext,
  type RequestBundle,
  type SimulationContextValue,
} from './simulation-context'

interface StoredSimulation {
  bundle: SubmittedSimulationBundle | null
  simulatedToday: string
}

function isDeliveryRequestShape(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const request = value as Record<string, unknown>
  return (
    typeof request.id === 'string' &&
    typeof request.title === 'string' &&
    typeof request.application === 'string' &&
    typeof request.primaryOwnerId === 'string' &&
    typeof request.lifecycleStage === 'string' &&
    typeof request.workflowStatus === 'string' &&
    typeof request.deliveryHealth === 'string'
  )
}

function hydrateBundle(
  bundle: SubmittedSimulationBundle,
): SubmittedSimulationBundle {
  const approval = hydrateApprovalRecord(bundle.approval)
  const withApproval = { ...bundle, approval }
  return {
    ...withApproval,
    estimation: hydrateEstimationDecision(bundle.estimation),
    assignment: hydrateAssignmentRecord(withApproval),
    followUp: hydrateFollowUp(bundle.followUp),
    blockerResolution: hydrateBlockerResolution(bundle.blockerResolution),
    meeting: hydrateMeeting(bundle.meeting),
  }
}

function parsePersisted(raw: string): StoredSimulation | null {
  try {
    const parsed = JSON.parse(raw) as PersistedSimulationV1
    if (parsed.version !== SIMULATION_STORAGE_VERSION) return null
    const bundle = parsed.bundle
    if (!bundle || !isDeliveryRequestShape(bundle.mainRequest)) return null
    if (bundle.mainRequest.id !== MAIN_REQUEST_ID) return null
    if (!bundle.requirements || !Array.isArray(bundle.linkedRecords)) return null
    if (!Array.isArray(bundle.timelineEvents) || !Array.isArray(bundle.activityEntries)) {
      return null
    }
    const simulatedToday =
      typeof parsed.simulatedToday === 'string' && parsed.simulatedToday.length > 0
        ? parsed.simulatedToday
        : SIMULATED_TODAY
    return {
      bundle: hydrateBundle(bundle),
      simulatedToday,
    }
  } catch {
    return null
  }
}

function readStored(): StoredSimulation {
  try {
    const raw = sessionStorage.getItem(SIMULATION_STORAGE_KEY)
    if (!raw) {
      return { bundle: null, simulatedToday: SIMULATED_TODAY }
    }
    return parsePersisted(raw) ?? {
      bundle: null,
      simulatedToday: SIMULATED_TODAY,
    }
  } catch {
    return { bundle: null, simulatedToday: SIMULATED_TODAY }
  }
}

function writeStored(bundle: SubmittedSimulationBundle, simulatedToday: string): void {
  const payload: PersistedSimulationV1 = {
    version: SIMULATION_STORAGE_VERSION,
    bundle,
    simulatedToday,
  }
  sessionStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(payload))
}

function clearStored(): void {
  try {
    sessionStorage.removeItem(SIMULATION_STORAGE_KEY)
  } catch {
    // Ignore unavailable sessionStorage.
  }
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => readStored(), [])
  const [bundle, setBundle] = useState<SubmittedSimulationBundle | null>(
    () => initial.bundle,
  )
  const [simulatedToday, setSimulatedToday] = useState<string>(
    () => initial.simulatedToday,
  )
  const [collaborationChannelId, setCollaborationChannelIdState] =
    useState<CollaborationChannelId>(() => readStoredCollaborationChannel())

  useEffect(() => {
    try {
      if (bundle) {
        writeStored(bundle, simulatedToday)
      } else {
        clearStored()
      }
    } catch {
      // Ignore unavailable sessionStorage.
    }
  }, [bundle, simulatedToday])

  const setCollaborationChannelId = useCallback((id: CollaborationChannelId) => {
    setCollaborationChannelIdState(id)
    writeStoredCollaborationChannel(id)
  }, [])

  const requests = useMemo(() => {
    if (!bundle) return PORTFOLIO_REQUESTS
    return [...PORTFOLIO_REQUESTS, bundle.mainRequest]
  }, [bundle])

  const activity = useMemo(() => {
    if (!bundle) return RECENT_ACTIVITY
    return [...RECENT_ACTIVITY, ...bundle.activityEntries]
  }, [bundle])

  const getRequestBundle = useCallback(
    (id: string): RequestBundle | null => {
      if (!bundle || bundle.mainRequest.id !== id) return null
      const hydrated = hydrateBundle(bundle)
      return {
        request: hydrated.mainRequest,
        requirements: hydrated.requirements,
        linkedRecords: hydrated.linkedRecords,
        timelineEvents: hydrated.timelineEvents,
        estimation: hydrateEstimationDecision(hydrated.estimation),
        approval: hydrated.approval,
        assignment: hydrated.assignment,
        execution: hydrated.execution,
        followUp: hydrated.followUp,
        blockerResolution: hydrateBlockerResolution(hydrated.blockerResolution),
        meeting: hydrateMeeting(hydrated.meeting),
      }
    },
    [bundle],
  )

  const submitIntake = useCallback(
    (requirements: StructuredRequirements) => {
      if (bundle !== null) return false
      setBundle(createSubmittedMainRequestBundle(requirements, simulatedToday))
      return true
    },
    [bundle, simulatedToday],
  )

  const confirmEstimation = useCallback(
    (input: ConfirmEstimationInput) => {
      if (bundle === null) return false
      const result = applyEstimationConfirmation(bundle, input)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle],
  )

  const approveBusinessEstimate = useCallback(
    (approvedById: PersonaId) => {
      if (bundle === null) return false
      const result = applyBusinessApproval(bundle, approvedById, simulatedToday)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle, simulatedToday],
  )

  const assignResources = useCallback(
    (assignedById: PersonaId) => {
      if (bundle === null) return false
      const result = applyResourceAssignment(bundle, assignedById, simulatedToday)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle, simulatedToday],
  )

  const advanceSimulatedDate = useCallback(() => {
    if (bundle === null) return false
    if (simulatedToday === SIMULATED_ADVANCE_DATE) {
      const result = applyFollowUpTrigger(
        bundle,
        SIMULATED_ADVANCE_DATE,
        collaborationChannelId,
      )
      if (result.ok && result.created) {
        setBundle(result.bundle)
        return true
      }
      return false
    }
    if (simulatedToday !== SIMULATED_TODAY) return false
    if (bundle.mainRequest.lifecycleStage !== 'Execution') return false
    if (!bundle.execution) return false
    if (bundle.mainRequest.parties.developerId !== 'ajay-raj') return false

    const nextDate = SIMULATED_ADVANCE_DATE
    setSimulatedToday(nextDate)
    const result = applyFollowUpTrigger(
      bundle,
      nextDate,
      collaborationChannelId,
    )
    if (result.ok) {
      setBundle(result.bundle)
      return true
    }
    return true
  }, [bundle, simulatedToday, collaborationChannelId])

  const respondToFollowUp = useCallback(
    (input: FollowUpResponseInput) => {
      if (bundle === null) return false
      const result = applyFollowUpResponse(bundle, input)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle],
  )

  const recordTroubleshootingProgress = useCallback(
    (input: RecordTroubleshootingInput) => {
      if (bundle === null) return false
      const result = applyTroubleshootingProgress(bundle, input)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle],
  )

  const selectCoordinationActions = useCallback(
    (input: SelectCoordinationInput) => {
      if (bundle === null) return false
      const result = applyCoordinationSelection(bundle, input)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle],
  )

  const confirmStakeholderCommunication = useCallback(
    (input: ConfirmStakeholderInput) => {
      if (bundle === null) return false
      const result = applyStakeholderCommunication(bundle, input)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle],
  )

  const confirmMeeting = useCallback(
    (input: ConfirmMeetingInput) => {
      if (bundle === null) return false
      const result = applyMeetingConfirmation(bundle, input)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle],
  )

  const resetDemo = useCallback(() => {
    clearStored()
    setBundle(null)
    setSimulatedToday(SIMULATED_TODAY)
  }, [])

  const value = useMemo<SimulationContextValue>(
    () => ({
      requests,
      activity,
      hasMainRequest: bundle !== null,
      mainRequestId: bundle?.mainRequest.id ?? null,
      simulatedToday,
      collaborationChannelId,
      setCollaborationChannelId,
      getRequestBundle,
      submitIntake,
      confirmEstimation,
      approveBusinessEstimate,
      assignResources,
      advanceSimulatedDate,
      respondToFollowUp,
      recordTroubleshootingProgress,
      selectCoordinationActions,
      confirmStakeholderCommunication,
      confirmMeeting,
      resetDemo,
      bundle,
    }),
    [
      requests,
      activity,
      bundle,
      simulatedToday,
      collaborationChannelId,
      setCollaborationChannelId,
      getRequestBundle,
      submitIntake,
      confirmEstimation,
      approveBusinessEstimate,
      assignResources,
      advanceSimulatedDate,
      respondToFollowUp,
      recordTroubleshootingProgress,
      selectCoordinationActions,
      confirmStakeholderCommunication,
      confirmMeeting,
      resetDemo,
    ],
  )

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
