import { Link } from 'react-router-dom'
import type { ConfirmedMeetingRecord } from '../../types/simulation'
import { formatDisplayDate } from '../../lib/format'
import { personaDisplayName } from '../../lib/requestParties'
import { Badge } from '../ui/Badge'

interface ScheduledMeetingAssociationProps {
  meeting: ConfirmedMeetingRecord
}

export function ScheduledMeetingAssociation({
  meeting,
}: ScheduledMeetingAssociationProps) {
  return (
    <div className="rounded-xl border border-of-primary-border bg-of-primary-soft/30 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="m-0 text-sm font-semibold text-of-ink">
          Scheduled coordination meeting
        </p>
        <Badge tone="primary">Scheduled</Badge>
      </div>
      <p className="mt-1 m-0 text-sm text-of-ink-secondary">
        {meeting.title} · {formatDisplayDate(meeting.meetingDate)} ·{' '}
        {meeting.startTime}–{meeting.endTime}
      </p>
      <p className="mt-1 m-0 text-xs text-of-ink-muted">
        {meeting.attendeeIds.length} attendees including{' '}
        {personaDisplayName(meeting.organizerId)}
      </p>
      <Link
        to="/meetings"
        className="mt-2 inline-flex text-sm font-semibold text-of-primary hover:underline"
      >
        View meeting details
      </Link>
    </div>
  )
}
