import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Hash, MessageSquare } from 'lucide-react'
import type {
  CollaborationChannelId,
  FollowUpRecord,
  FollowUpResponseKind,
} from '../../types/simulation'
import { MAIN_REQUEST_ID } from '../../types/simulation'
import { canRespondToFollowUp } from '../../data/capabilities'
import { getCollaborationChannel } from '../../data/collaborationChannel'
import type { PersonaId } from '../../types/persona'
import { formatDisplayDate, formatDisplayDateTime } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

interface TeamsFollowUpThreadProps {
  followUp: FollowUpRecord
  personaId: PersonaId
  simulatedToday: string
  /** Active presentation channel (defaults to the follow-up's stored channel). */
  channelId: CollaborationChannelId
  onRespond: (kind: FollowUpResponseKind, detail?: string) => boolean
}

const RESPONSE_LABELS: Record<FollowUpResponseKind, string> = {
  on_track: 'On Track',
  blocked: "I'm Blocked",
  completed: 'Completed',
  other: 'Other Update',
}

const QUICK_RESPONSES: FollowUpResponseKind[] = [
  'on_track',
  'blocked',
  'completed',
]

export function TeamsFollowUpThread({
  followUp,
  personaId,
  simulatedToday,
  channelId,
  onRespond,
}: TeamsFollowUpThreadProps) {
  const channel = getCollaborationChannel(channelId)
  const isSlack = channelId === 'slack'
  const canRespond =
    canRespondToFollowUp(personaId) && followUp.status === 'open'
  const [otherText, setOtherText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingKind, setPendingKind] = useState<FollowUpResponseKind | null>(
    null,
  )

  const handleRespond = (kind: FollowUpResponseKind) => {
    if (!canRespond || pendingKind) return
    setError(null)
    setPendingKind(kind)
    const detail = kind === 'other' ? otherText : undefined
    const ok = onRespond(kind, detail)
    if (!ok) {
      setError(
        kind === 'other'
          ? 'Enter a non-empty update before submitting.'
          : 'Unable to record the response. Try again.',
      )
      setPendingKind(null)
    }
  }

  const shellClass = isSlack
    ? 'rounded-xl border border-[#4a154b]/25 bg-[#f8f4f8] px-4 py-4'
    : 'rounded-xl border border-[#7b83eb]/40 bg-[#f5f6ff] px-4 py-4'
  const avatarClass = isSlack
    ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#4a154b] text-white'
    : 'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#6264a7] text-white'
  const bubbleClass = isSlack
    ? 'max-w-xl rounded-lg border border-[#d7c6d9] bg-white px-3 py-2.5 text-sm leading-relaxed text-of-ink'
    : 'max-w-xl rounded-lg rounded-tl-sm border border-[#c5c7ef] bg-white px-3 py-2.5 text-sm leading-relaxed text-of-ink'

  return (
    <Panel padding="lg">
      <PanelHeader
        title={`${channel.label} status check`}
        description={`Follow-up sent via ${channel.label} for JIRA-122345 before the October 23 target.`}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <Badge tone="primary">Delivery channel: {channel.label}</Badge>
        <span className="text-of-ink-muted">Client-approved collaboration platform</span>
      </div>

      <div className={shellClass}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={avatarClass}>
            {isSlack ? (
              <Hash className="h-4 w-4" aria-hidden />
            ) : (
              <MessageSquare className="h-4 w-4" aria-hidden />
            )}
          </span>
          <div>
            <p className="m-0 text-sm font-semibold text-of-ink">
              OperateFlow → Ajay Raj
            </p>
            <p className="m-0 text-xs text-of-ink-muted">
              {channel.label} · {formatDisplayDateTime(followUp.triggeredAt)}
            </p>
          </div>
          <Badge tone="primary" className="ml-auto">
            {followUp.status === 'open' ? 'Awaiting response' : 'Responded'}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          <div className={bubbleClass}>{followUp.message}</div>

          {followUp.status === 'responded' && followUp.responseKind ? (
            <div className="ml-auto max-w-xl rounded-lg rounded-tr-sm border border-of-border bg-of-primary-soft/50 px-3 py-2.5 text-sm leading-relaxed text-of-ink">
              <p className="m-0 text-xs font-semibold text-of-primary">
                Ajay Raj · {RESPONSE_LABELS[followUp.responseKind]}
              </p>
              <p className="mt-1 m-0">{followUp.responseDetail}</p>
              {followUp.respondedAt ? (
                <p className="mt-2 m-0 text-xs text-of-ink-muted">
                  {formatDisplayDateTime(followUp.respondedAt)}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {canRespond ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="m-0 text-sm text-of-ink-secondary">
            Simulated date is {formatDisplayDate(simulatedToday)}. Choose a
            status response for REQ1235.
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_RESPONSES.map((kind) => (
              <button
                key={kind}
                type="button"
                disabled={Boolean(pendingKind)}
                onClick={() => handleRespond(kind)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60 ${
                  kind === 'blocked'
                    ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border border-of-border bg-of-surface text-of-ink hover:bg-of-canvas'
                }`}
              >
                {RESPONSE_LABELS[kind]}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-of-border bg-of-canvas/40 px-3 py-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
              Other Update
              <textarea
                value={otherText}
                onChange={(event) => setOtherText(event.target.value)}
                rows={2}
                placeholder="Share a short status note…"
                className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              />
            </label>
            <button
              type="button"
              disabled={Boolean(pendingKind)}
              onClick={() => handleRespond('other')}
              className="mt-2 inline-flex rounded-lg border border-of-border bg-of-surface px-3 py-2 text-xs font-semibold text-of-ink hover:bg-of-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60"
            >
              Submit Other Update
            </button>
          </div>

          {error ? (
            <p className="m-0 text-sm font-medium text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : followUp.status === 'open' ? (
        <p className="mt-4 m-0 text-sm text-of-ink-secondary">
          Awaiting Ajay Raj&apos;s response. You can review the thread; response
          actions are available to the assigned developer.
        </p>
      ) : followUp.responseKind === 'blocked' ? (
        <div className="mt-4 rounded-lg border border-of-ai-border bg-of-ai-soft/40 px-3 py-3">
          <p className="m-0 text-sm text-of-ink-secondary">
            Blocker recorded. Continue with AI-assisted troubleshooting,
            delivery coordination, or business status on Request Details.
          </p>
          <Link
            to={`/requests/${MAIN_REQUEST_ID}`}
            className="mt-2 inline-flex text-sm font-semibold text-of-ai hover:underline"
          >
            Open blocker resolution
          </Link>
        </div>
      ) : null}
    </Panel>
  )
}
