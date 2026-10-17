import type { PersonaId } from './persona'

export type LifecycleStage =
  | 'Intelligent Intake'
  | 'Approval & Planning'
  | 'Execution'
  | 'UAT & Release'
  | 'Hypercare & Closure'

export type WorkflowStatus =
  | 'Draft'
  | 'Awaiting Review'
  | 'Awaiting Technical Review'
  | 'Pending Approval'
  | 'In Progress'
  | 'Blocked'
  | 'In UAT'
  | 'Ready for Release'
  | 'In Hypercare'
  | 'Closed'

export type DeliveryHealth = 'On Track' | 'At Risk' | 'Delayed'

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

/** Participant relationships — distinct from primaryOwnerId. */
export interface RequestParties {
  requesterId?: PersonaId
  technicalLeadId?: PersonaId
  developerId?: PersonaId
  integrationLeadId?: PersonaId
  deliveryOwnerId?: PersonaId
}

export interface DeliveryRequest {
  id: string
  title: string
  application: string
  /** Accountable primary owner; not synonymous with RequestParties roles. */
  primaryOwnerId: PersonaId
  parties: RequestParties
  lifecycleStage: LifecycleStage
  workflowStatus: WorkflowStatus
  deliveryHealth: DeliveryHealth
  priority: Priority
  targetDate: string
  lastUpdated: string
  summary: string
  /** Contextual explanations when attention is warranted; not the sole attention signal. */
  attentionReasons?: string[]
}

export type ActivityCategory =
  | 'review'
  | 'assignment'
  | 'progress'
  | 'uat_release'
  | 'risk'

export interface ActivityEntry {
  id: string
  requestId: string
  timestamp: string
  actor: string
  category: ActivityCategory
  message: string
}

export type InsightKind = 'deadline' | 'approval' | 'risk'

export interface DeliveryInsight {
  id: string
  kind: InsightKind
  title: string
  /** Business context; evidence IDs are always re-scoped for the visible set. */
  detail: string
  requestIds: string[]
}

export type RequestsViewPreset =
  | 'all'
  | 'active'
  | 'attention'
  | 'at-risk'
  | 'execution'

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  'Intelligent Intake',
  'Approval & Planning',
  'Execution',
  'UAT & Release',
  'Hypercare & Closure',
]

export const PENDING_REVIEW_STATUSES: WorkflowStatus[] = [
  'Awaiting Review',
  'Awaiting Technical Review',
  'Pending Approval',
]

export const DEADLINE_ATTENTION_DAYS = 3

export const REQUESTS_VIEW_PRESETS: RequestsViewPreset[] = [
  'all',
  'active',
  'attention',
  'at-risk',
  'execution',
]
