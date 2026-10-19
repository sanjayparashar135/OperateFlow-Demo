import type { PersonaId } from '../types/persona'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../types/simulation'
import { formatDisplayDate } from '../lib/format'
import {
  getActiveDemoCalendar,
  type DemoCalendar,
} from './simDate'

export const MEETING_ID = 'mtg-req1235-01'
export const MEETING_TIMELINE_EVENT_ID = 'tl-req1235-13'
export const MEETING_ACTIVITY_ID = 'act-req1235-10'

export const MEETING_SAMPLE_PROMPT =
  'Arrange a 30-minute meeting tomorrow with the relevant technical team to resolve the regional approval integration blocker.'

export const MEETING_DEFAULT_TITLE =
  'Regional Approval Integration — Blocker Resolution'

export const MEETING_DEFAULT_PURPOSE =
  'Coordinate focused technical investigation of the regional approval integration blocker affecting REQ1235 integration testing.'

export const MEETING_DEFAULT_START = '10:00'
export const MEETING_DEFAULT_DURATION_MINUTES = 30

export const MEETING_REQUIRED_ATTENDEE_IDS: PersonaId[] = [
  'radhe-shyam',
  'ajay-raj',
  'sreekanth-mamdekar',
]

export const MEETING_OPTIONAL_ATTENDEE_ID: PersonaId = 'sanjay-parashar'

export const MEETING_DEFAULT_AGENDA: string[] = [
  'Review blocker and delivery impact.',
  'Investigate regional approval service timeouts.',
  'Review callback persistence and integration dependencies.',
  'Agree on investigation owners and next actions.',
  'Confirm next status update.',
]

export function buildMeetingAiRationale(
  calendar: DemoCalendar = getActiveDemoCalendar(),
): string {
  const targetLabel = formatDisplayDate(calendar.targetDate)
  return (
    `The blocked regional approval integration affects Ajay’s delivery work and likely needs Integration Lead support. ` +
    `A short working session with Radhe, Ajay, and Sreekanth focuses investigation ownership before the ${targetLabel} target, ` +
    `with Sanjay available if architecture guidance is needed.`
  )
}

export function buildMeetingScheduleNote(meetingDate: string): string {
  return `Recommended demo slot for ${formatDisplayDate(meetingDate)} (not calendar-verified).`
}

export const MEETING_RELATED_WORK_LABEL = `${MAIN_REQUEST_ID} / ${MAIN_JIRA_ID}`

export interface MeetingSuggestion {
  title: string
  purpose: string
  meetingDate: string
  startTime: string
  durationMinutes: number
  endTime: string
  organizerId: PersonaId
  requiredAttendeeIds: PersonaId[]
  optionalAttendeeId: PersonaId
  includeOptionalAttendee: boolean
  agenda: string[]
  rationale: string
  scheduleNote: string
  relatedWorkLabel: string
}
