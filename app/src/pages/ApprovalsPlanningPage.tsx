import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalConfirmPanel } from '../components/approvals/ApprovalConfirmPanel'
import { AssignResourcesPanel } from '../components/approvals/AssignResourcesPanel'
import { PlanningQueue } from '../components/approvals/PlanningQueue'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import {
  canApproveBusinessEstimate,
  canAssignResources,
} from '../data/capabilities'
import {
  canApplyBusinessApproval,
  canApplyResourceAssignment,
} from '../data/approvalHelpers'
import { isEstimationConfirmed } from '../data/estimationHelpers'
import { getNavItemByPath } from '../data/navigation'
import { getVisibleRequests } from '../data/portfolioSelectors'
import { MAIN_REQUEST_ID } from '../types/simulation'

const page = getNavItemByPath('/approvals-planning')

type ConfirmMode = 'none' | 'approve' | 'assign'

export function ApprovalsPlanningPage() {
  const { currentPersona } = useRole()
  const {
    requests,
    bundle,
    getRequestBundle,
    approveBusinessEstimate,
    assignResources,
  } = useSimulation()
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>('none')

  const planningRequests = useMemo(() => {
    const visible = getVisibleRequests(currentPersona.id, requests)
    return visible
      .filter((request) => request.lifecycleStage === 'Approval & Planning')
      .sort((a, b) => {
        const rank = (status: string) => {
          if (status === 'Awaiting Technical Review') return 0
          if (status === 'Pending Approval') return 1
          if (status === 'Approved — Awaiting Assignment') return 2
          return 3
        }
        const diff = rank(a.workflowStatus) - rank(b.workflowStatus)
        if (diff !== 0) return diff
        return a.id.localeCompare(b.id)
      })
  }, [currentPersona.id, requests])

  const mainBundle = getRequestBundle(MAIN_REQUEST_ID)
  const canApproveEstimate =
    canApproveBusinessEstimate(currentPersona.id) &&
    bundle !== null &&
    canApplyBusinessApproval(bundle) === null &&
    isEstimationConfirmed(mainBundle?.estimation)

  const canAssignDeveloper =
    canAssignResources(currentPersona.id) &&
    bundle !== null &&
    canApplyResourceAssignment(bundle) === null

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

      {confirmMode === 'approve' && mainBundle ? (
        <ApprovalConfirmPanel
          estimation={mainBundle.estimation}
          targetDate={mainBundle.request.targetDate}
          onCancel={() => setConfirmMode('none')}
          onConfirm={() => {
            const ok = approveBusinessEstimate(currentPersona.id)
            if (ok) setConfirmMode('none')
            return ok
          }}
        />
      ) : null}

      {confirmMode === 'assign' && mainBundle ? (
        <AssignResourcesPanel
          estimation={mainBundle.estimation}
          targetDate={mainBundle.request.targetDate}
          onCancel={() => setConfirmMode('none')}
          onConfirm={() => {
            const ok = assignResources(currentPersona.id)
            if (ok) setConfirmMode('none')
            return ok
          }}
        />
      ) : null}

      {confirmMode === 'none' && canApproveEstimate ? (
        <div className="rounded-xl border border-of-primary-border bg-of-primary-soft/40 px-4 py-3 text-sm text-of-ink-secondary">
          <p className="m-0 font-semibold text-of-ink">
            REQ1235 is ready for business approval
          </p>
          <p className="mt-1 m-0">
            The technical estimate is confirmed. Review the hours and delivery
            approach, then approve the estimate. Resource assignment remains a
            separate project manager action.
          </p>
          <button
            type="button"
            onClick={() => setConfirmMode('approve')}
            className="mt-3 inline-flex rounded-lg bg-of-primary px-3 py-2 text-xs font-semibold text-white hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            Review estimate approval
          </button>
        </div>
      ) : null}

      {confirmMode === 'none' && canAssignDeveloper ? (
        <div className="rounded-xl border border-of-primary-border bg-of-primary-soft/40 px-4 py-3 text-sm text-of-ink-secondary">
          <p className="m-0 font-semibold text-of-ink">
            REQ1235 is approved and awaiting assignment
          </p>
          <p className="mt-1 m-0">
            John Harrison approved the estimate. Assign Ajay Raj to move the
            request into Execution.
          </p>
          <button
            type="button"
            onClick={() => setConfirmMode('assign')}
            className="mt-3 inline-flex rounded-lg bg-of-primary px-3 py-2 text-xs font-semibold text-white hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            Review resource assignment
          </button>
        </div>
      ) : null}

      {bundle?.mainRequest.lifecycleStage === 'Execution' &&
      currentPersona.id === 'radhe-shyam' ? (
        <div className="rounded-xl border border-of-border bg-of-canvas/50 px-4 py-3 text-sm text-of-ink-secondary">
          REQ1235 is in Execution.{' '}
          <Link
            to="/execution"
            className="font-semibold text-of-primary hover:underline"
          >
            Open Execution
          </Link>
        </div>
      ) : null}

      <PlanningQueue
        requests={planningRequests}
        personaId={currentPersona.id}
        canApproveEstimate={canApproveEstimate}
        canAssignDeveloper={canAssignDeveloper}
        onStartApproval={() => setConfirmMode('approve')}
        onStartAssignment={() => setConfirmMode('assign')}
      />
    </div>
  )
}
