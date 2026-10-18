import { useMemo, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import { IntakeAccessUnavailable } from '../components/intake/IntakeAccessUnavailable'
import { IntakeAlreadySubmitted } from '../components/intake/IntakeAlreadySubmitted'
import { IntakeConfirmation } from '../components/intake/IntakeConfirmation'
import { IntakeConversation } from '../components/intake/IntakeConversation'
import { StructuredRequestPanel } from '../components/intake/StructuredRequestPanel'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import { canCreateRequest } from '../data/capabilities'
import {
  applyClarifyAnswerToDraft,
  createWelcomeMessages,
  emptyIntakeDraft,
  firstNameFromPersonaName,
  INTAKE_CLARIFY_STEPS,
  isClarifyComplete,
  isUnrecognizedIntakeInput,
  type IntakeChatMessage,
} from '../data/intakeScript'
import type { StructuredRequirements } from '../types/simulation'
import { MAIN_REQUEST_ID } from '../types/simulation'

type IntakePhase = 'clarify' | 'review' | 'confirmation'

interface IntakeState {
  phase: IntakePhase
  stepIndex: number
  messages: IntakeChatMessage[]
  draft: StructuredRequirements
  notice: string | null
  messageSeq: number
  sessionKey: string
  firstName: string
}

type IntakeAction =
  | { type: 'answer'; text: string; viaSample: boolean }
  | { type: 'update_draft'; draft: StructuredRequirements }
  | { type: 'confirm_requirements' }
  | { type: 'submitted' }
  | { type: 'restart'; firstName: string }

function nextMessageId(seq: number): { id: string; nextSeq: number } {
  return { id: `msg-${seq}`, nextSeq: seq + 1 }
}

function intakeReducer(state: IntakeState, action: IntakeAction): IntakeState {
  switch (action.type) {
    case 'answer': {
      if (state.phase !== 'clarify') return state
      if (state.stepIndex >= INTAKE_CLARIFY_STEPS.length) return state

      if (!action.viaSample && isUnrecognizedIntakeInput(action.text)) {
        let seq = state.messageSeq
        const human = nextMessageId(seq)
        seq = human.nextSeq
        const system = nextMessageId(seq)
        seq = system.nextSeq
        return {
          ...state,
          notice:
            'I can help with the guided intake path. Please use a sample answer to continue.',
          messageSeq: seq,
          messages: [
            ...state.messages,
            { id: human.id, role: 'human', text: action.text.trim() },
            {
              id: system.id,
              role: 'system',
              text: 'Try the sample answer above to continue.',
            },
          ],
        }
      }

      const step = INTAKE_CLARIFY_STEPS[state.stepIndex]
      const answerText = action.viaSample ? step.sampleAnswer : action.text.trim()
      let seq = state.messageSeq
      const humanMsg = nextMessageId(seq)
      seq = humanMsg.nextSeq

      const draft = applyClarifyAnswerToDraft(state.draft, step.id)
      const nextIndex = state.stepIndex + 1
      const messages: IntakeChatMessage[] = [
        ...state.messages,
        { id: humanMsg.id, role: 'human', text: answerText },
      ]

      if (isClarifyComplete(nextIndex)) {
        const aiMsg = nextMessageId(seq)
        seq = aiMsg.nextSeq
        messages.push({
          id: aiMsg.id,
          role: 'ai',
          text: 'I have enough detail to draft the structured request. Review the fields on the right, edit anything that needs adjustment, then confirm before submitting.',
        })
        return {
          ...state,
          phase: 'review',
          stepIndex: nextIndex,
          draft,
          messages,
          notice: null,
          messageSeq: seq,
        }
      }

      const nextStep = INTAKE_CLARIFY_STEPS[nextIndex]
      const aiMsg = nextMessageId(seq)
      seq = aiMsg.nextSeq
      messages.push({
        id: aiMsg.id,
        role: 'ai',
        text: nextStep.aiQuestion,
      })

      return {
        ...state,
        stepIndex: nextIndex,
        draft,
        messages,
        notice: null,
        messageSeq: seq,
      }
    }
    case 'update_draft':
      return {
        ...state,
        draft: { ...action.draft, confirmationState: 'ai_draft' },
      }
    case 'confirm_requirements':
      return {
        ...state,
        draft: { ...state.draft, confirmationState: 'human_confirmed' },
      }
    case 'submitted':
      return { ...state, phase: 'confirmation' }
    case 'restart':
      return createInitialState(action.firstName)
    default:
      return state
  }
}

function createInitialState(firstName: string): IntakeState {
  return {
    phase: 'clarify',
    stepIndex: 0,
    messages: createWelcomeMessages(firstName),
    draft: emptyIntakeDraft(),
    notice: null,
    messageSeq: 100,
    sessionKey: `intake-${Date.now()}`,
    firstName,
  }
}

function requirementsReady(draft: StructuredRequirements): boolean {
  return Boolean(
    draft.title.trim() &&
      draft.businessObjective.trim() &&
      draft.highValueThreshold.trim() &&
      draft.approverRole.trim() &&
      draft.pendingRejectedBehavior.trim() &&
      draft.acceptanceCriteria.some((item) => item.trim()),
  )
}

export function IntakePage() {
  const { currentPersona } = useRole()
  const { hasMainRequest, mainRequestId, submitIntake } = useSimulation()
  const allowed = canCreateRequest(currentPersona.id)
  const firstName = firstNameFromPersonaName(currentPersona.name)

  const [state, dispatch] = useReducer(
    intakeReducer,
    firstName,
    createInitialState,
  )
  const [inputValue, setInputValue] = useState('')
  const [wasConfirmed, setWasConfirmed] = useState(false)
  const [intakeStartedAsJohn] = useState(() => allowed)

  const reconfirmHint = useMemo(() => {
    if (
      state.phase === 'review' &&
      wasConfirmed &&
      state.draft.confirmationState === 'ai_draft'
    ) {
      return 'Requirements changed — please confirm again before submitting.'
    }
    return null
  }, [state.phase, wasConfirmed, state.draft.confirmationState])

  // Keep greeting in sync if John switches names before answering (persona stay).
  if (
    allowed &&
    state.phase === 'clarify' &&
    state.stepIndex === 0 &&
    state.messages.length === 1 &&
    state.firstName !== firstName
  ) {
    dispatch({ type: 'restart', firstName })
  }

  // After Reset Demo from confirmation, restore a fresh intake session.
  if (allowed && state.phase === 'confirmation' && !hasMainRequest) {
    dispatch({ type: 'restart', firstName })
    if (inputValue) setInputValue('')
    if (wasConfirmed) setWasConfirmed(false)
  }

  if (state.phase === 'confirmation' && hasMainRequest) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <IntakeConfirmation requestId={MAIN_REQUEST_ID} />
      </div>
    )
  }

  if (!allowed) {
    const interrupted =
      intakeStartedAsJohn ||
      state.stepIndex > 0 ||
      state.phase === 'review'
    return (
      <div className="mx-auto w-full max-w-3xl">
        <IntakeAccessUnavailable interrupted={interrupted} />
      </div>
    )
  }

  if (hasMainRequest && mainRequestId) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <IntakeAlreadySubmitted requestId={mainRequestId} />
      </div>
    )
  }

  const currentStep =
    state.phase === 'clarify' && state.stepIndex < INTAKE_CLARIFY_STEPS.length
      ? INTAKE_CLARIFY_STEPS[state.stepIndex]
      : null

  const handleSubmitInput = () => {
    if (!allowed || !inputValue.trim()) return
    dispatch({ type: 'answer', text: inputValue, viaSample: false })
    setInputValue('')
  }

  const handleUseSample = () => {
    if (!allowed) return
    dispatch({ type: 'answer', text: '', viaSample: true })
    setInputValue('')
  }

  const handleSubmitRequest = () => {
    if (!allowed) return
    if (state.draft.confirmationState !== 'human_confirmed') return
    if (!requirementsReady(state.draft)) return
    const accepted = submitIntake(state.draft)
    if (accepted) {
      dispatch({ type: 'submitted' })
    }
  }

  const handleConfirm = () => {
    if (!allowed) return
    dispatch({ type: 'confirm_requirements' })
    setWasConfirmed(true)
  }

  const handleDraftChange = (draft: StructuredRequirements) => {
    if (!allowed) return
    dispatch({ type: 'update_draft', draft })
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="m-0 text-xs font-semibold tracking-[0.08em] text-of-primary uppercase">
          Intelligent Intake
        </p>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-of-ink">
          New enhancement request
        </h1>
        <p className="m-0 text-sm text-of-ink-muted">
          Northstar Financial Services · Customer Onboarding Portal
        </p>
        <Link
          to="/overview"
          className="mt-1 w-fit text-sm font-semibold text-of-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
        >
          Back to Overview
        </Link>
      </header>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <IntakeConversation
            key={state.sessionKey}
            messages={state.messages}
            currentStep={currentStep}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmitInput={handleSubmitInput}
            onUseSample={handleUseSample}
            disabled={state.phase !== 'clarify'}
            notice={state.notice}
            speakerName={currentPersona.name}
          />

          {state.phase === 'review' ? (
            <section className="rounded-xl border border-of-border bg-of-surface p-5 shadow-of-panel">
              <h2 className="m-0 text-base font-semibold text-of-ink">
                Review and submit
              </h2>
              <p className="mt-1 text-sm text-of-ink-muted">
                Edit the structured fields, confirm they reflect the business
                need, then submit the request.
              </p>

              {!requirementsReady(state.draft) ? (
                <p className="mt-3 text-sm text-amber-800">
                  Complete title, business objective, threshold, approver,
                  pending/rejected handling, and at least one acceptance
                  criterion before confirming.
                </p>
              ) : null}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {state.draft.confirmationState !== 'human_confirmed' ? (
                  <button
                    type="button"
                    disabled={!requirementsReady(state.draft)}
                    onClick={handleConfirm}
                    className="rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
                  >
                    Confirm requirements
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitRequest}
                    className="rounded-lg bg-of-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
                  >
                    Submit request
                  </button>
                )}
              </div>

              {state.draft.confirmationState === 'human_confirmed' ? (
                <p className="mt-3 text-xs text-of-ink-muted">
                  Requirements confirmed. Editing a field will ask you to
                  confirm again before submit.
                </p>
              ) : (
                <p className="mt-3 text-xs text-of-ink-muted">
                  Confirm your review before submission.
                </p>
              )}
            </section>
          ) : null}
        </div>

        <StructuredRequestPanel
          draft={state.draft}
          editable={state.phase === 'review'}
          onChange={handleDraftChange}
          reconfirmHint={reconfirmHint}
        />
      </div>
    </div>
  )
}
