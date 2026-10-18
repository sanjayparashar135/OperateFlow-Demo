import { Link } from 'react-router-dom'
import { TeamsFollowUpThread } from '../components/followups/TeamsFollowUpThread'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import {
  COLLABORATION_CHANNELS,
  getCollaborationChannel,
} from '../data/collaborationChannel'
import { getNavItemByPath } from '../data/navigation'
import { isRequestVisibleToPersona } from '../data/portfolioSelectors'
import type { CollaborationChannelId } from '../types/simulation'
import { MAIN_REQUEST_ID } from '../types/simulation'

const page = getNavItemByPath('/follow-ups')

export function FollowUpsPage() {
  const { currentPersona } = useRole()
  const {
    getRequestBundle,
    respondToFollowUp,
    simulatedToday,
    hasMainRequest,
    collaborationChannelId,
    setCollaborationChannelId,
  } = useSimulation()

  const mainBundle = getRequestBundle(MAIN_REQUEST_ID)
  const canViewMain =
    mainBundle !== null &&
    isRequestVisibleToPersona(mainBundle.request, currentPersona.id)
  const followUp = canViewMain ? mainBundle?.followUp : undefined
  const channel = getCollaborationChannel(
    followUp?.channelId ?? collaborationChannelId,
  )

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
          {currentPersona.name} · {currentPersona.role}
        </p>
        <p className="m-0 max-w-3xl text-sm text-of-ink-secondary">
          {page.description}
        </p>
      </header>

      <Panel padding="lg">
        <PanelHeader
          title="Client collaboration platform"
          description="OperateFlow delivers proactive follow-ups through the client's approved messaging channel."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-sm font-semibold text-of-ink">
              Delivery channel: {channel.label}
            </p>
            <p className="mt-1 m-0 text-sm text-of-ink-muted">
              Client-approved collaboration platform
            </p>
          </div>
          <label className="flex min-w-[14rem] flex-col gap-1 text-xs font-medium text-of-ink-muted">
            Presentation channel
            <select
              value={collaborationChannelId}
              onChange={(event) =>
                setCollaborationChannelId(
                  event.target.value as CollaborationChannelId,
                )
              }
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            >
              {Object.values(COLLABORATION_CHANNELS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {followUp ? (
        <TeamsFollowUpThread
          followUp={followUp}
          personaId={currentPersona.id}
          simulatedToday={simulatedToday}
          channelId={collaborationChannelId}
          onRespond={(kind, detail) =>
            respondToFollowUp({
              kind,
              detail,
              referenceDate: simulatedToday,
            })
          }
        />
      ) : (
        <Panel padding="lg">
          <PanelHeader
            title="No open follow-ups"
            description={`Proactive deadline follow-ups appear here after Execution starts and the simulated date advances. Messages are delivered via ${channel.label}.`}
          />
          <p className="m-0 text-sm text-of-ink-secondary">
            {!hasMainRequest
              ? 'Submit Intelligent Intake, complete estimation, business approval, and resource assignment first.'
              : mainBundle?.request.lifecycleStage !== 'Execution'
                ? 'Complete business approval and resource assignment to move REQ1235 into Execution.'
                : 'Open Execution and advance the simulated date to October 21 to trigger the collaboration follow-up.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              to="/approvals-planning"
              className="text-of-primary hover:underline"
            >
              Approvals &amp; Planning
            </Link>
            <Link to="/execution" className="text-of-primary hover:underline">
              Execution
            </Link>
          </div>
        </Panel>
      )}
    </div>
  )
}
