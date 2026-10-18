import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { PersonaId } from '../../types/persona'
import {
  MEETING_OPTIONAL_ATTENDEE_ID,
  MEETING_REQUIRED_ATTENDEE_IDS,
  MEETING_SAMPLE_PROMPT,
  type MeetingSuggestion,
} from '../../data/meetingDataset'
import {
  computeEndTime,
  parseMeetingIntent,
} from '../../data/meetingHelpers'
import { formatDisplayDate } from '../../lib/format'
import { personaDisplayName } from '../../lib/requestParties'
import { getPersonaById } from '../../data/personas'
import { Badge } from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

interface SmartMeetingAssistantProps {
  simulatedToday: string
  onConfirm: (input: {
    title: string
    purpose: string
    meetingDate: string
    startTime: string
    durationMinutes: number
    attendeeIds: PersonaId[]
    agenda: string[]
    scheduleNote: string | null
  }) => boolean
}

export function SmartMeetingAssistant({
  simulatedToday,
  onConfirm,
}: SmartMeetingAssistantProps) {
  const [intentText, setIntentText] = useState('')
  const [intentError, setIntentError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<MeetingSuggestion | null>(null)

  const [title, setTitle] = useState('')
  const [purpose, setPurpose] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [includeOptional, setIncludeOptional] = useState(false)
  const [coreAttendees, setCoreAttendees] = useState<PersonaId[]>([
    ...MEETING_REQUIRED_ATTENDEE_IDS,
  ])
  const [agendaText, setAgendaText] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const endTime = useMemo(
    () => computeEndTime(startTime, durationMinutes),
    [startTime, durationMinutes],
  )

  const applySuggestion = (next: MeetingSuggestion) => {
    setSuggestion(next)
    setTitle(next.title)
    setPurpose(next.purpose)
    setMeetingDate(next.meetingDate)
    setStartTime(next.startTime)
    setDurationMinutes(next.durationMinutes)
    setIncludeOptional(next.includeOptionalAttendee)
    setCoreAttendees([...next.requiredAttendeeIds])
    setAgendaText(next.agenda.join('\n'))
    setIntentError(null)
    setConfirmError(null)
  }

  const handleParse = () => {
    const result = parseMeetingIntent(intentText, simulatedToday)
    if (!result.ok) {
      setSuggestion(null)
      setIntentError(result.reason)
      return
    }
    applySuggestion(result.suggestion)
  }

  const handleSample = () => {
    setIntentText(MEETING_SAMPLE_PROMPT)
    const result = parseMeetingIntent(MEETING_SAMPLE_PROMPT, simulatedToday)
    if (result.ok) applySuggestion(result.suggestion)
  }

  const toggleCoreAttendee = (id: PersonaId) => {
    if (id === 'radhe-shyam') return
    setCoreAttendees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleConfirm = () => {
    setPending(true)
    setConfirmError(null)
    const agenda = agendaText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const attendeeIds: PersonaId[] = [
      ...new Set([
        'radhe-shyam' as PersonaId,
        ...coreAttendees,
        ...(includeOptional ? [MEETING_OPTIONAL_ATTENDEE_ID] : []),
      ]),
    ]
    const ok = onConfirm({
      title,
      purpose,
      meetingDate,
      startTime,
      durationMinutes,
      attendeeIds,
      agenda,
      scheduleNote: suggestion?.scheduleNote ?? null,
    })
    if (!ok) {
      setConfirmError(
        'Unable to confirm. Check title, purpose, date, time, attendees, and agenda.',
      )
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Panel padding="lg">
        <PanelHeader
          title="Smart Meeting Assistant"
          description="Describe the coordination meeting you need. OperateFlow prepares a reviewable draft from the blocked delivery scenario."
        />
        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
          Meeting request
          <textarea
            value={intentText}
            onChange={(event) => setIntentText(event.target.value)}
            rows={3}
            placeholder={MEETING_SAMPLE_PROMPT}
            className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleParse}
            className="inline-flex rounded-lg bg-of-primary px-4 py-2 text-sm font-semibold text-white hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            Prepare suggestion
          </button>
          <button
            type="button"
            onClick={handleSample}
            className="inline-flex rounded-lg border border-of-ai-border bg-of-ai-soft px-4 py-2 text-sm font-semibold text-of-ai hover:bg-of-ai-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-ai"
          >
            Use Sample Request
          </button>
        </div>
        {intentError ? (
          <p className="mt-3 m-0 text-sm font-medium text-rose-700" role="alert">
            {intentError}
          </p>
        ) : null}
      </Panel>

      {suggestion ? (
        <Panel padding="lg" className="border-of-ai-border">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 text-of-ai" aria-hidden />
            <h3 className="m-0 text-sm font-semibold text-of-ink">
              AI-suggested meeting details
            </h3>
            <Badge tone="ai">AI-suggested</Badge>
          </div>
          <p className="mt-2 m-0 text-sm leading-relaxed text-of-ink-secondary">
            {suggestion.rationale}
          </p>
          <p className="mt-2 m-0 text-xs text-of-ink-muted">
            {suggestion.scheduleNote} Simulated date is{' '}
            {formatDisplayDate(simulatedToday)}.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted sm:col-span-2">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted sm:col-span-2">
              Purpose
              <textarea
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                rows={2}
                className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
              Date
              <input
                type="date"
                value={meetingDate}
                onChange={(event) => setMeetingDate(event.target.value)}
                className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
              Start time
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
              Duration (minutes)
              <input
                type="number"
                min={15}
                step={15}
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(Number(event.target.value))
                }
                className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              />
            </label>
            <div>
              <p className="m-0 text-xs font-medium text-of-ink-muted">End time</p>
              <p className="mt-2 text-sm font-medium text-of-ink">
                {endTime ?? '—'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
              Attendees
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {MEETING_REQUIRED_ATTENDEE_IDS.map((id) => {
                const persona = getPersonaById(id)
                const locked = id === 'radhe-shyam'
                const checked = coreAttendees.includes(id)
                return (
                  <label
                    key={id}
                    className="inline-flex items-start gap-2 text-sm text-of-ink-secondary"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked || pending}
                      onChange={() => toggleCoreAttendee(id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium text-of-ink">
                        {personaDisplayName(id)}
                      </span>
                      {persona ? ` — ${persona.role}` : null}
                      {locked ? ' (organizer)' : null}
                    </span>
                  </label>
                )
              })}
              <label className="inline-flex items-start gap-2 text-sm text-of-ink-secondary">
                <input
                  type="checkbox"
                  checked={includeOptional}
                  disabled={pending}
                  onChange={(event) => setIncludeOptional(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-of-ink">
                    {personaDisplayName(MEETING_OPTIONAL_ATTENDEE_ID)}
                  </span>
                  {' — Solution Architect (optional)'}
                </span>
              </label>
            </div>
          </div>

          <label className="mt-4 flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
            Agenda (one item per line)
            <textarea
              value={agendaText}
              onChange={(event) => setAgendaText(event.target.value)}
              rows={5}
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm leading-relaxed text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={handleConfirm}
              className="inline-flex rounded-lg bg-of-primary px-4 py-2 text-sm font-semibold text-white hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60"
            >
              Confirm Meeting
            </button>
            <Badge tone="primary">Human review required</Badge>
          </div>
          {confirmError ? (
            <p className="mt-2 m-0 text-sm font-medium text-rose-700" role="alert">
              {confirmError}
            </p>
          ) : null}
        </Panel>
      ) : null}
    </div>
  )
}
