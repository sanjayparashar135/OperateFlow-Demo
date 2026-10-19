import type {
  BlockerResolutionRecord,
  ConfirmedMeetingRecord,
} from '../../types/simulation'
import { getCoordinationAction } from '../../data/blockerCoordinationDataset'
import { formatDisplayDate } from '../../lib/format'
import type { DeliveryRequest } from '../../types/delivery'
import { Badge, HealthBadge } from '../ui/Badge'

interface BusinessStatusPanelProps {
  request: DeliveryRequest
  blockerResolution: BlockerResolutionRecord
  meeting: ConfirmedMeetingRecord | undefined
}

export function BusinessStatusPanel({
  request,
  blockerResolution,
  meeting,
}: BusinessStatusPanelProps) {
  const communication = blockerResolution.stakeholderCommunication
  const confirmed = communication.decisionState === 'confirmed'
  const planned = blockerResolution.coordination.selectedActionIds
    .map((id) => getCoordinationAction(id))
    .filter(Boolean)

  if (!confirmed) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-sm font-semibold text-of-ink">
            Delivery status
          </h3>
          <HealthBadge health={request.deliveryHealth} />
          <Badge tone="warning">Update pending</Badge>
        </div>
        <p className="mt-3 m-0 text-sm leading-relaxed text-of-ink-secondary">
          John, delivery for this request is currently{' '}
          <span className="font-semibold text-of-ink">At Risk</span>. An
          updated business assessment from the project manager is pending.
        </p>
        <p className="mt-2 m-0 text-sm text-of-ink-muted">
          Target date {formatDisplayDate(request.targetDate)} remains under
          review. No revised commitment has been confirmed.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-of-primary-border bg-of-primary-soft/35 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 text-sm font-semibold text-of-ink">
          Approved business status
        </h3>
        <HealthBadge health={request.deliveryHealth} />
        <Badge tone="primary">Confirmed by Radhe Shyam</Badge>
      </div>

      <blockquote className="mt-4 m-0 rounded-lg border border-of-border bg-of-surface px-4 py-3 text-sm leading-relaxed text-of-ink">
        {communication.confirmedMessage}
      </blockquote>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">
            Affected delivery activity
          </dt>
          <dd className="mt-1 text-sm text-of-ink">
            Integration testing for the new approval workflow cannot be
            completed while the regional approval dependency is under
            investigation.
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">
            Delivery coordinator
          </dt>
          <dd className="mt-1 text-sm font-medium text-of-ink">Radhe Shyam</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">Target date</dt>
          <dd className="mt-1 text-sm text-of-ink">
            {formatDisplayDate(request.targetDate)} — under assessment; not
            automatically changed.
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">
            Next planned update
          </dt>
          <dd className="mt-1 text-sm text-of-ink">
            {communication.nextUpdateNote ?? 'Not specified'}
          </dd>
        </div>
      </dl>

      {planned.length > 0 ? (
        <div className="mt-4">
          <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Actions underway / planned
          </p>
          <ul className="mt-2 mb-0 list-disc space-y-1 pl-5 text-sm text-of-ink-secondary">
            {planned.map((action) => (
              <li key={action!.id}>{action!.title}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {meeting ? (
        <div className="mt-4 rounded-lg border border-of-border bg-of-canvas/40 px-3 py-3">
          <p className="m-0 text-sm font-semibold text-of-ink">
            Technical coordination underway
          </p>
          <p className="mt-1 m-0 text-sm text-of-ink-secondary">
            A technical coordination meeting has been arranged for{' '}
            {formatDisplayDate(meeting.meetingDate)} to progress investigation
            of the delivery risk. The{' '}
            {formatDisplayDate(request.targetDate)} target remains under
            assessment.
          </p>
        </div>
      ) : null}
    </section>
  )
}
