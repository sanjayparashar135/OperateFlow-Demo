import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type {
  BlockerResolutionRecord,
  DiagnosticDirectionId,
} from '../../types/simulation'
import {
  DIAGNOSTIC_DIRECTIONS,
  getDiagnosticDirection,
  TROUBLESHOOTING_ISSUE_SUMMARY,
} from '../../data/blockerTroubleshootingDataset'
import { BLOCKED_TECHNICAL_DETAIL } from '../../data/followUpDataset'
import { formatDisplayDateTime } from '../../lib/format'
import { Badge } from '../ui/Badge'

interface TroubleshootingAssistantProps {
  blockerResolution: BlockerResolutionRecord
  canRecord: boolean
  onRecord: (input: {
    directionId: DiagnosticDirectionId
    progressNote: string
    needsIntegrationAssist: boolean
  }) => boolean
}

export function TroubleshootingAssistant({
  blockerResolution,
  canRecord,
  onRecord,
}: TroubleshootingAssistantProps) {
  const recorded =
    blockerResolution.troubleshooting.decisionState === 'recorded'
  const [selectedId, setSelectedId] = useState<DiagnosticDirectionId | null>(
    blockerResolution.troubleshooting.selectedDirectionId,
  )
  const [progressNote, setProgressNote] = useState(
    blockerResolution.troubleshooting.progressNote ?? '',
  )
  const [needsAssist, setNeedsAssist] = useState(
    blockerResolution.troubleshooting.needsIntegrationAssist,
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const selected = selectedId ? getDiagnosticDirection(selectedId) : undefined

  if (recorded) {
    const direction = getDiagnosticDirection(
      blockerResolution.troubleshooting.selectedDirectionId!,
    )
    return (
      <section className="rounded-xl border border-of-ai-border bg-gradient-to-br from-of-surface to-of-ai-soft/40 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-of-ai" aria-hidden />
          <h3 className="m-0 text-sm font-semibold text-of-ink">
            Troubleshooting progress recorded
          </h3>
          <Badge tone="ai">Human decision</Badge>
        </div>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-of-ink-muted">Direction</dt>
            <dd className="mt-1 text-sm font-medium text-of-ink">
              {direction?.title ?? 'Selected direction'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-of-ink-muted">
              Integration assist
            </dt>
            <dd className="mt-1 text-sm font-medium text-of-ink">
              {blockerResolution.troubleshooting.needsIntegrationAssist
                ? 'Flagged for Integration Lead support'
                : 'Not requested'}
            </dd>
          </div>
        </dl>
        <p className="mt-3 m-0 text-sm leading-relaxed text-of-ink-secondary">
          {blockerResolution.troubleshooting.progressNote}
        </p>
        {blockerResolution.troubleshooting.recordedAt ? (
          <p className="mt-2 m-0 text-xs text-of-ink-muted">
            Recorded{' '}
            {formatDisplayDateTime(
              blockerResolution.troubleshooting.recordedAt,
            )}
          </p>
        ) : null}
        <p className="mt-3 m-0 text-xs text-of-ink-muted">
          Diagnostic suggestions remain hypotheses—not confirmed root causes.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-of-ai-border bg-gradient-to-br from-of-surface to-of-ai-soft/40 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-of-ai" aria-hidden />
        <h3 className="m-0 text-sm font-semibold text-of-ink">
          AI Troubleshooting Assistant
        </h3>
        <Badge tone="ai">AI-suggested</Badge>
      </div>
      <p className="mt-2 m-0 text-sm leading-relaxed text-of-ink-secondary">
        Ajay, here is a concise summary of the reported blocker and a few
        diagnostic directions to consider.
      </p>
      <p className="mt-2 m-0 text-sm leading-relaxed text-of-ink">
        {TROUBLESHOOTING_ISSUE_SUMMARY}
      </p>
      <div className="mt-3 rounded-lg border border-of-border bg-of-canvas/50 px-3 py-2">
        <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
          Original technical evidence
        </p>
        <p className="mt-1 m-0 text-sm leading-relaxed text-of-ink-secondary">
          {BLOCKED_TECHNICAL_DETAIL}
        </p>
      </div>
      <p className="mt-3 m-0 text-xs font-medium text-of-ai">
        These are diagnostic hypotheses, not confirmed root causes.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {DIAGNOSTIC_DIRECTIONS.map((direction) => {
          const active = selectedId === direction.id
          return (
            <button
              key={direction.id}
              type="button"
              disabled={!canRecord || pending}
              onClick={() => {
                setSelectedId(direction.id)
                setError(null)
              }}
              className={`rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-ai disabled:opacity-60 ${
                active
                  ? 'border-of-ai-border bg-of-ai-soft'
                  : 'border-of-border bg-of-surface hover:border-of-ai-border'
              }`}
            >
              <p className="m-0 text-sm font-semibold text-of-ink">
                {direction.title}
              </p>
              <p className="mt-1 m-0 text-xs leading-relaxed text-of-ink-secondary">
                {direction.summary}
              </p>
            </button>
          )
        })}
      </div>

      {selected ? (
        <div className="mt-4 rounded-lg border border-of-ai-border bg-of-surface px-3 py-3">
          <p className="m-0 text-xs font-semibold tracking-wide text-of-ai uppercase">
            Suggested diagnostic steps
          </p>
          <ul className="mt-2 mb-0 list-disc space-y-1 pl-5 text-sm text-of-ink-secondary">
            {selected.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {canRecord ? (
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
            Progress note / next action
            <textarea
              value={progressNote}
              onChange={(event) => setProgressNote(event.target.value)}
              rows={2}
              placeholder="Record what you will check next…"
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            />
          </label>
          <label className="inline-flex items-start gap-2 text-sm text-of-ink-secondary">
            <input
              type="checkbox"
              checked={needsAssist}
              onChange={(event) => setNeedsAssist(event.target.checked)}
              className="mt-1"
            />
            <span>
              Flag that Integration Lead assistance (Sreekanth Mamdekar) may be
              needed. This does not assign ownership.
            </span>
          </label>
          <button
            type="button"
            disabled={pending || !selectedId}
            onClick={() => {
              if (!selectedId) return
              setPending(true)
              setError(null)
              const ok = onRecord({
                directionId: selectedId,
                progressNote,
                needsIntegrationAssist: needsAssist,
              })
              if (!ok) {
                setError(
                  'Unable to record progress. Select a direction and enter a short note.',
                )
                setPending(false)
              }
            }}
            className="inline-flex w-fit rounded-lg bg-of-primary px-4 py-2 text-sm font-semibold text-white hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:opacity-60"
          >
            Record progress
          </button>
          {error ? (
            <p className="m-0 text-sm font-medium text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 m-0 text-sm text-of-ink-secondary">
          Troubleshooting recording is available to Ajay Raj.
        </p>
      )}
    </section>
  )
}
