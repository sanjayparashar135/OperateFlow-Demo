import { useState, type FormEvent } from 'react'
import type { EstimationMode } from '../../types/simulation'
import { ESTIMATION_SUGGESTION } from '../../data/estimationDataset'

export interface EstimationFormSubmit {
  mode: EstimationMode
  confirmedHours?: number
  overrideJustification?: string
  confirmedApproach: string
}

interface EstimationDecisionFormProps {
  onConfirm: (input: EstimationFormSubmit) => boolean
  disabled?: boolean
}

export function EstimationDecisionForm({
  onConfirm,
  disabled = false,
}: EstimationDecisionFormProps) {
  const [mode, setMode] = useState<EstimationMode>('accepted')
  const [overrideHours, setOverrideHours] = useState(
    String(ESTIMATION_SUGGESTION.suggestedHours),
  )
  const [justification, setJustification] = useState('')
  const [approach, setApproach] = useState(
    ESTIMATION_SUGGESTION.defaultApproach,
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (disabled || submitting) return

    setError(null)
    setSubmitting(true)

    const payload: EstimationFormSubmit = {
      mode,
      confirmedApproach: approach,
    }

    if (mode === 'overridden') {
      const hours = Number(overrideHours)
      payload.confirmedHours = hours
      payload.overrideJustification = justification
    }

    const ok = onConfirm(payload)
    if (!ok) {
      setError(
        mode === 'overridden'
          ? 'Unable to confirm override. Provide a valid hour total and justification.'
          : 'Unable to confirm estimate. Try again or refresh the page.',
      )
      setSubmitting(false)
      return
    }
    setSubmitting(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-of-border bg-of-canvas/30 px-4 py-4"
    >
      <div>
        <h3 className="m-0 text-sm font-semibold text-of-ink">
          Solution architect review
        </h3>
        <p className="mt-1 text-sm text-of-ink-muted">
          Accept the suggested estimate or override with a revised total and
          justification. Confirming records the technical estimate only — not
          business approval.
        </p>
      </div>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="text-xs font-semibold tracking-wide text-of-ink-muted uppercase">
          Decision
        </legend>
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-of-border bg-of-surface px-3 py-2.5 text-sm has-[:checked]:border-of-ai-border has-[:checked]:bg-of-ai-soft/40">
          <input
            type="radio"
            name="estimation-mode"
            value="accepted"
            checked={mode === 'accepted'}
            onChange={() => setMode('accepted')}
            disabled={disabled}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold text-of-ink">
              Accept suggested estimate
            </span>
            <span className="mt-0.5 block text-of-ink-secondary">
              Confirm {ESTIMATION_SUGGESTION.suggestedHours} hours (
              {ESTIMATION_SUGGESTION.rangeMin}–
              {ESTIMATION_SUGGESTION.rangeMax} range).
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-of-border bg-of-surface px-3 py-2.5 text-sm has-[:checked]:border-of-ai-border has-[:checked]:bg-of-ai-soft/40">
          <input
            type="radio"
            name="estimation-mode"
            value="overridden"
            checked={mode === 'overridden'}
            onChange={() => setMode('overridden')}
            disabled={disabled}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold text-of-ink">Override estimate</span>
            <span className="mt-0.5 block text-of-ink-secondary">
              Enter a revised total. The AI-suggested breakdown remains as
              reference evidence only.
            </span>
          </span>
        </label>
      </fieldset>

      {mode === 'overridden' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
            Revised hours
            <input
              type="number"
              min={1}
              step={1}
              value={overrideHours}
              onChange={(event) => setOverrideHours(event.target.value)}
              disabled={disabled}
              required
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted sm:col-span-2">
            Justification
            <textarea
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              disabled={disabled}
              required
              rows={3}
              placeholder="Explain why the revised estimate differs from the suggestion."
              className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            />
          </label>
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-xs font-medium text-of-ink-muted">
        Proposed delivery approach
        <textarea
          value={approach}
          onChange={(event) => setApproach(event.target.value)}
          disabled={disabled}
          required
          rows={3}
          className="rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        />
      </label>

      {error ? (
        <p className="m-0 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={disabled || submitting}
          className="inline-flex items-center justify-center rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Confirming…' : 'Confirm technical estimate'}
        </button>
        <p className="m-0 text-xs text-of-ink-muted">
          Status will move to Pending Approval after confirmation.
        </p>
      </div>
    </form>
  )
}
