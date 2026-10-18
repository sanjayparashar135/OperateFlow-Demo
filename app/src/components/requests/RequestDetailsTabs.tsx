import type { DeliveryRequest } from '../../types/delivery'
import type { PersonaId } from '../../types/persona'
import {
  REQUEST_DETAILS_TABS,
  type RequestDetailsTabId,
} from '../../data/requestDetailsTabs'
import type {
  EstimationDecision,
  LinkedRecord,
  StructuredRequirements,
  TimelineEvent,
} from '../../types/simulation'
import { formatDisplayDate } from '../../lib/format'
import { getPartyDisplayRows } from '../../lib/requestParties'
import {
  EstimationPanel,
  type EstimationFormSubmit,
} from '../estimation/EstimationPanel'
import {
  HealthBadge,
  PriorityBadge,
  StageBadge,
  StatusBadge,
} from '../ui/Badge'
import { RequestTimeline } from './RequestTimeline'

export type { RequestDetailsTabId }
export type { EstimationFormSubmit }

interface RequestDetailsTabsProps {
  tab: RequestDetailsTabId
  onTabChange: (tab: RequestDetailsTabId) => void
  request: DeliveryRequest
  requirements: StructuredRequirements | null
  linkedRecords: LinkedRecord[]
  timelineEvents: TimelineEvent[]
  attentionReasons: string[]
  estimation: EstimationDecision | null
  estimationAvailable: boolean
  personaId: PersonaId
  onConfirmEstimation: (input: EstimationFormSubmit) => boolean
}

export function RequestDetailsTabs({
  tab,
  onTabChange,
  request,
  requirements,
  linkedRecords,
  timelineEvents,
  attentionReasons,
  estimation,
  estimationAvailable,
  personaId,
  onConfirmEstimation,
}: RequestDetailsTabsProps) {
  return (
    <div>
      <div
        role="tablist"
        aria-label="Request detail sections"
        className="flex flex-wrap gap-1 border-b border-of-border"
      >
        {REQUEST_DETAILS_TABS.map((item) => {
          const selected = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`request-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`rounded-t-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary ${
                selected
                  ? 'border border-b-0 border-of-border bg-of-surface text-of-primary'
                  : 'text-of-ink-muted hover:text-of-ink'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`request-tab-${tab}`}
        className="rounded-b-xl rounded-tr-xl border border-t-0 border-of-border bg-of-surface p-5 shadow-of-panel"
      >
        {tab === 'summary' ? (
          <SummaryPanel
            request={request}
            linkedRecords={linkedRecords}
            attentionReasons={attentionReasons}
          />
        ) : null}
        {tab === 'requirements' ? (
          <RequirementsPanel requirements={requirements} />
        ) : null}
        {tab === 'activity' ? (
          <RequestTimeline events={timelineEvents} />
        ) : null}
        {tab === 'linked' ? (
          <LinkedRecordsPanel records={linkedRecords} />
        ) : null}
        {tab === 'estimation' ? (
          estimation ? (
            <EstimationPanel
              estimation={estimation}
              personaId={personaId}
              available={estimationAvailable}
              onConfirm={onConfirmEstimation}
            />
          ) : (
            <EstimationUnavailable />
          )
        ) : null}
      </div>
    </div>
  )
}

function SummaryPanel({
  request,
  linkedRecords,
  attentionReasons,
}: {
  request: DeliveryRequest
  linkedRecords: LinkedRecord[]
  attentionReasons: string[]
}) {
  const parties = getPartyDisplayRows(request)

  return (
    <div className="space-y-5">
      <div>
        <p className="m-0 text-xs font-semibold tracking-wide text-of-primary uppercase">
          {request.id}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-of-ink">
          {request.title}
        </h2>
        <p className="mt-1 text-sm text-of-ink-muted">{request.application}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <PriorityBadge priority={request.priority} />
        <StageBadge stage={request.lifecycleStage} />
        <StatusBadge status={request.workflowStatus} />
        <HealthBadge health={request.deliveryHealth} />
      </div>

      <p className="m-0 text-sm leading-relaxed text-of-ink-secondary">
        {request.summary}
      </p>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {parties.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-medium text-of-ink-muted">{row.label}</dt>
            <dd className="mt-1 text-sm font-medium text-of-ink">{row.name}</dd>
          </div>
        ))}
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">Target date</dt>
          <dd className="mt-1 text-sm font-medium text-of-ink">
            {formatDisplayDate(request.targetDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-of-ink-muted">Last updated</dt>
          <dd className="mt-1 text-sm font-medium text-of-ink">
            {formatDisplayDate(request.lastUpdated)}
          </dd>
        </div>
      </dl>

      {linkedRecords.length > 0 ? (
        <div>
          <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            Linked records
          </p>
          <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
            {linkedRecords.map((record) => (
              <li
                key={record.id}
                className="rounded-md bg-of-canvas px-2.5 py-1 text-xs font-semibold text-of-ink ring-1 ring-of-border"
              >
                {record.system}: {record.id}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {attentionReasons.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
          <p className="m-0 text-xs font-semibold tracking-wide text-amber-900 uppercase">
            Why this needs attention
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-950">
            {attentionReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function RequirementsPanel({
  requirements,
}: {
  requirements: StructuredRequirements | null
}) {
  if (!requirements) {
    return (
      <p className="m-0 text-sm text-of-ink-muted">
        No structured requirements are available for this request.
      </p>
    )
  }

  return (
    <dl className="grid grid-cols-1 gap-4">
      <ReqField label="Title" value={requirements.title} />
      <ReqField label="Category" value={requirements.category} />
      <ReqField label="Application" value={requirements.application} />
      <ReqField
        label="Business objective"
        value={requirements.businessObjective}
      />
      <ReqField
        label="High-value threshold"
        value={requirements.highValueThreshold}
      />
      <ReqField label="Approver" value={requirements.approverRole} />
      <ReqField
        label="Activation constraint"
        value={requirements.activationConstraint}
      />
      <ReqField
        label="Pending / rejected handling"
        value={requirements.pendingRejectedBehavior}
      />
      <div>
        <dt className="text-xs font-medium text-of-ink-muted">
          Acceptance criteria
        </dt>
        <dd className="mt-1">
          <ul className="list-disc space-y-1 pl-4 text-sm text-of-ink">
            {requirements.acceptanceCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </dd>
      </div>
      <ReqField label="Priority" value={requirements.priority} />
      <ReqField
        label="Confirmation"
        value={
          requirements.confirmationState === 'human_confirmed'
            ? 'Human-confirmed'
            : 'AI draft'
        }
      />
    </dl>
  )
}

function ReqField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-of-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-of-ink">{value}</dd>
    </div>
  )
}

function LinkedRecordsPanel({ records }: { records: LinkedRecord[] }) {
  if (records.length === 0) {
    return (
      <p className="m-0 text-sm text-of-ink-muted">
        No linked enterprise records for this request.
      </p>
    )
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {records.map((record) => (
        <li
          key={record.id}
          className="rounded-lg border border-of-border bg-of-canvas/50 px-4 py-3"
        >
          <p className="m-0 text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
            {record.system}
          </p>
          <p className="mt-1 text-sm font-semibold text-of-ink">
            {record.label}: {record.id}
          </p>
          <p className="mt-1 text-sm text-of-ink-secondary">{record.detail}</p>
        </li>
      ))}
    </ul>
  )
}

function EstimationUnavailable() {
  return (
    <div className="rounded-lg border border-dashed border-of-border bg-of-canvas/50 px-4 py-6 text-center">
      <p className="m-0 text-sm font-semibold text-of-ink">Estimation</p>
      <p className="mt-2 text-sm leading-relaxed text-of-ink-muted">
        AI-assisted estimation is not available for this portfolio request.
      </p>
    </div>
  )
}
