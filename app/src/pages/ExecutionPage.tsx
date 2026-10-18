import { useMemo } from 'react'
import { AdvanceSimDateControl } from '../components/execution/AdvanceSimDateControl'
import { ExecutionBoard } from '../components/execution/ExecutionBoard'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import { getNavItemByPath } from '../data/navigation'
import { getVisibleRequests } from '../data/portfolioSelectors'
import { SIMULATED_TODAY } from '../data/simDate'
import { MAIN_REQUEST_ID } from '../types/simulation'

const page = getNavItemByPath('/execution')

export function ExecutionPage() {
  const { currentPersona } = useRole()
  const {
    requests,
    simulatedToday,
    getRequestBundle,
    advanceSimulatedDate,
    bundle,
  } = useSimulation()

  const executionRequests = useMemo(() => {
    return getVisibleRequests(currentPersona.id, requests).filter(
      (request) => request.lifecycleStage === 'Execution',
    )
  }, [currentPersona.id, requests])

  const mainBundle = getRequestBundle(MAIN_REQUEST_ID)
  const canAdvance =
    bundle !== null &&
    bundle.mainRequest.lifecycleStage === 'Execution' &&
    Boolean(bundle.approval && bundle.execution) &&
    simulatedToday === SIMULATED_TODAY

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="m-0 text-xs font-semibold tracking-[0.08em] text-of-primary uppercase">
          Northstar Financial Services
        </p>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-of-ink">
          {page.title}
        </h1>
        <p className="m-0 text-sm text-of-ink-muted">
          {currentPersona.name} · {currentPersona.role} ·{' '}
          {executionRequests.length}{' '}
          {executionRequests.length === 1 ? 'request' : 'requests'} in Execution
        </p>
        <p className="m-0 max-w-3xl text-sm text-of-ink-secondary">
          {page.description}
        </p>
      </header>

      <AdvanceSimDateControl
        simulatedToday={simulatedToday}
        canAdvance={canAdvance}
        followUpOpen={mainBundle?.followUp?.status === 'open'}
        onAdvance={advanceSimulatedDate}
      />

      <ExecutionBoard
        requests={executionRequests}
        mainExecution={mainBundle?.execution}
        confirmedHours={mainBundle?.estimation.confirmedHours ?? null}
        hasOpenFollowUp={mainBundle?.followUp?.status === 'open'}
        isMainBlocked={mainBundle?.followUp?.responseKind === 'blocked'}
      />
    </div>
  )
}
