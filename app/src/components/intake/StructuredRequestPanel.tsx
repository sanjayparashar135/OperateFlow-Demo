import type { StructuredRequirements } from '../../types/simulation'
import { Badge } from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'

interface StructuredRequestPanelProps {
  draft: StructuredRequirements
  editable?: boolean
  onChange?: (next: StructuredRequirements) => void
  /** Concise note when edits invalidate a prior confirmation. */
  reconfirmHint?: string | null
}

export function StructuredRequestPanel({
  draft,
  editable = false,
  onChange,
  reconfirmHint = null,
}: StructuredRequestPanelProps) {
  const update = <K extends keyof StructuredRequirements>(
    key: K,
    value: StructuredRequirements[K],
  ) => {
    if (!onChange) return
    onChange({ ...draft, [key]: value, confirmationState: 'ai_draft' })
  }

  const criteriaText = draft.acceptanceCriteria.join('\n')
  const hasContent = Boolean(
    draft.title.trim() ||
      draft.businessObjective.trim() ||
      draft.highValueThreshold.trim(),
  )

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Structured request"
        description={
          hasContent
            ? "Your request is taking shape. As we chat, I'll organize your answers into clear business requirements."
            : 'Requirements will appear here as the conversation progresses.'
        }
        action={
          <Badge
            tone={
              draft.confirmationState === 'human_confirmed' ? 'success' : 'ai'
            }
          >
            {draft.confirmationState === 'human_confirmed'
              ? 'Human-confirmed'
              : 'AI-suggested draft'}
          </Badge>
        }
      />

      {reconfirmHint ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          {reconfirmHint}
        </p>
      ) : null}

      <div className="space-y-3">
        <Field
          label="Title"
          value={draft.title}
          editable={editable}
          onChange={(value) => update('title', value)}
        />
        <Field label="Category" value={draft.category || '—'} />
        <Field label="Application" value={draft.application || '—'} />
        <Field
          label="Business objective"
          value={draft.businessObjective}
          editable={editable}
          multiline
          onChange={(value) => update('businessObjective', value)}
        />
        <Field
          label="High-value threshold"
          value={draft.highValueThreshold}
          editable={editable}
          onChange={(value) => update('highValueThreshold', value)}
        />
        <Field
          label="Approver"
          value={draft.approverRole}
          editable={editable}
          onChange={(value) => update('approverRole', value)}
        />
        <Field
          label="Activation constraint"
          value={draft.activationConstraint}
          editable={editable}
          multiline
          onChange={(value) => update('activationConstraint', value)}
        />
        <Field
          label="Pending / rejected handling"
          value={draft.pendingRejectedBehavior}
          editable={editable}
          multiline
          onChange={(value) => update('pendingRejectedBehavior', value)}
        />
        <Field
          label="Acceptance criteria"
          value={criteriaText}
          editable={editable}
          multiline
          hint={editable ? 'One criterion per line' : undefined}
          onChange={(value) =>
            update(
              'acceptanceCriteria',
              value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
        />
        <Field label="Requester" value="John Harrison" />
        <Field label="Priority" value={draft.priority} />
      </div>
    </Panel>
  )
}

function Field({
  label,
  value,
  editable = false,
  multiline = false,
  hint,
  onChange,
}: {
  label: string
  value: string
  editable?: boolean
  multiline?: boolean
  hint?: string
  onChange?: (value: string) => void
}) {
  if (editable && onChange) {
    const shared =
      'mt-1 w-full rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary'
    return (
      <label className="block">
        <span className="text-xs font-medium text-of-ink-muted">{label}</span>
        {multiline ? (
          <textarea
            className={`${shared} min-h-[5.5rem] resize-y`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <input
            className={shared}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        {hint ? (
          <span className="mt-1 block text-xs text-of-ink-muted">{hint}</span>
        ) : null}
      </label>
    )
  }

  return (
    <div>
      <p className="m-0 text-xs font-medium text-of-ink-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-of-ink">
        {value.trim() ? value : '—'}
      </p>
    </div>
  )
}
