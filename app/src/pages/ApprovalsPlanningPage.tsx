import { useMemo } from 'react'
import { PlanningQueue } from '../components/approvals/PlanningQueue'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import { getNavItemByPath } from '../data/navigation'
import { getVisibleRequests } from '../data/portfolioSelectors'

const page = getNavItemByPath('/approvals-planning')

export function ApprovalsPlanningPage() {
  const { currentPersona } = useRole()
  const { requests } = useSimulation()

  const planningRequests = useMemo(() => {
    const visible = getVisibleRequests(currentPersona.id, requests)
    return visible
      .filter((request) => request.lifecycleStage === 'Approval & Planning')
      .sort((a, b) => {
        // Surface awaiting technical review first for the demo walkthrough.
        if (
          a.workflowStatus === 'Awaiting Technical Review' &&
          b.workflowStatus !== 'Awaiting Technical Review'
        ) {
          return -1
        }
        if (
          b.workflowStatus === 'Awaiting Technical Review' &&
          a.workflowStatus !== 'Awaiting Technical Review'
        ) {
          return 1
        }
        return a.id.localeCompare(b.id)
      })
  }, [currentPersona.id, requests])

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
          {planningRequests.length}{' '}
          {planningRequests.length === 1 ? 'request' : 'requests'} in Approval
          &amp; Planning
        </p>
        <p className="m-0 max-w-3xl text-sm text-of-ink-secondary">
          {page.description}
        </p>
      </header>

      <PlanningQueue
        requests={planningRequests}
        personaId={currentPersona.id}
      />
    </div>
  )
}
