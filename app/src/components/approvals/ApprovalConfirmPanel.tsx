import { useState } from 'react'
import type { EstimationDecision } from '../../types/simulation'
import { getConfirmedEstimateSummary } from '../../data/approvalHelpers'
import { formatDisplayDate } from '../../lib/format'
import { Panel, PanelHeader } from '../ui/Panel'

interface ApprovalConfirmPanelProps {
  estimation: EstimationDecision
  targetDate: string
  onConfirm: () => boolean
  onCancel: () => void
}

export function ApprovalConfirmPanel({
  estimation,
  targetDate,
  onConfirm,
  onCancel,
}: ApprovalConfirmPanelProps) {
  const summary = getConfirmedEstimateSummary(estimation)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    const ok = onConfirm()
    if (!ok) {
      setError(
        'Unable to approve the estimate. Confirm technical review is complete and try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <Panel padding="lg" className="border-of-primary-border">
      <PanelHeader
        title="Approve estimate"
        description="Business approval of the confirmed technical estimate and delivery approach. Resource assignment happens separately."
      />

      <dl className="mt-4 m-0 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Request
          </dt>
          <dd className="mt-1 text-sm font-semibold text-of-ink">REQ1235</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Target date
          </dt>
          <dd className="mt-1 text-sm font-semibold text-of-ink">
            {formatDisplayDate(targetDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Confirmed estimate
          </dt>
          <dd className="mt-1 text-sm font-semibold text-of-ink">
            {summary.hours} hours · {summary.modeLabel}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Confirmed delivery approach
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-of-ink-secondary">
            {summary.approach}
          </dd>
        </div>
        {summary.overrideJustification ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
              Architect override justification
            </dt>
            <dd className="mt-1 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-amber-950">
              {summary.overrideJustification}
            </dd>
          </div>
        ) : null}
      </dl>

      {error ? (
        <p className="mt-3 m-0 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Approving…' : 'Approve estimate'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg border border-of-border bg-of-surface px-4 py-2.5 text-sm font-semibold text-of-ink-secondary hover:bg-of-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        >
          Cancel
        </button>
      </div>
    </Panel>
  )
}
