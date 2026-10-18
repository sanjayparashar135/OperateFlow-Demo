import type { PersonaId } from '../types/persona'
import type {
  ConfirmedMeetingRecord,
  SubmittedSimulationBundle,
} from '../types/simulation'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../types/simulation'
import { canConfirmMeeting } from './capabilities'
import { BLOCKED_TECHNICAL_DETAIL } from './followUpDataset'
import {
  MEETING_ACTIVITY_ID,
  MEETING_AI_RATIONALE,
  MEETING_DEFAULT_AGENDA,
  MEETING_DEFAULT_DURATION_MINUTES,
  MEETING_DEFAULT_PURPOSE,
  MEETING_DEFAULT_START,
  MEETING_DEFAULT_TITLE,
  MEETING_ID,
  MEETING_OPTIONAL_ATTENDEE_ID,
  MEETING_RELATED_WORK_LABEL,
  MEETING_REQUIRED_ATTENDEE_IDS,
  MEETING_SAMPLE_PROMPT,
  MEETING_SCHEDULE_NOTE,
  MEETING_TIMELINE_EVENT_ID,
  type MeetingSuggestion,
} from './meetingDataset'
import { personaDisplayName } from '../lib/requestParties'

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export type ParseMeetingIntentResult =
  | { ok: true; suggestion: MeetingSuggestion }
  | { ok: false; reason: string }

export type ApplyMeetingResult =
  | { ok: true; bundle: SubmittedSimulationBundle }
  | { ok: false; reason: string }

export interface ConfirmMeetingInput {
  title: string
  purpose: string
  meetingDate: string
  startTime: string
  durationMinutes: number
  attendeeIds: PersonaId[]
  agenda: string[]
  scheduleNote: string | null
  confirmedById: PersonaId
  referenceDate: string
}

/** Add one calendar day to YYYY-MM-DD using UTC arithmetic. */
export function addDaysIso(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function computeEndTime(
  startTime: string,
  durationMinutes: number,
): string | null {
  if (!TIME_PATTERN.test(startTime)) return null
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return null
  const [hours, minutes] = startTime.split(':').map(Number)
  const total = hours * 60 + minutes + durationMinutes
  if (total >= 24 * 60) return null
  const endH = String(Math.floor(total / 60)).padStart(2, '0')
  const endM = String(total % 60).padStart(2, '0')
  return `${endH}:${endM}`
}

export function buildDefaultMeetingSuggestion(
  simulatedToday: string,
): MeetingSuggestion {
  const meetingDate = addDaysIso(simulatedToday, 1)
  const endTime =
    computeEndTime(MEETING_DEFAULT_START, MEETING_DEFAULT_DURATION_MINUTES) ??
    '10:30'
  return {
    title: MEETING_DEFAULT_TITLE,
    purpose: MEETING_DEFAULT_PURPOSE,
    meetingDate,
    startTime: MEETING_DEFAULT_START,
    durationMinutes: MEETING_DEFAULT_DURATION_MINUTES,
    endTime,
    organizerId: 'radhe-shyam',
    requiredAttendeeIds: [...MEETING_REQUIRED_ATTENDEE_IDS],
    optionalAttendeeId: MEETING_OPTIONAL_ATTENDEE_ID,
    includeOptionalAttendee: false,
    agenda: [...MEETING_DEFAULT_AGENDA],
    rationale: MEETING_AI_RATIONALE,
    scheduleNote: MEETING_SCHEDULE_NOTE,
    relatedWorkLabel: MEETING_RELATED_WORK_LABEL,
  }
}

/**
 * Deterministic intent match for the demo sample / keyword family.
 * Does not claim general-purpose NLU.
 */
export function parseMeetingIntent(
  text: string,
  simulatedToday: string,
): ParseMeetingIntentResult {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!normalized) {
    return {
      ok: false,
      reason:
        'Enter a meeting request, or use the sample request for a guided demo path.',
    }
  }

  const hasMeeting = /\b(meeting|call|discussion|huddle)\b/.test(normalized)
  const hasDuration = /\b30[\s-]?minute|\b30\b.*\bmin/.test(normalized)
  const hasTomorrow = /\btomorrow\b/.test(normalized)
  const hasBlockerContext =
    /\b(blocker|blocked|integration|approval|regional)\b/.test(normalized)
  const hasTeam = /\b(team|technical|ajay|sreekanth|resolve)\b/.test(normalized)

  const score =
    Number(hasMeeting) +
    Number(hasDuration) +
    Number(hasTomorrow) +
    Number(hasBlockerContext) +
    Number(hasTeam)

  const matchesSample =
    normalized === MEETING_SAMPLE_PROMPT.toLowerCase().replace(/\s+/g, ' ')

  if (!matchesSample && score < 3) {
    return {
      ok: false,
      reason:
        'OperateFlow did not recognize that request. Try the sample meeting request about a 30-minute blocker resolution session tomorrow.',
    }
  }

  return { ok: true, suggestion: buildDefaultMeetingSuggestion(simulatedToday) }
}

export function hydrateMeeting(
  meeting: ConfirmedMeetingRecord | undefined,
): ConfirmedMeetingRecord | undefined {
  if (!meeting) return undefined
  if (meeting.id !== MEETING_ID) return undefined
  if (meeting.requestId !== MAIN_REQUEST_ID) return undefined
  if (meeting.status !== 'scheduled') return undefined
  if (!Array.isArray(meeting.attendeeIds) || meeting.attendeeIds.length === 0) {
    return undefined
  }
  if (!Array.isArray(meeting.agenda) || meeting.agenda.length === 0) {
    return undefined
  }
  return {
    id: meeting.id,
    requestId: meeting.requestId,
    status: 'scheduled',
    title: typeof meeting.title === 'string' ? meeting.title : '',
    purpose: typeof meeting.purpose === 'string' ? meeting.purpose : '',
    meetingDate: meeting.meetingDate,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    durationMinutes: meeting.durationMinutes,
    organizerId: meeting.organizerId,
    attendeeIds: [...new Set(meeting.attendeeIds)],
    agenda: meeting.agenda.filter((item) => item.trim().length > 0),
    scheduleNote:
      typeof meeting.scheduleNote === 'string' ? meeting.scheduleNote : null,
    confirmedById: meeting.confirmedById,
    confirmedAt: meeting.confirmedAt,
  }
}

export function isMeetingVisibleToPersona(
  meeting: ConfirmedMeetingRecord,
  personaId: PersonaId,
): boolean {
  if (meeting.organizerId === personaId) return true
  return meeting.attendeeIds.includes(personaId)
}

export function getVisibleMeeting(
  bundle: SubmittedSimulationBundle | null,
  personaId: PersonaId,
): ConfirmedMeetingRecord | null {
  if (!bundle) return null
  const meeting = hydrateMeeting(bundle.meeting)
  if (!meeting) return null
  return isMeetingVisibleToPersona(meeting, personaId) ? meeting : null
}

export function isMeetingConfirmEligible(
  bundle: SubmittedSimulationBundle,
): boolean {
  return (
    bundle.followUp?.responseKind === 'blocked' &&
    bundle.mainRequest.lifecycleStage === 'Execution' &&
    bundle.mainRequest.workflowStatus === 'Blocked'
  )
}

export function validateConfirmMeetingInput(
  input: ConfirmMeetingInput,
): string | null {
  const title = input.title.trim()
  if (!title) return 'Meeting title is required.'

  const purpose = input.purpose.trim()
  if (!purpose) return 'Meeting purpose is required.'

  if (!DATE_PATTERN.test(input.meetingDate)) {
    return 'Meeting date must be a valid YYYY-MM-DD value.'
  }
  if (input.meetingDate < input.referenceDate) {
    return 'Meeting cannot be scheduled before the current simulated date.'
  }

  if (!TIME_PATTERN.test(input.startTime)) {
    return 'Start time must use HH:mm (24-hour) format.'
  }

  if (
    !Number.isFinite(input.durationMinutes) ||
    input.durationMinutes <= 0 ||
    !Number.isInteger(input.durationMinutes)
  ) {
    return 'Duration must be a positive whole number of minutes.'
  }

  const endTime = computeEndTime(input.startTime, input.durationMinutes)
  if (!endTime) {
    return 'End time could not be calculated from start time and duration.'
  }

  const uniqueAttendees = [...new Set(input.attendeeIds)]
  if (uniqueAttendees.length !== input.attendeeIds.length) {
    return 'Duplicate attendees are not allowed.'
  }
  if (!uniqueAttendees.includes(input.confirmedById)) {
    // Organizer must be in the attendee list for visibility consistency.
    return 'Organizer must be included as a meeting participant.'
  }
  const others = uniqueAttendees.filter((id) => id !== input.confirmedById)
  if (others.length === 0) {
    return 'Include at least one participant besides the organizer.'
  }

  const agenda = input.agenda.map((item) => item.trim()).filter(Boolean)
  if (agenda.length === 0) {
    return 'Agenda must include at least one item.'
  }

  return null
}

export function applyMeetingConfirmation(
  bundle: SubmittedSimulationBundle,
  input: ConfirmMeetingInput,
): ApplyMeetingResult {
  if (!canConfirmMeeting(input.confirmedById)) {
    return {
      ok: false,
      reason: 'Only Radhe Shyam may confirm a coordination meeting.',
    }
  }
  if (!isMeetingConfirmEligible(bundle)) {
    return {
      ok: false,
      reason: 'REQ1235 must be in Execution / Blocked before scheduling.',
    }
  }
  if (bundle.followUp?.responseDetail !== BLOCKED_TECHNICAL_DETAIL) {
    return { ok: false, reason: 'Original blocker evidence is missing or altered.' }
  }
  if (hydrateMeeting(bundle.meeting)) {
    return { ok: false, reason: 'A meeting is already scheduled for REQ1235.' }
  }
  if (
    bundle.timelineEvents.some((event) => event.id === MEETING_TIMELINE_EVENT_ID)
  ) {
    return { ok: false, reason: 'A meeting is already scheduled for REQ1235.' }
  }

  const validationError = validateConfirmMeetingInput(input)
  if (validationError) {
    return { ok: false, reason: validationError }
  }

  const endTime = computeEndTime(input.startTime, input.durationMinutes)!
  const title = input.title.trim()
  const purpose = input.purpose.trim()
  const agenda = input.agenda.map((item) => item.trim()).filter(Boolean)
  const attendeeIds = [...new Set(input.attendeeIds)]
  const confirmedAt = `${input.referenceDate}T11:30:00`

  // Preserve parties snapshot for mutation guard in callers/tests.
  const partiesBefore = { ...bundle.mainRequest.parties }

  const meeting: ConfirmedMeetingRecord = {
    id: MEETING_ID,
    requestId: MAIN_REQUEST_ID,
    status: 'scheduled',
    title,
    purpose,
    meetingDate: input.meetingDate,
    startTime: input.startTime,
    endTime,
    durationMinutes: input.durationMinutes,
    organizerId: 'radhe-shyam',
    attendeeIds,
    agenda,
    scheduleNote: input.scheduleNote?.trim() ? input.scheduleNote.trim() : null,
    confirmedById: input.confirmedById,
    confirmedAt,
  }

  const attendeeNames = attendeeIds.map((id) => personaDisplayName(id)).join(', ')

  const nextBundle: SubmittedSimulationBundle = {
    ...bundle,
    meeting,
    mainRequest: {
      ...bundle.mainRequest,
      lifecycleStage: 'Execution',
      workflowStatus: 'Blocked',
      deliveryHealth: 'At Risk',
      targetDate: bundle.mainRequest.targetDate,
      parties: { ...partiesBefore },
      lastUpdated: input.referenceDate,
      attentionReasons: [
        'Technical coordination meeting scheduled; October 23 target remains under assessment',
      ],
    },
    timelineEvents: [
      ...bundle.timelineEvents,
      {
        id: MEETING_TIMELINE_EVENT_ID,
        requestId: MAIN_REQUEST_ID,
        timestamp: confirmedAt,
        title: 'Coordination meeting scheduled',
        detail:
          `Radhe Shyam confirmed "${title}" for ${input.meetingDate} ` +
          `${input.startTime}–${endTime} with ${attendeeNames}. ` +
          `Related work: ${MAIN_REQUEST_ID} / ${MAIN_JIRA_ID}. ` +
          'The delivery blocker remains under investigation.',
        source: 'human',
        category: 'meeting',
      },
    ],
    activityEntries: [
      ...bundle.activityEntries,
      {
        id: MEETING_ACTIVITY_ID,
        requestId: MAIN_REQUEST_ID,
        timestamp: confirmedAt,
        actor: 'Radhe Shyam',
        category: 'risk',
        message: `${MAIN_REQUEST_ID}: coordination meeting scheduled for ${input.meetingDate}.`,
      },
    ],
  }

  return { ok: true, bundle: nextBundle }
}

export { MEETING_SAMPLE_PROMPT }
