import { useCallback, useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import {
  RequestDetailsTabs,
  type EstimationFormSubmit,
} from '../components/requests/RequestDetailsTabs'
import {
  REQUEST_DETAILS_TABS,
  type RequestDetailsTabId,
} from '../data/requestDetailsTabs'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import {
  buildConfirmEstimationInput,
  getDefaultEstimationDecision,
} from '../data/estimationHelpers'
import {
  getAttentionReasons,
  getRequestById,
  isRequestVisibleToPersona,
} from '../data/portfolioSelectors'
import { getSimulatedToday } from '../data/simDate'
import { MAIN_REQUEST_ID } from '../types/simulation'

function parseTab(value: string | null): RequestDetailsTabId {
  if (
    value &&
    REQUEST_DETAILS_TABS.some((tab) => tab.id === value)
  ) {
    return value as RequestDetailsTabId
  }
  return 'summary'
}

export function RequestDetailsPage() {
  const { requestId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentPersona } = useRole()
  const { requests, getRequestBundle, confirmEstimation } = useSimulation()
  const referenceDate = getSimulatedToday()
  const tab = parseTab(searchParams.get('tab'))

  const request = useMemo(
    () => getRequestById(requestId, requests),
    [requestId, requests],
  )

  const bundle = getRequestBundle(requestId)
  const estimationAvailable = requestId === MAIN_REQUEST_ID && bundle !== null

  const handleConfirmEstimation = useCallback(
    (form: EstimationFormSubmit) => {
      return confirmEstimation(
        buildConfirmEstimationInput(form, currentPersona.id),
      )
    },
    [confirmEstimation, currentPersona.id],
  )

  if (!request) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-of-border bg-of-surface p-6 shadow-of-panel">
        <h1 className="m-0 text-xl font-semibold text-of-ink">
          Request not found
        </h1>
        <p className="mt-2 text-sm text-of-ink-secondary">
          {requestId} was not found in the current portfolio. It may not be
          visible for your role, or it may have been cleared with Reset Demo.
        </p>
        <Link
          to="/requests"
          className="mt-4 inline-flex text-sm font-semibold text-of-primary hover:underline"
        >
          Back to Requests
        </Link>
      </div>
    )
  }

  if (!isRequestVisibleToPersona(request, currentPersona.id)) {
    return <Navigate to="/requests" replace />
  }

  const reasons = getAttentionReasons(request, referenceDate)
  const requirements = bundle?.requirements ?? null
  const linkedRecords = bundle?.linkedRecords ?? []
  const timelineEvents = bundle?.timelineEvents ?? []
  const estimation = bundle?.estimation ?? getDefaultEstimationDecision()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="m-0 text-xs font-semibold tracking-[0.08em] text-of-primary uppercase">
            Request details
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-of-ink">
            {request.title}
          </h1>
          <p className="m-0 text-sm text-of-ink-muted">
            {request.id} · {request.application}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link
            to="/requests"
            className="text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            Back to Requests
          </Link>
          <Link
            to="/"
            className="text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            Overview
          </Link>
        </div>
      </header>

      <RequestDetailsTabs
        tab={tab}
        onTabChange={(next) => {
          setSearchParams(
            (prev) => {
              const params = new URLSearchParams(prev)
              if (next === 'summary') {
                params.delete('tab')
              } else {
                params.set('tab', next)
              }
              return params
            },
            { replace: true },
          )
        }}
        request={request}
        requirements={requirements}
        linkedRecords={linkedRecords}
        timelineEvents={timelineEvents}
        attentionReasons={reasons}
        estimation={estimationAvailable ? estimation : null}
        estimationAvailable={estimationAvailable}
        personaId={currentPersona.id}
        onConfirmEstimation={handleConfirmEstimation}
      />
    </div>
  )
}
