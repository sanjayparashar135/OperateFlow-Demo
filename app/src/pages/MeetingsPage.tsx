import { Link } from 'react-router-dom'
import { MeetingSummaryCard } from '../components/meetings/MeetingSummaryCard'
import { SmartMeetingAssistant } from '../components/meetings/SmartMeetingAssistant'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import { canConfirmMeeting } from '../data/capabilities'
import { BLOCKED_TECHNICAL_DETAIL } from '../data/followUpDataset'
import {
  getVisibleMeeting,
  hydrateMeeting,
  isMeetingConfirmEligible,
} from '../data/meetingHelpers'
import { getNavItemByPath } from '../data/navigation'
import { isRequestVisibleToPersona } from '../data/portfolioSelectors'
import { MAIN_REQUEST_ID } from '../types/simulation'

const page = getNavItemByPath('/meetings')

export function MeetingsPage() {
  const { currentPersona } = useRole()
  const { bundle, getRequestBundle, confirmMeeting, simulatedToday } =
    useSimulation()

  const mainBundle = getRequestBundle(MAIN_REQUEST_ID)
  const visibleMeeting = getVisibleMeeting(bundle, currentPersona.id)
  const hasConfirmedMeeting = Boolean(hydrateMeeting(bundle?.meeting))
  const canOrganize = canConfirmMeeting(currentPersona.id)
  const canCompose =
    canOrganize &&
    bundle !== null &&
    isMeetingConfirmEligible(bundle) &&
    !hasConfirmedMeeting
  const canOpenRequest =
    mainBundle !== null &&
    isRequestVisibleToPersona(mainBundle.request, currentPersona.id)

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

      {visibleMeeting ? (
        <MeetingSummaryCard
          meeting={visibleMeeting}
          canOpenRequest={canOpenRequest}
          relatedContext={
            canOpenRequest
              ? undefined
              : {
                  title:
                    mainBundle?.request.title ??
                    'High-Value Customer Approval Workflow',
                  blockerSummary: BLOCKED_TECHNICAL_DETAIL,
                }
          }
        />
      ) : null}

      {canCompose ? (
        <SmartMeetingAssistant
          simulatedToday={simulatedToday}
          onConfirm={(input) =>
            confirmMeeting({
              ...input,
              confirmedById: currentPersona.id,
              referenceDate: simulatedToday,
            })
          }
        />
      ) : null}

      {!visibleMeeting && !canCompose ? (
        <Panel padding="lg">
          <PanelHeader
            title="No meetings scheduled"
            description={
              canOrganize
                ? hasConfirmedMeeting
                  ? 'A meeting is already recorded for REQ1235.'
                  : 'A coordination meeting can be prepared after REQ1235 is blocked in Execution.'
                : 'Scheduled meetings appear here when you are the organizer or an attendee.'
            }
          />
          {canOrganize ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                to={`/requests/${MAIN_REQUEST_ID}`}
                className="text-of-primary hover:underline"
              >
                Open REQ1235
              </Link>
              <Link to="/follow-ups" className="text-of-primary hover:underline">
                Open Follow-ups
              </Link>
            </div>
          ) : null}
        </Panel>
      ) : null}
    </div>
  )
}
