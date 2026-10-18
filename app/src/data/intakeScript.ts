import type { StructuredRequirements } from '../types/simulation'
import { buildDefaultStructuredRequirements } from './mainRequestFactory'

export const SAMPLE_OPENING_PROMPT =
  'We need an extra approval step for high-value customers before their accounts go live.'

export type IntakeClarifyStepId =
  | 'opening'
  | 'high_value'
  | 'approver'
  | 'activation'
  | 'pending_rejected'

export interface IntakeClarifyStep {
  id: IntakeClarifyStepId
  aiQuestion: string
  sampleAnswer: string
  /** Short chip label for the sample answer button */
  sampleLabel: string
}

export const INTAKE_CLARIFY_STEPS: IntakeClarifyStep[] = [
  {
    id: 'opening',
    aiQuestion:
      'I can help structure this as an enhancement request. To start, what change do you need for high-value customers?',
    sampleAnswer: SAMPLE_OPENING_PROMPT,
    sampleLabel: 'Use sample request',
  },
  {
    id: 'high_value',
    aiQuestion:
      'How should OperateFlow define a high-value customer for this approval rule?',
    sampleAnswer: 'Initial deposits above $100,000.',
    sampleLabel: 'Deposits above $100,000',
  },
  {
    id: 'approver',
    aiQuestion: 'Who should approve these high-value activations?',
    sampleAnswer: 'A regional manager should approve before activation.',
    sampleLabel: 'Regional manager',
  },
  {
    id: 'activation',
    aiQuestion:
      'Should approval be required before the account can be activated?',
    sampleAnswer:
      'Yes. Account activation must not proceed until approval is complete.',
    sampleLabel: 'Block until approved',
  },
  {
    id: 'pending_rejected',
    aiQuestion: 'What should happen if approval is pending or rejected?',
    sampleAnswer:
      'Keep the account pending, do not activate, and notify the onboarding team.',
    sampleLabel: 'Pending + notify onboarding',
  },
]

export type ChatRole = 'ai' | 'human' | 'system'

export interface IntakeChatMessage {
  id: string
  role: ChatRole
  text: string
}

export function firstNameFromPersonaName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0]
  return first || 'there'
}

export function createWelcomeMessages(firstName: string): IntakeChatMessage[] {
  return [
    {
      id: 'msg-welcome',
      role: 'ai',
      text: `Hi ${firstName}! I'm your OperateFlow AI Intake Assistant. What can I help you with today?`,
    },
  ]
}

/** Progressive draft updates as each clarify step is answered. */
export function applyClarifyAnswerToDraft(
  draft: StructuredRequirements,
  stepId: IntakeClarifyStepId,
): StructuredRequirements {
  const defaults = buildDefaultStructuredRequirements()
  switch (stepId) {
    case 'opening':
      return {
        ...draft,
        title: defaults.title,
        category: defaults.category,
        application: defaults.application,
        requesterId: defaults.requesterId,
        priority: defaults.priority,
        businessObjective: defaults.businessObjective,
        confirmationState: 'ai_draft',
      }
    case 'high_value':
      return {
        ...draft,
        highValueThreshold: defaults.highValueThreshold,
        confirmationState: 'ai_draft',
      }
    case 'approver':
      return {
        ...draft,
        approverRole: defaults.approverRole,
        confirmationState: 'ai_draft',
      }
    case 'activation':
      return {
        ...draft,
        activationConstraint: defaults.activationConstraint,
        confirmationState: 'ai_draft',
      }
    case 'pending_rejected':
      return {
        ...draft,
        pendingRejectedBehavior: defaults.pendingRejectedBehavior,
        acceptanceCriteria: defaults.acceptanceCriteria,
        confirmationState: 'ai_draft',
      }
    default:
      return draft
  }
}

export function emptyIntakeDraft(): StructuredRequirements {
  return {
    title: '',
    category: 'Enhancement',
    application: 'Customer Onboarding Portal',
    highValueThreshold: '',
    approverRole: '',
    activationConstraint: '',
    pendingRejectedBehavior: '',
    businessObjective: '',
    acceptanceCriteria: [],
    requesterId: 'john-harrison',
    priority: 'High',
    confirmationState: 'ai_draft',
  }
}

export function isUnrecognizedIntakeInput(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return true

  const allowed = new Set(
    INTAKE_CLARIFY_STEPS.map((step) => step.sampleAnswer.trim().toLowerCase()),
  )
  const aliases = [
    'high-value customers',
    'high value customers',
    'deposits above $100,000',
    'deposits above 100000',
    'regional manager',
    'yes',
    'notify onboarding',
    'keep pending',
  ]
  if (allowed.has(normalized)) return false
  if (aliases.some((alias) => normalized.includes(alias))) return false
  if (normalized.includes('approval') && normalized.includes('high')) return false
  return true
}

export function nextStepIndex(current: number): number {
  return Math.min(current + 1, INTAKE_CLARIFY_STEPS.length)
}

export function isClarifyComplete(answeredCount: number): boolean {
  return answeredCount >= INTAKE_CLARIFY_STEPS.length
}
