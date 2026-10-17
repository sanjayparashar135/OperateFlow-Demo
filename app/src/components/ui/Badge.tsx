import type { ReactNode } from 'react'
import type {
  DeliveryHealth,
  LifecycleStage,
  Priority,
  WorkflowStatus,
} from '../../types/delivery'
import {
  healthTone,
  priorityTone,
  stageTone,
  statusTone,
  type BadgeTone,
} from './badgeTone'

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-of-ink-secondary ring-of-border',
  primary: 'bg-of-primary-soft text-of-primary ring-of-primary-border',
  ai: 'bg-of-ai-soft text-of-ai ring-of-ai-border',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function HealthBadge({ health }: { health: DeliveryHealth }) {
  return <Badge tone={healthTone(health)}>{health}</Badge>
}

export function StatusBadge({ status }: { status: WorkflowStatus }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>
}

export function StageBadge({ stage }: { stage: LifecycleStage }) {
  return <Badge tone={stageTone(stage)}>{stage}</Badge>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priorityTone(priority)}>{priority}</Badge>
}
