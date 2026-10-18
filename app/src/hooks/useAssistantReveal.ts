import { useEffect, useMemo, useRef, useState } from 'react'
import type { IntakeChatMessage } from '../data/intakeScript'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function typingDelayMs(): number {
  if (prefersReducedMotion()) return 0
  return 500
}

function revealDurationMs(textLength: number): number {
  if (prefersReducedMotion()) return 0
  return Math.min(1400, Math.max(850, 700 + textLength * 10))
}

export interface AssistantRevealState {
  /** AI message ids that have finished revealing. */
  fullyVisibleIds: ReadonlySet<string>
  typingMessageId: string | null
  revealingMessageId: string | null
  revealedText: string
  isBusy: boolean
}

/**
 * Progressive reveal for assistant messages only.
 * Human/system messages are always shown immediately by the UI.
 * Remount (via React key) to restart a conversation cleanly.
 */
export function useAssistantReveal(
  messages: IntakeChatMessage[],
): AssistantRevealState {
  const [fullyVisibleIds, setFullyVisibleIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [revealingMessageId, setRevealingMessageId] = useState<string | null>(
    null,
  )
  const [revealedText, setRevealedText] = useState('')
  const busyRef = useRef(false)
  const completedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (busyRef.current) return

    const nextAi = messages.find(
      (message) =>
        message.role === 'ai' && !completedRef.current.has(message.id),
    )
    if (!nextAi) return

    busyRef.current = true
    let cancelled = false
    let didComplete = false
    const timers: number[] = []

    const complete = () => {
      if (cancelled || didComplete) return
      didComplete = true
      completedRef.current.add(nextAi.id)
      setFullyVisibleIds(new Set(completedRef.current))
      setTypingMessageId(null)
      setRevealingMessageId(null)
      setRevealedText('')
      busyRef.current = false
    }

    const startReveal = () => {
      if (cancelled) return

      if (prefersReducedMotion() || revealDurationMs(nextAi.text.length) === 0) {
        complete()
        return
      }

      setTypingMessageId(null)
      setRevealingMessageId(nextAi.id)
      setRevealedText('')

      const duration = revealDurationMs(nextAi.text.length)
      const startedAt = performance.now()

      const tick = () => {
        if (cancelled) return
        const progress = Math.min(1, (performance.now() - startedAt) / duration)
        const count = Math.max(1, Math.floor(progress * nextAi.text.length))
        setRevealedText(nextAi.text.slice(0, count))
        if (progress < 1) {
          timers.push(window.setTimeout(tick, 30))
        } else {
          complete()
        }
      }

      timers.push(window.setTimeout(tick, 16))
    }

    setTypingMessageId(nextAi.id)
    setRevealingMessageId(null)
    setRevealedText('')

    const delay = typingDelayMs()
    if (delay <= 0) {
      startReveal()
    } else {
      timers.push(window.setTimeout(startReveal, delay))
    }

    return () => {
      cancelled = true
      for (const timer of timers) {
        window.clearTimeout(timer)
      }
      if (!didComplete) {
        busyRef.current = false
      }
      setTypingMessageId(null)
      setRevealingMessageId(null)
      setRevealedText('')
    }
  }, [messages, fullyVisibleIds])

  const isBusy = typingMessageId !== null || revealingMessageId !== null

  return useMemo(
    () => ({
      fullyVisibleIds,
      typingMessageId,
      revealingMessageId,
      revealedText,
      isBusy,
    }),
    [
      fullyVisibleIds,
      typingMessageId,
      revealingMessageId,
      revealedText,
      isBusy,
    ],
  )
}
