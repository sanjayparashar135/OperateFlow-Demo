import { Link } from 'react-router-dom'
import { Panel, PanelHeader } from '../ui/Panel'

interface IntakeAccessUnavailableProps {
  /** When true, intake was in progress before the persona changed. */
  interrupted?: boolean
}

export function IntakeAccessUnavailable({
  interrupted = false,
}: IntakeAccessUnavailableProps) {
  return (
    <Panel>
      <PanelHeader
        title="Intake unavailable for this role"
        description={
          interrupted
            ? 'New requests can only be submitted by the Business Requester. Switch back to John Harrison to continue this intake, or return to Requests.'
            : 'New enhancement requests can be started by John Harrison, Business Requester.'
        }
      />
      <p className="m-0 text-sm leading-relaxed text-of-ink-secondary">
        You can still browse requests visible to your current role from the
        portfolio views.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/requests"
          className="inline-flex items-center justify-center rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        >
          Back to Requests
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
