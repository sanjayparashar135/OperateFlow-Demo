import { CheckCircle2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../../types/simulation'
import { Panel, PanelHeader } from '../ui/Panel'

interface IntakeConfirmationProps {
  requestId: string
}

export function IntakeConfirmation({ requestId }: IntakeConfirmationProps) {
  return (
    <Panel className="border-of-ai-border">
      <PanelHeader
        title="Request submitted"
        description="Your enhancement request is ready for technical review."
      />

      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <CheckCircle2
          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
          aria-hidden="true"
        />
        <div>
          <p className="m-0 text-sm font-semibold text-emerald-900">
            Request submitted successfully
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-950/90">
            {requestId} has been submitted and is awaiting technical review.
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-of-border bg-of-canvas/60 px-3 py-3">
          <dt className="text-xs font-medium text-of-ink-muted">ServiceNow</dt>
          <dd className="mt-1 text-sm font-semibold text-of-ink">
            {MAIN_REQUEST_ID}
          </dd>
        </div>
        <div className="rounded-lg border border-of-border bg-of-canvas/60 px-3 py-3">
          <dt className="text-xs font-medium text-of-ink-muted">Jira</dt>
          <dd className="mt-1 text-sm font-semibold text-of-ink">
            {MAIN_JIRA_ID}
          </dd>
          <p className="mt-1 text-xs text-of-ink-muted">
            Application Delivery queue — unassigned
          </p>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          to={`/requests/${requestId}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        >
          View Request
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-of-border bg-of-surface px-4 py-2.5 text-sm font-semibold text-of-ink transition-colors hover:bg-of-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        >
          Back to Overview
        </Link>
      </div>
    </Panel>
  )
}
