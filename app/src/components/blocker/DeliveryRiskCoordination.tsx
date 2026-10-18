import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type {
  BlockerResolutionRecord,
  CollaborationChannelId,
  ConfirmedMeetingRecord,
  CoordinationActionId,
} from '../../types/simulation'
import {
  AI_STAKEHOLDER_UPDATE_DRAFT,
  BUILD7_MEETING_HANDOFF,
  COORDINATION_ACTIONS,
  DEFAULT_NEXT_UPDATE_NOTE,
  getCoordinationAction,
  STAKEHOLDER_RECIPIENT_ID,
} from '../../data/blockerCoordinationDataset'
import { ScheduledMeetingAssociation } from '../meetings/ScheduledMeetingAssociation'
import { getDiagnosticDirection } from '../../data/blockerTroubleshootingDataset'
import { BLOCKED_TECHNICAL_DETAIL } from '../../data/followUpDataset'
import { formatDisplayDate, formatDisplayDateTime } from '../../lib/format'
import type { DeliveryRequest } from '../../types/delivery'
import { Badge, HealthBadge, StatusBadge } from '../ui/Badge'

interface DeliveryRiskCoordinationProps {
  request: DeliveryRequest
  blockerResolution: BlockerResolutionRecord
  channelId: CollaborationChannelId
  meeting: ConfirmedMeetingRecord | undefined
  canCoordinate: boolean
  onSaveCoordination: (actionIds: CoordinationActionId[]) => boolean
  onConfirmCommunication: (input: {
    message: string
    recipientId: typeof STAKEHOLDER_RECIPIENT_ID
    nextUpdateNote: string | null
    actionIds: CoordinationActionId[]
  }) => boolean
}

export function DeliveryRiskCoordination({
  request,
  blockerResolution,
  channelId,
  meeting,
  canCoordinate,
  onSaveCoordination,
  onConfirmCommunication,
}: DeliveryRiskCoordinationProps) {
  const confirmed =
    blockerResolution.stakeholderCommunication.decisionState === 'confirmed'
  const troubleshooting = blockerResolution.troubleshooting
  const [selectedActions, setSelectedActions] = useState<CoordinationActionId[]>(
    blockerResolution.coordination.selectedActionIds,
  )
  const [message, setMessage] = useState(
    blockerResolution.stakeholderCommunication.confirmedMessage ??
      AI_STAKEHOLDER_UPDATE_DRAFT,
  )
  const [includeNextUpdate, setIncludeNextUpdate] = useState(
    Boolean(blockerResolution.stakeholderCommunication.nextUpdateNote),
  )
  const [nextUpdateNote, setNextUpdateNote] = useState(
    blockerResolution.stakeholderCommunication.nextUpdateNote ??
      DEFAULT_NEXT_UPDATE_NOTE,
  )
  const [recipientConfirmed, setRecipientConfirmed] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const toggleAction = (id: CoordinationActionId) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  if (confirmed) {
    const planned = blockerResolution.coordination.selectedActionIds
      .map((id) => getCoordinationAction(id))
      .filter(Boolean)

    return (
      <section className="rounded-xl border border-of-primary-border bg-of-primary-soft/30 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-sm font-semibold text-of-ink">
            Stakeholder communication confirmed
          </h3>
          <Badge tone="primary">Human decision</Badge>
        </div>
        <p className="mt-2 m-0 text-sm text-of-ink-secondary">
          Business update confirmed for John Harrison via {channelId === 'slack' ? 'Slack' : 'Teams'}{' '}
          presentation channel.
        </p>
        <blockquote className="mt-3 m-0 rounded-lg border border-of-border bg-of-surface px-3 py-3 text-sm leading-relaxed text-of-ink">
          {blockerResolution.stakeholderCommunication.confirmedMessage}
        </blockquote>
        <div className="mt-4">
          <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Planned coordination steps
          </p>
          <ul className="mt-2 mb-0 list-disc space-y-1 pl-5 text-sm text-of-ink-secondary">
            {planned.map((action) => (
              <li key={action!.id}>
                <span className="font-medium text-of-ink">{action!.title}</span>
                {' — '}
                {action!.detail}
              </li>
            ))}
          </ul>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-of-ink-muted">
              Responsible coordinator
            </dt>
            <dd className="mt-1 text-sm font-medium text-of-ink">Radhe Shyam</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-of-ink-muted">
              Next update commitment
            </dt>
            <dd className="mt-1 text-sm font-medium text-of-ink">
              {blockerResolution.stakeholderCommunication.nextUpdateNote ??
                'Not specified'}
            </dd>
          </div>
        </dl>
        {blockerResolution.stakeholderCommunication.confirmedAt ? (
          <p className="mt-3 m-0 text-xs text-of-ink-muted">
            Confirmed{' '}
            {formatDisplayDateTime(
              blockerResolution.stakeholderCommunication.confirmedAt,
            )}
          </p>
        ) : null}
        {meeting ? (
          <div className="mt-4">
            <ScheduledMeetingAssociation meeting={meeting} />
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-of-ai-border bg-of-ai-soft/40 px-3 py-3">
            <p className="m-0 text-sm text-of-ink-secondary">
              {BUILD7_MEETING_HANDOFF}
            </p>
            <Link
              to="/meetings"
              className="mt-2 inline-flex text-sm font-semibold text-of-ai hover:underline"
            >
              Coordinate Resolution Meeting
            </Link>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-sm font-semibold text-of-ink">
            Delivery risk — REQ1235
          </h3>
          <StatusBadge status={request.workflowStatus} />
          <HealthBadge health={request.deliveryHealth} />
        </div>
        <p className="mt-2 m-0 text-sm text-of-ink-secondary">
          Target {formatDisplayDate(request.targetDate)} is two days away.
          Workflow is Blocked and delivery health is At Risk.
        </p>
        <p className="mt-1 m-0 text-sm text-of-ink-secondary">
          Primary owner: Radhe Shyam · Developer: Ajay Raj
        </p>
        <div className="mt-3 rounded-lg border border-of-border bg-of-surface px-3 py-2">
          <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Original technical blocker
          </p>
          <p className="mt-1 m-0 text-sm leading-relaxed text-of-ink-secondary">
            {BLOCKED_TECHNICAL_DETAIL}
          </p>
        </div>
        {troubleshooting.decisionState === 'recorded' ? (
          <div className="mt-3 rounded-lg border border-of-ai-border bg-of-ai-soft/50 px-3 py-2">
            <p className="m-0 text-xs font-semibold tracking-wide text-of-ai uppercase">
              Ajay&apos;s troubleshooting progress
            </p>
            <p className="mt-1 m-0 text-sm font-medium text-of-ink">
              {
                getDiagnosticDirection(troubleshooting.selectedDirectionId!)
                  ?.title
              }
            </p>
            <p className="mt-1 m-0 text-sm text-of-ink-secondary">
              {troubleshooting.progressNote}
            </p>
            {troubleshooting.needsIntegrationAssist ? (
              <p className="mt-1 m-0 text-xs text-of-ink-muted">
                Integration Lead assistance flagged (suggestion only—not an
                assignment).
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 m-0 text-sm text-of-ink-muted">
            Ajay has not yet recorded troubleshooting progress. You can still
            plan coordination and confirm a business update.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-of-ai-border bg-gradient-to-br from-of-surface to-of-ai-soft/40 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-of-ai" aria-hidden />
          <h3 className="m-0 text-sm font-semibold text-of-ink">
            AI coordination recommendations
          </h3>
          <Badge tone="ai">Suggestions</Badge>
        </div>
        <p className="mt-2 m-0 text-xs text-of-ai">
          Select actions to retain as planned coordination steps. Nothing is
          assigned or sent automatically.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {COORDINATION_ACTIONS.map((action) => {
            const checked = selectedActions.includes(action.id)
            return (
              <label
                key={action.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 ${
                  checked
                    ? 'border-of-ai-border bg-of-ai-soft'
                    : 'border-of-border bg-of-surface'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!canCoordinate || pending}
                  onChange={() => toggleAction(action.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-of-ink">
                    {action.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-of-ink-secondary">
                    {action.detail}
                  </span>
                </span>
              </label>
            )
          })}
        </div>

        {selectedActions.length > 0 ? (
          <div className="mt-4 rounded-lg border border-of-border bg-of-canvas/40 px-3 py-3">
            <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
              Planned coordination steps
            </p>
            <ul className="mt-2 mb-0 list-disc space-y-1 pl-5 text-sm text-of-ink-secondary">
              {selectedActions.map((id) => {
                const action = getCoordinationAction(id)
                return action ? (
                  <li key={id}>
                    <span className="font-medium text-of-ink">
                      {action.title}
                    </span>
                  </li>
                ) : null
              })}
            </ul>
          </div>
        ) : null}

        {canCoordinate ? (
          <button
            type="button"
            disabled={pending || selectedActions.length === 0}
            onClick={() => {
              setPending(true)
              setError(null)
              const ok = onSaveCoordination(selectedActions)
              setPending(false)
              if (!ok) {
                setError('Select at least one coordination action to save.')
              }
            }}
            className="mt-3 inline-flex rounded-lg border border-of-border bg-of-surface px-3 py-2 text-xs font-semibold text-of-ink hover:bg-of-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60"
          >
            Save planned actions
          </button>
        ) : null}
      </div>

      <div className="rounded-xl border border-of-ai-border bg-of-surface px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-of-ai" aria-hidden />
          <h3 className="m-0 text-sm font-semibold text-of-ink">
            Client update draft
          </h3>
          <Badge tone="ai">AI draft — human review required</Badge>
        </div>
        <p className="mt-2 m-0 text-sm text-of-ink-secondary">
          Edit the business-friendly wording before confirming. This draft is
          not visible to John until you confirm it.
        </p>
        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
          Message to John Harrison
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            disabled={!canCoordinate || pending}
            className="rounded-lg border border-of-border bg-of-canvas/40 px-3 py-2 text-sm leading-relaxed text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60"
          />
        </label>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <label className="flex items-start gap-3 text-sm leading-snug text-of-ink-secondary">
              <input
                type="checkbox"
                checked={recipientConfirmed}
                disabled={!canCoordinate || pending}
                onChange={(event) =>
                  setRecipientConfirmed(event.target.checked)
                }
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span className="min-w-0">
                Confirm recipient: John Harrison (Business Owner)
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm leading-snug text-of-ink-secondary">
              <input
                type="checkbox"
                checked={includeNextUpdate}
                disabled={!canCoordinate || pending}
                onChange={(event) =>
                  setIncludeNextUpdate(event.target.checked)
                }
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span className="min-w-0">Include next-update commitment</span>
            </label>
          </div>

          {includeNextUpdate ? (
            <input
              type="text"
              value={nextUpdateNote}
              onChange={(event) => setNextUpdateNote(event.target.value)}
              disabled={!canCoordinate || pending}
              className="w-full rounded-lg border border-of-border bg-of-canvas/40 px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60"
            />
          ) : null}

          {canCoordinate ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!recipientConfirmed) {
                    setError('Confirm John Harrison as the recipient.')
                    return
                  }
                  if (selectedActions.length === 0) {
                    setError('Select at least one planned coordination action.')
                    return
                  }
                  setPending(true)
                  setError(null)
                  const ok = onConfirmCommunication({
                    message,
                    recipientId: STAKEHOLDER_RECIPIENT_ID,
                    nextUpdateNote: includeNextUpdate
                      ? nextUpdateNote.trim() || DEFAULT_NEXT_UPDATE_NOTE
                      : null,
                    actionIds: selectedActions,
                  })
                  if (!ok) {
                    setError(
                      'Unable to confirm. Check the message, recipient, and planned actions.',
                    )
                    setPending(false)
                  }
                }}
                className="inline-flex w-full items-center justify-center rounded-lg bg-of-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60 sm:w-auto"
              >
                Confirm stakeholder update
              </button>
            </div>
          ) : (
            <p className="m-0 text-sm text-of-ink-secondary">
              Stakeholder confirmation is available to Radhe Shyam.
            </p>
          )}
          {error ? (
            <p className="m-0 text-sm font-medium text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
