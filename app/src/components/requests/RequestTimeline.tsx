import type { TimelineEvent } from '../../types/simulation'
import { formatDisplayDateTime } from '../../lib/format'
import { Badge } from '../ui/Badge'

interface RequestTimelineProps {
  events: TimelineEvent[]
}

function sourceLabel(source: TimelineEvent['source']): string {
  switch (source) {
    case 'ai_suggested':
      return 'AI-suggested'
    case 'human':
      return 'Human'
    default:
      return 'System record'
  }
}

function sourceTone(
  source: TimelineEvent['source'],
): 'ai' | 'primary' | 'neutral' {
  switch (source) {
    case 'ai_suggested':
      return 'ai'
    case 'human':
      return 'primary'
    default:
      return 'neutral'
  }
}

export function RequestTimeline({ events }: RequestTimelineProps) {
  const ordered = [...events].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  )

  if (ordered.length === 0) {
    return (
      <p className="m-0 text-sm text-of-ink-muted">
        No timeline events for this request yet.
      </p>
    )
  }

  return (
    <ol className="m-0 flex list-none flex-col gap-4 p-0">
      {ordered.map((event) => (
        <li
          key={event.id}
          className="relative border-l-2 border-of-border pl-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-sm font-semibold text-of-ink">{event.title}</p>
            <Badge tone={sourceTone(event.source)}>
              {sourceLabel(event.source)}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-of-ink-muted">
            {formatDisplayDateTime(event.timestamp)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-of-ink-secondary">
            {event.detail}
          </p>
        </li>
      ))}
    </ol>
  )
}
