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
import {
  getPortfolioRequests,
  getRecentActivity,
} from '../data/portfolio'
import {
  captureFreshDemoCalendar,
  clearPersistedDemoCalendar,
  createDemoCalendar,
  readPersistedDemoCalendar,
  restoreDemoCalendar,
  writePersistedDemoCalendar,
  type DemoCalendar,
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

interface SessionState {
  calendar: DemoCalendar
  simulatedToday: string
  bundle: SubmittedSimulationBundle | null
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

function parsePersistedBundle(raw: string): SubmittedSimulationBundle | null {
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
    return hydrateBundle(bundle)
  } catch {
    return null
  }
}

/**
 * Bundle is kept only when its target date matches the session calendar
 * (avoids mixing legacy October payloads with a fresh anchor).
 */
function readBundleForCalendar(
  calendar: DemoCalendar,
): SubmittedSimulationBundle | null {
  try {
    const raw = sessionStorage.getItem(SIMULATION_STORAGE_KEY)
    if (!raw) return null
    const bundle = parsePersistedBundle(raw)
    if (!bundle) return null
    if (bundle.mainRequest.targetDate !== calendar.targetDate) {
      sessionStorage.removeItem(SIMULATION_STORAGE_KEY)
      return null
    }
    return bundle
  } catch {
    return null
  }
}

function writeBundleStored(
  bundle: SubmittedSimulationBundle,
  simulatedToday: string,
): void {
  const payload: PersistedSimulationV1 = {
    version: SIMULATION_STORAGE_VERSION,
    bundle,
    simulatedToday,
  }
  sessionStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(payload))
}

function clearBundleStored(): void {
  try {
    sessionStorage.removeItem(SIMULATION_STORAGE_KEY)
  } catch {
    // Ignore unavailable sessionStorage.
  }
}

function loadSession(): SessionState {
  const persistedCalendar = readPersistedDemoCalendar()
  if (persistedCalendar) {
    const { calendar, simulatedToday } = restoreDemoCalendar(
      persistedCalendar.demoAnchorDate,
      persistedCalendar.simulatedToday,
    )
    return {
      calendar,
      simulatedToday,
      bundle: readBundleForCalendar(calendar),
    }
  }

  // Legacy October sessions without a demo calendar key are discarded.
  clearBundleStored()
  clearPersistedDemoCalendar()
  const { calendar, simulatedToday } = captureFreshDemoCalendar()
  return { calendar, simulatedToday, bundle: null }
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadSession(), [])
  const [calendar, setCalendar] = useState<DemoCalendar>(() => initial.calendar)
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
      writePersistedDemoCalendar(calendar.demoAnchorDate, simulatedToday)
      if (bundle) {
        writeBundleStored(bundle, simulatedToday)
      } else {
        clearBundleStored()
      }
    } catch {
      // Ignore unavailable sessionStorage.
    }
  }, [bundle, simulatedToday, calendar.demoAnchorDate])

  const setCollaborationChannelId = useCallback((id: CollaborationChannelId) => {
    setCollaborationChannelIdState(id)
    writeStoredCollaborationChannel(id)
  }, [])

  const seedRequests = useMemo(
    () => getPortfolioRequests(calendar.baselineDate),
    [calendar.baselineDate],
  )
  const seedActivity = useMemo(
    () => getRecentActivity(calendar.baselineDate),
    [calendar.baselineDate],
  )

  const requests = useMemo(() => {
    if (!bundle) return seedRequests
    return [...seedRequests, bundle.mainRequest]
  }, [bundle, seedRequests])

  const activity = useMemo(() => {
    if (!bundle) return seedActivity
    return [...seedActivity, ...bundle.activityEntries]
  }, [bundle, seedActivity])

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
      setBundle(
        createSubmittedMainRequestBundle(
          requirements,
          simulatedToday,
          calendar,
        ),
      )
      return true
    },
    [bundle, simulatedToday, calendar],
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
      const result = applyResourceAssignment(
        bundle,
        assignedById,
        simulatedToday,
        calendar,
      )
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle, simulatedToday, calendar],
  )

  const advanceSimulatedDate = useCallback(() => {
    if (bundle === null) return false
    if (simulatedToday === calendar.advanceDate) {
      const result = applyFollowUpTrigger(
        bundle,
        calendar.advanceDate,
        collaborationChannelId,
        calendar,
      )
      if (result.ok && result.created) {
        setBundle(result.bundle)
        return true
      }
      return false
    }
    if (simulatedToday !== calendar.baselineDate) return false
    if (bundle.mainRequest.lifecycleStage !== 'Execution') return false
    if (!bundle.execution) return false
    if (bundle.mainRequest.parties.developerId !== 'ajay-raj') return false

    const nextDate = calendar.advanceDate
    setSimulatedToday(nextDate)
    const result = applyFollowUpTrigger(
      bundle,
      nextDate,
      collaborationChannelId,
      calendar,
    )
    if (result.ok) {
      setBundle(result.bundle)
      return true
    }
    return true
  }, [bundle, simulatedToday, collaborationChannelId, calendar])

  const respondToFollowUp = useCallback(
    (input: FollowUpResponseInput) => {
      if (bundle === null) return false
      const result = applyFollowUpResponse(bundle, input, calendar)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle, calendar],
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
      const result = applyStakeholderCommunication(bundle, input, calendar)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle, calendar],
  )

  const confirmMeeting = useCallback(
    (input: ConfirmMeetingInput) => {
      if (bundle === null) return false
      const result = applyMeetingConfirmation(bundle, input, calendar)
      if (!result.ok) return false
      setBundle(result.bundle)
      return true
    },
    [bundle, calendar],
  )

  const resetDemo = useCallback(() => {
    clearBundleStored()
    const { calendar: nextCalendar, simulatedToday: nextToday } =
      captureFreshDemoCalendar()
    writePersistedDemoCalendar(nextCalendar.demoAnchorDate, nextToday)
    setCalendar(createDemoCalendar(nextCalendar.demoAnchorDate))
    setBundle(null)
    setSimulatedToday(nextToday)
  }, [])

  const value = useMemo<SimulationContextValue>(
    () => ({
      requests,
      activity,
      hasMainRequest: bundle !== null,
      mainRequestId: bundle?.mainRequest.id ?? null,
      demoCalendar: calendar,
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
      calendar,
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
