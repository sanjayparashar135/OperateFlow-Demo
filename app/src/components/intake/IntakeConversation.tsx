import { useEffect, useRef, type ReactNode } from 'react'
import { Sparkles, User } from 'lucide-react'
import type { IntakeChatMessage, IntakeClarifyStep } from '../../data/intakeScript'
import { useAssistantReveal } from '../../hooks/useAssistantReveal'
import { Panel, PanelHeader } from '../ui/Panel'

interface IntakeConversationProps {
  messages: IntakeChatMessage[]
  currentStep: IntakeClarifyStep | null
  inputValue: string
  onInputChange: (value: string) => void
  onSubmitInput: () => void
  onUseSample: () => void
  disabled?: boolean
  notice?: string | null
  speakerName: string
}

export function IntakeConversation({
  messages,
  currentStep,
  inputValue,
  onInputChange,
  onSubmitInput,
  onUseSample,
  disabled = false,
  notice = null,
  speakerName,
}: IntakeConversationProps) {
  const reveal = useAssistantReveal(messages)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const interactionLocked = disabled || reveal.isBusy

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [
    messages,
    reveal.typingMessageId,
    reveal.revealingMessageId,
    reveal.revealedText,
    reveal.fullyVisibleIds,
  ])

  return (
    <Panel className="flex h-full min-h-[28rem] flex-col">
      <PanelHeader
        title="AI Intake Assistant"
        description="Describe your enhancement and I'll help structure the requirements."
      />

      <div
        ref={scrollerRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-of-border bg-of-canvas/70 p-3"
        aria-live="polite"
      >
        {messages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            speakerName={speakerName}
            reveal={reveal}
          />
        ))}
      </div>

      {notice ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {notice}
        </p>
      ) : null}

      {currentStep && !disabled ? (
        <div className="mt-4 space-y-3 border-t border-of-border pt-4">
          <button
            type="button"
            onClick={onUseSample}
            disabled={interactionLocked}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-of-ai-border bg-of-ai-soft px-3 py-2.5 text-sm font-semibold text-of-ai transition-colors hover:bg-of-ai-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-ai disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {currentStep.sampleLabel}
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="intake-reply">
              Your reply
            </label>
            <input
              id="intake-reply"
              value={inputValue}
              disabled={interactionLocked}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  if (!interactionLocked) onSubmitInput()
                }
              }}
              placeholder="Type a reply, or use the sample answer above"
              className="min-w-0 flex-1 rounded-lg border border-of-border bg-of-surface px-3 py-2 text-sm text-of-ink shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={onSubmitInput}
              disabled={interactionLocked}
              className="rounded-lg bg-of-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-of-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      ) : null}
    </Panel>
  )
}

function MessageRow({
  message,
  speakerName,
  reveal,
}: {
  message: IntakeChatMessage
  speakerName: string
  reveal: ReturnType<typeof useAssistantReveal>
}) {
  if (message.role === 'system') {
    return (
      <p className="m-0 text-center text-xs text-of-ink-muted">{message.text}</p>
    )
  }

  if (message.role === 'human') {
    return (
      <Bubble align="human" label={speakerName}>
        {message.text}
      </Bubble>
    )
  }

  if (reveal.typingMessageId === message.id) {
    return (
      <Bubble align="ai" label="AI Intake Assistant">
        <TypingIndicator />
      </Bubble>
    )
  }

  if (reveal.revealingMessageId === message.id) {
    return (
      <Bubble align="ai" label="AI Intake Assistant">
        <span>{reveal.revealedText}</span>
        <span className="of-reveal-caret" aria-hidden="true" />
      </Bubble>
    )
  }

  if (!reveal.fullyVisibleIds.has(message.id)) {
    return null
  }

  return (
    <Bubble align="ai" label="AI Intake Assistant">
      {message.text}
    </Bubble>
  )
}

function Bubble({
  align,
  label,
  children,
}: {
  align: 'ai' | 'human'
  label: string
  children: ReactNode
}) {
  const isAi = align === 'ai'
  return (
    <div
      className={`flex gap-2 ${isAi ? 'items-start' : 'flex-row-reverse items-start'}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isAi ? 'bg-of-ai-soft text-of-ai' : 'bg-of-primary-soft text-of-primary'
        }`}
      >
        {isAi ? (
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        ) : (
          <User className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isAi
            ? 'border border-of-ai-border bg-of-ai-soft text-of-ink'
            : 'border border-of-primary-border bg-of-primary-soft text-of-ink'
        }`}
      >
        <p
          className={`m-0 mb-1 text-[10px] font-semibold tracking-wide uppercase ${
            isAi ? 'text-of-ai' : 'text-of-primary'
          }`}
        >
          {label}
        </p>
        <div className="m-0">{children}</div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <span className="of-typing" aria-label="Assistant is typing">
      <span className="of-typing-dot" />
      <span className="of-typing-dot" />
      <span className="of-typing-dot" />
    </span>
  )
}
