import { CalendarClock } from 'lucide-react'
import { SIMULATED_ADVANCE_DATE, SIMULATED_TODAY } from '../../data/simDate'
import { formatDisplayDate } from '../../lib/format'
import { Panel, PanelHeader } from '../ui/Panel'

interface AdvanceSimDateControlProps {
  simulatedToday: string
  canAdvance: boolean
  followUpOpen: boolean
  onAdvance: () => boolean
}

export function AdvanceSimDateControl({
  simulatedToday,
  canAdvance,
  followUpOpen,
  onAdvance,
}: AdvanceSimDateControlProps) {
  const advanced = simulatedToday === SIMULATED_ADVANCE_DATE

  return (
    <Panel padding="lg">
      <PanelHeader
        title="Simulated calendar"
        description="Advance the demo date to evaluate deadline-aware monitoring for REQ1235."
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="m-0 inline-flex items-center gap-2 text-sm text-of-ink">
          <CalendarClock className="h-4 w-4 text-of-primary" aria-hidden />
          Current simulated date:{' '}
          <strong>{formatDisplayDate(simulatedToday)}</strong>
        </p>
        {canAdvance ? (
          <button
            type="button"
            onClick={() => {
              onAdvance()
            }}
            className="inline-flex items-center justify-center rounded-lg bg-of-primary px-4 py-2 text-sm font-semibold text-white hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
          >
            Advance to {formatDisplayDate(SIMULATED_ADVANCE_DATE)}
          </button>
        ) : null}
      </div>
      {advanced ? (
        <p className="mt-3 m-0 text-sm text-of-ink-secondary">
          Simulated date advanced from {formatDisplayDate(SIMULATED_TODAY)}.
          {followUpOpen
            ? ' A proactive Teams-style follow-up is available under Follow-ups.'
            : ''}
        </p>
      ) : canAdvance ? (
        <p className="mt-3 m-0 text-sm text-of-ink-muted">
          REQ1235 is in Execution with a stale developer update. Advancing to
          October 21 triggers the two-day deadline follow-up.
        </p>
      ) : (
        <p className="mt-3 m-0 text-sm text-of-ink-muted">
          Approve delivery and assign Ajay Raj before advancing the simulated
          date.
        </p>
      )}
    </Panel>
  )
}
