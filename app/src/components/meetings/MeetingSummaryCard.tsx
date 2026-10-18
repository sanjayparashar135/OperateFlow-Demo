import { Link } from 'react-router-dom'
import type { ConfirmedMeetingRecord } from '../../types/simulation'
import { MAIN_REQUEST_ID } from '../../types/simulation'
import { formatDisplayDate } from '../../lib/format'
import { personaDisplayName } from '../../lib/requestParties'
import { MEETING_RELATED_WORK_LABEL } from '../../data/meetingDataset'
import { Badge } from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

interface MeetingSummaryCardProps {
  meeting: ConfirmedMeetingRecord
  /** When true, related work links to full Request Details. */
  canOpenRequest: boolean
  /** When true (meeting-only attendees), related work opens AI briefing. */
  canOpenBriefing?: boolean
  onOpenBriefing?: () => void
  /** Compact related-request context for attendees without request access. */
  relatedContext?: {
    title: string
    blockerSummary: string
  }
}

export function MeetingSummaryCard({
  meeting,
  canOpenRequest,
  canOpenBriefing = false,
  onOpenBriefing,
  relatedContext,
}: MeetingSummaryCardProps) {
  return (
    <Panel padding="lg">
      <PanelHeader
        title={meeting.title}
        description={meeting.purpose}
        action={<Badge tone="primary">Scheduled</Badge>}
      />

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">Date & time</dt>
          <dd className="mt-1 text-sm font-medium text-of-ink">
            {formatDisplayDate(meeting.meetingDate)} · {meeting.startTime}–
            {meeting.endTime}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">Organizer</dt>
          <dd className="mt-1 text-sm font-medium text-of-ink">
            {personaDisplayName(meeting.organizerId)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-of-ink-muted">Attendees</dt>
          <dd className="mt-1 text-sm text-of-ink">
            {meeting.attendeeIds.map((id) => personaDisplayName(id)).join(', ')}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-of-ink-muted">Related work</dt>
          <dd className="mt-1 text-sm font-medium text-of-ink">
            {canOpenRequest ? (
              <Link
                to={`/requests/${MAIN_REQUEST_ID}`}
                className="text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              >
                {MEETING_RELATED_WORK_LABEL}
              </Link>
            ) : canOpenBriefing && onOpenBriefing ? (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="inline text-left font-semibold text-of-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              >
                {MEETING_RELATED_WORK_LABEL}
              </button>
            ) : (
              MEETING_RELATED_WORK_LABEL
            )}
          </dd>
        </div>
      </dl>

      {relatedContext ? (
        <div className="mt-4 rounded-lg border border-of-border bg-of-canvas/50 px-3 py-3">
          <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Related request context
          </p>
          <p className="mt-1 m-0 text-sm font-medium text-of-ink">
            {relatedContext.title}
          </p>
          <p className="mt-1 m-0 text-sm leading-relaxed text-of-ink-secondary">
            {relatedContext.blockerSummary}
          </p>
          {canOpenBriefing && onOpenBriefing ? (
            <button
              type="button"
              onClick={onOpenBriefing}
              className="mt-2 inline-flex text-sm font-semibold text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            >
              Open AI Request Briefing
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
          Agenda
        </p>
        <ol className="mt-2 mb-0 list-decimal space-y-1 pl-5 text-sm text-of-ink-secondary">
          {meeting.agenda.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>

      {meeting.scheduleNote ? (
        <p className="mt-4 m-0 text-xs text-of-ink-muted">{meeting.scheduleNote}</p>
      ) : null}
    </Panel>
  )
}
