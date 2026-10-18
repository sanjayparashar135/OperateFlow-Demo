import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyEstimationConfirmation,
  hydrateEstimationDecision,
  type ConfirmEstimationInput,
} from '../data/estimationHelpers'
import { createSubmittedMainRequestBundle } from '../data/mainRequestFactory'
import { PORTFOLIO_REQUESTS, RECENT_ACTIVITY } from '../data/portfolio'
import { getSimulatedToday } from '../data/simDate'
import type { StructuredRequirements, SubmittedSimulationBundle } from '../types/simulation'
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
    return {
      ...bundle,
      estimation: hydrateEstimationDecision(bundle.estimation),
    }
  } catch {
    return null
  }
}

function readStoredBundle(): SubmittedSimulationBundle | null {
  try {
    const raw = sessionStorage.getItem(SIMULATION_STORAGE_KEY)
    if (!raw) return null
    return parsePersistedBundle(raw)
  } catch {
    return null
  }
}

function writeStoredBundle(bundle: SubmittedSimulationBundle): void {
  const payload: PersistedSimulationV1 = {
    version: SIMULATION_STORAGE_VERSION,
    bundle,
  }
  sessionStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(payload))
}

function clearStoredBundle(): void {
  try {
    sessionStorage.removeItem(SIMULATION_STORAGE_KEY)
  } catch {
    // Ignore unavailable sessionStorage.
  }
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [bundle, setBundle] = useState<SubmittedSimulationBundle | null>(() =>
    readStoredBundle(),
  )

  useEffect(() => {
    try {
      if (bundle) {
        writeStoredBundle(bundle)
      } else {
        clearStoredBundle()
      }
    } catch {
      // Ignore unavailable sessionStorage.
    }
  }, [bundle])

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
      return {
        request: bundle.mainRequest,
        requirements: bundle.requirements,
        linkedRecords: bundle.linkedRecords,
        timelineEvents: bundle.timelineEvents,
        estimation: hydrateEstimationDecision(bundle.estimation),
      }
    },
    [bundle],
  )

  const submitIntake = useCallback(
    (requirements: StructuredRequirements) => {
      if (bundle !== null) return false
      setBundle(
        createSubmittedMainRequestBundle(requirements, getSimulatedToday()),
      )
      return true
    },
    [bundle],
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

  const resetDemo = useCallback(() => {
    clearStoredBundle()
    setBundle(null)
  }, [])

  const value = useMemo<SimulationContextValue>(
    () => ({
      requests,
      activity,
      hasMainRequest: bundle !== null,
      mainRequestId: bundle?.mainRequest.id ?? null,
      getRequestBundle,
      submitIntake,
      confirmEstimation,
      resetDemo,
      bundle,
    }),
    [
      requests,
      activity,
      bundle,
      getRequestBundle,
      submitIntake,
      confirmEstimation,
      resetDemo,
    ],
  )

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
