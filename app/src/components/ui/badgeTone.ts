import type {
  DeliveryHealth,
  LifecycleStage,
  Priority,
  WorkflowStatus,
} from '../../types/delivery'

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'ai'
  | 'warning'
  | 'danger'
  | 'success'

export function healthTone(health: DeliveryHealth): BadgeTone {
  switch (health) {
    case 'At Risk':
      return 'danger'
    case 'Delayed':
      return 'warning'
    default:
      return 'success'
  }
}

export function statusTone(status: WorkflowStatus): BadgeTone {
  switch (status) {
    case 'Blocked':
      return 'danger'
    case 'Awaiting Review':
    case 'Awaiting Technical Review':
    case 'Pending Approval':
    case 'Approved — Awaiting Assignment':
      return 'warning'
    case 'Closed':
      return 'neutral'
    case 'Ready for Release':
    case 'In Hypercare':
      return 'ai'
    default:
      return 'primary'
  }
}

export function priorityTone(priority: Priority): BadgeTone {
  switch (priority) {
    case 'Critical':
      return 'danger'
    case 'High':
      return 'warning'
    case 'Low':
      return 'neutral'
    default:
      return 'primary'
  }
}

export function stageTone(_stage: LifecycleStage): BadgeTone {
  return 'primary'
}
