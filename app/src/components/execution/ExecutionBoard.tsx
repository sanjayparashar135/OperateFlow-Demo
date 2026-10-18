import { Link } from 'react-router-dom'
import type { DeliveryRequest } from '../../types/delivery'
import type { ExecutionState } from '../../types/simulation'
import { MAIN_REQUEST_ID } from '../../types/simulation'
import { formatDisplayDate } from '../../lib/format'
import { personaDisplayName, primaryOwnerName } from '../../lib/requestParties'
import {
  HealthBadge,
  PriorityBadge,
  StatusBadge,
} from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

interface ExecutionBoardProps {
  requests: DeliveryRequest[]
  mainExecution: ExecutionState | undefined
  confirmedHours: number | null
  hasOpenFollowUp: boolean
}

export function ExecutionBoard({
  requests,
  mainExecution,
  confirmedHours,
  hasOpenFollowUp,
}: ExecutionBoardProps) {
  const mainRequest = requests.find((request) => request.id === MAIN_REQUEST_ID)

  return (
    <div className="flex flex-col gap-5">
      {mainRequest && mainExecution ? (
        <Panel padding="lg" className="border-of-ai-border">
          <PanelHeader
            title="REQ1235 — Customer Onboarding Portal"
            description="Primary demo request in Execution after delivery approval."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Status
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <StatusBadge status={mainRequest.workflowStatus} />
                <HealthBadge health={mainRequest.deliveryHealth} />
              </div>
            </div>
            <div>
              <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Developer
              </p>
              <p className="mt-1 text-sm font-semibold text-of-ink">
                {mainRequest.parties.developerId
                  ? personaDisplayName(mainRequest.parties.developerId)
                  : 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Target / estimate
              </p>
              <p className="mt-1 text-sm font-semibold text-of-ink">
                {formatDisplayDate(mainRequest.targetDate)}
                {confirmedHours != null ? ` · ${confirmedHours}h` : ''}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Progress
              </p>
              <p className="mt-1 text-sm font-semibold text-of-ink">
                {mainExecution.reportedProgressPercent}% reported
              </p>
              <p className="mt-0.5 text-xs text-of-ink-muted">
                Last update {formatDisplayDate(mainExecution.lastDeveloperUpdateDate)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              to={`/requests/${MAIN_REQUEST_ID}`}
              className="text-of-primary hover:underline"
            >
              Open request details
            </Link>
            {hasOpenFollowUp ? (
              <Link to="/follow-ups" className="text-of-ai hover:underline">
                Open follow-up
              </Link>
            ) : null}
          </div>
        </Panel>
      ) : null}

      <Panel padding="lg">
        <PanelHeader
          title="Execution portfolio"
          description="Persona-visible requests currently in the Execution lifecycle stage."
        />
        {requests.length === 0 ? (
          <p className="mt-3 m-0 text-sm text-of-ink-muted">
            No Execution-stage requests are visible for this role.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-of-border text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                  <th className="px-2 py-2">Request</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Health</th>
                  <th className="px-2 py-2">Owner</th>
                  <th className="px-2 py-2">Target</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className={`border-b border-of-border/80 ${
                      request.id === MAIN_REQUEST_ID
                        ? 'bg-of-ai-soft/25'
                        : 'bg-of-surface'
                    }`}
                  >
                    <td className="px-2 py-3 align-top">
                      <Link
                        to={`/requests/${request.id}`}
                        className="font-semibold text-of-primary hover:underline"
                      >
                        {request.id}
                      </Link>
                      <p className="mt-0.5 m-0 text-of-ink">{request.title}</p>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
