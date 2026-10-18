import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { DeliveryRequest } from '../../types/delivery'
import type { PersonaId } from '../../types/persona'
import { canConfirmEstimation } from '../../data/capabilities'
import { formatDisplayDate } from '../../lib/format'
import { primaryOwnerName } from '../../lib/requestParties'
import { MAIN_REQUEST_ID } from '../../types/simulation'
import {
  HealthBadge,
  PriorityBadge,
  StatusBadge,
} from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

interface PlanningQueueProps {
  requests: DeliveryRequest[]
  personaId: PersonaId
}

function isActionableTechnicalReview(
  request: DeliveryRequest,
  personaId: PersonaId,
): boolean {
  return (
    request.id === MAIN_REQUEST_ID &&
    request.workflowStatus === 'Awaiting Technical Review' &&
    canConfirmEstimation(personaId)
  )
}

export function PlanningQueue({ requests, personaId }: PlanningQueueProps) {
  if (requests.length === 0) {
    return (
      <Panel padding="lg">
        <PanelHeader
          title="Planning queue"
          description="No Approval & Planning requests are visible for this role."
        />
        <p className="m-0 text-sm text-of-ink-muted">
          Switch persona or complete Intelligent Intake to populate the main
          technical review item.
        </p>
      </Panel>
    )
  }

  return (
    <Panel padding="lg">
      <PanelHeader
        title="Planning queue"
        description="Visible requests in Approval & Planning. Open a row for details; technical estimation is reviewed in Request Details."
      />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-of-border text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
              <th className="px-2 py-2 font-semibold">Request</th>
              <th className="px-2 py-2 font-semibold">Status</th>
              <th className="px-2 py-2 font-semibold">Health</th>
              <th className="px-2 py-2 font-semibold">Owner</th>
              <th className="px-2 py-2 font-semibold">Target</th>
              <th className="px-2 py-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const actionable = isActionableTechnicalReview(request, personaId)
              const estimationHref = `/requests/${request.id}?tab=estimation`
              const detailsHref = `/requests/${request.id}`

              return (
                <tr
                  key={request.id}
                  className={`border-b border-of-border/80 ${
                    actionable ? 'bg-of-ai-soft/30' : 'bg-of-surface'
                  }`}
                >
                  <td className="px-2 py-3 align-top">
                    <Link
                      to={detailsHref}
                      className="font-semibold text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
                    >
                      {request.id}
                    </Link>
                    <p className="mt-0.5 m-0 text-of-ink">{request.title}</p>
                    <p className="mt-0.5 m-0 text-xs text-of-ink-muted">
                      {request.application}
                    </p>
                    <div className="mt-1">
                      <PriorityBadge priority={request.priority} />
                    </div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <StatusBadge status={request.workflowStatus} />
                  </td>
                  <td className="px-2 py-3 align-top">
                    <HealthBadge health={request.deliveryHealth} />
                  </td>
                  <td className="px-2 py-3 align-top text-of-ink-secondary">
                    {primaryOwnerName(request)}
                  </td>
                  <td className="px-2 py-3 align-top text-of-ink-secondary">
                    {formatDisplayDate(request.targetDate)}
                  </td>
                  <td className="px-2 py-3 align-top">
                    {actionable ? (
                      <Link
                        to={estimationHref}
                        className="inline-flex items-center gap-1 rounded-lg border border-of-ai-border bg-of-ai-soft px-3 py-1.5 text-xs font-semibold text-of-ai transition-colors hover:bg-of-ai-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-ai"
                      >
                        Review estimate
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : request.id === MAIN_REQUEST_ID ? (
                      <Link
                        to={estimationHref}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-of-primary hover:underline"
                      >
                        View estimation
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : (
                      <Link
                        to={detailsHref}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-of-primary hover:underline"
                      >
                        Open details
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
