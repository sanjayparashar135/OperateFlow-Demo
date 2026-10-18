import { Link } from 'react-router-dom'
import { Panel, PanelHeader } from '../ui/Panel'

interface IntakeAlreadySubmittedProps {
  requestId: string
}

export function IntakeAlreadySubmitted({
  requestId,
}: IntakeAlreadySubmittedProps) {
  return (
    <Panel>
      <PanelHeader
        title="Request already submitted"
        description={`${requestId} is already in your portfolio for this session.`}
      />
      <p className="m-0 text-sm leading-relaxed text-of-ink-secondary">
        Open the request to continue, or use <strong>Reset Demo</strong> in the
        header to clear the submission and restore the initial portfolio. Your
        selected persona is kept.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          to={`/requests/${requestId}`}
          className="inline-flex items-center justify-center rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        >
          Open {requestId}
        </Link>
        <Link
          to="/overview"
          className="inline-flex items-center justify-center rounded-lg border border-of-border bg-of-surface px-4 py-2.5 text-sm font-semibold text-of-ink transition-colors hover:bg-of-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        >
          Back to Overview
        </Link>
      </div>
    </Panel>
  )
}
