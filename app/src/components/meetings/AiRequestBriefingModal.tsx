import { useEffect, useId, useRef } from 'react'
import { Sparkles, X } from 'lucide-react'
import type { MeetingRequestBriefing } from '../../data/meetingBriefingHelpers'
import {
  Badge,
  HealthBadge,
  StageBadge,
  StatusBadge,
} from '../ui/Badge'

interface AiRequestBriefingModalProps {
  briefing: MeetingRequestBriefing | null
  open: boolean
  onClose: () => void
}

export function AiRequestBriefingModal({
  briefing,
  open,
  onClose,
}: AiRequestBriefingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && briefing) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open, briefing])

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(100%,36rem)] max-h-[min(90vh,44rem)] rounded-xl border border-of-border bg-of-surface p-0 shadow-of-panel backdrop:bg-of-ink/40"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      {briefing ? (
        <div className="flex max-h-[min(90vh,44rem)] flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-of-border px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="ai">AI-generated briefing</Badge>
                <Badge tone="neutral">Read-only</Badge>
              </div>
              <h2
                id={titleId}
                className="mt-2 text-lg font-semibold tracking-tight text-of-ink"
              >
                AI Request Briefing
              </h2>
              <p className="mt-1 text-sm text-of-ink-muted">
                Meeting-ready summary for {briefing.requestId} · Scripted
                simulation content
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-of-ink-muted transition-colors hover:bg-of-canvas hover:text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              aria-label="Close AI request briefing"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <section>
              <h3 className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Request overview
              </h3>
              <p className="mt-1.5 m-0 text-sm font-semibold text-of-ink">
                {briefing.title}
              </p>
              <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-of-ink-muted">Client</dt>
                  <dd className="mt-0.5 m-0 font-medium text-of-ink">
                    {briefing.client}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-of-ink-muted">Application</dt>
                  <dd className="mt-0.5 m-0 font-medium text-of-ink">
                    {briefing.application}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-of-ink-muted">Request</dt>
                  <dd className="mt-0.5 m-0 font-medium text-of-ink">
                    {briefing.requestId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-of-ink-muted">Linked Jira</dt>
                  <dd className="mt-0.5 m-0 font-medium text-of-ink">
                    {briefing.jiraId}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Business objective
              </h3>
              <p className="mt-1.5 m-0 text-sm leading-relaxed text-of-ink-secondary">
                {briefing.businessObjective}
              </p>
            </section>

            <section>
              <h3 className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Progress so far
              </h3>
              <ol className="mt-2 mb-0 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-of-ink-secondary">
                {briefing.progressMilestones.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>

            {briefing.currentBlocker ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-3">
                <h3 className="m-0 text-xs font-semibold tracking-wide text-amber-900 uppercase">
                  Current blocker
                </h3>
                <p className="mt-1.5 m-0 text-sm leading-relaxed text-amber-950">
                  {briefing.currentBlocker}
                </p>
              </section>
            ) : null}

            <section className="rounded-lg border border-of-ai-border bg-of-ai-soft/40 px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-of-ai" aria-hidden />
                <h3 className="m-0 text-xs font-semibold tracking-wide text-of-ai uppercase">
                  AI-assisted technical context
                </h3>
              </div>
              <p className="mt-1.5 m-0 text-xs text-of-ink-muted">
                Suggested investigation directions — not confirmed root causes.
              </p>
              <ul className="mt-2 mb-0 list-none space-y-2 p-0">
                {briefing.diagnosticDirections.map((direction) => (
                  <li key={direction.id}>
                    <p className="m-0 text-sm font-medium text-of-ink">
                      {direction.title}
                    </p>
                    <p className="mt-0.5 m-0 text-sm leading-relaxed text-of-ink-secondary">
                      {direction.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Meeting objective
              </h3>
              <p className="mt-1.5 m-0 text-sm leading-relaxed text-of-ink-secondary">
                {briefing.meetingObjective}
              </p>
            </section>

            <section className="rounded-lg border border-of-border bg-of-canvas/50 px-3 py-3">
              <h3 className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
                Current delivery position
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StageBadge stage={briefing.lifecycleStage} />
                <StatusBadge status={briefing.workflowStatus} />
                <HealthBadge health={briefing.deliveryHealth} />
              </div>
              <p className="mt-2 m-0 text-sm text-of-ink-secondary">
                Target {briefing.targetDateLabel} under assessment. The blocker
                is not resolved.
              </p>
            </section>
          </div>

          <div className="flex justify-end border-t border-of-border px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg bg-of-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
