import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { DeliveryRequest } from '../../types/delivery'
import { formatDisplayDate } from '../../lib/format'
import { getPartyDisplayRows } from '../../lib/requestParties'
import {
  HealthBadge,
  PriorityBadge,
  StageBadge,
  StatusBadge,
} from '../ui/Badge'

interface RequestSummaryModalProps {
  request: DeliveryRequest | null
  reasons?: string[]
  open: boolean
  onClose: () => void
}

export function RequestSummaryModal({
  request,
  reasons = [],
  open,
  onClose,
}: RequestSummaryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && request) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open, request])

  const partyRows = request ? getPartyDisplayRows(request) : []

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(100%,32rem)] rounded-xl border border-of-border bg-of-surface p-0 shadow-of-panel backdrop:bg-of-ink/40"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      {request ? (
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="m-0 text-xs font-semibold tracking-wide text-of-primary uppercase">
                {request.id}
              </p>
              <h2
                id={titleId}
                className="mt-1 text-lg font-semibold tracking-tight text-of-ink"
              >
                {request.title}
              </h2>
              <p className="mt-1 text-sm text-of-ink-muted">
                {request.application}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-of-ink-muted transition-colors hover:bg-of-canvas hover:text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
              aria-label="Close request summary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-of-ink-secondary">
            {request.summary}
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {partyRows.map((row) => (
              <SummaryField key={row.label} label={row.label} value={row.name} />
            ))}
            <SummaryField
              label="Target date"
              value={formatDisplayDate(request.targetDate)}
            />
            <SummaryField
              label="Last updated"
              value={formatDisplayDate(request.lastUpdated)}
            />
            <div>
              <dt className="text-xs font-medium text-of-ink-muted">Priority</dt>
              <dd className="mt-1">
                <PriorityBadge priority={request.priority} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-of-ink-muted">
                Lifecycle stage
              </dt>
              <dd className="mt-1">
                <StageBadge stage={request.lifecycleStage} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-of-ink-muted">
                Workflow status
              </dt>
              <dd className="mt-1">
                <StatusBadge status={request.workflowStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-of-ink-muted">
                Delivery health
              </dt>
              <dd className="mt-1">
                <HealthBadge health={request.deliveryHealth} />
              </dd>
            </div>
          </dl>

          {reasons.length > 0 ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
              <p className="m-0 text-xs font-semibold tracking-wide text-amber-900 uppercase">
                Why this needs attention
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-950">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 border-t border-of-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-xs text-of-ink-muted">
              Quick preview — open full details for requirements, timeline, and
              linked records.
            </p>
            <Link
              to={`/requests/${request.id}`}
              onClick={onClose}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-of-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            >
              Open Full Details
            </Link>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-of-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-of-ink">{value}</dd>
    </div>
  )
}
