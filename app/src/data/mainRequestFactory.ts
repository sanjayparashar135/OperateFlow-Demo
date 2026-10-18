import type { DeliveryRequest } from '../types/delivery'
import type {
  LinkedRecord,
  StructuredRequirements,
  SubmittedSimulationBundle,
  TimelineEvent,
} from '../types/simulation'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../types/simulation'
import { getDefaultEstimationDecision } from './estimationHelpers'
import { getSimulatedToday } from './simDate'

export function buildDefaultStructuredRequirements(): StructuredRequirements {
  return {
    title: 'High-Value Customer Approval Workflow',
    category: 'Enhancement',
    application: 'Customer Onboarding Portal',
    highValueThreshold: 'Initial deposit exceeds $100,000',
    approverRole: 'Regional Manager',
    activationConstraint:
      'Account activation is blocked until regional manager approval is recorded.',
    pendingRejectedBehavior:
      'If approval is pending or rejected, keep activation blocked and notify the onboarding team.',
    businessObjective:
      'Require an additional regional manager approval before activating accounts when the initial deposit exceeds $100,000, reducing operational risk for high-value onboarding.',
    acceptanceCriteria: [
      'When initial deposit exceeds $100,000, regional manager approval is required before account activation.',
      'Accounts remain inactive while approval is pending or after rejection.',
      'Onboarding team receives notification when approval is pending or rejected.',
    ],
    requesterId: 'john-harrison',
    priority: 'High',
    confirmationState: 'ai_draft',
  }
}

export function buildSummaryFromRequirements(
  requirements: StructuredRequirements,
): string {
  return (
    `${requirements.businessObjective} ` +
    `Threshold: ${requirements.highValueThreshold}. ` +
    `Approver: ${requirements.approverRole}. ` +
    `${requirements.pendingRejectedBehavior}`
  )
}

function buildMainRequest(
  requirements: StructuredRequirements,
  referenceDate: string,
): DeliveryRequest {
  return {
    id: MAIN_REQUEST_ID,
    title: requirements.title,
    application: requirements.application,
    primaryOwnerId: 'sanjay-parashar',
    parties: {
      requesterId: 'john-harrison',
      technicalLeadId: 'sanjay-parashar',
    },
    lifecycleStage: 'Approval & Planning',
    workflowStatus: 'Awaiting Technical Review',
    deliveryHealth: 'On Track',
    priority: requirements.priority,
    targetDate: '2026-10-23',
    lastUpdated: referenceDate,
    summary: buildSummaryFromRequirements(requirements),
    attentionReasons: [
      'Awaiting technical review before estimation and planning can proceed',
    ],
  }
}

function buildLinkedRecords(): LinkedRecord[] {
  return [
    {
      system: 'ServiceNow',
      id: MAIN_REQUEST_ID,
      label: 'ServiceNow request',
      detail:
        'Created under Northstar intake rule. Routed for Application Delivery technical review.',
    },
    {
      system: 'Jira',
      id: MAIN_JIRA_ID,
      label: 'Jira delivery ticket',
      detail:
        'Routed to Application Delivery queue. Not yet assigned to a developer.',
    },
  ]
}

function buildTimelineEvents(
  requirements: StructuredRequirements,
  referenceDate: string,
): TimelineEvent[] {
  return [
    {
      id: 'tl-req1235-01',
      requestId: MAIN_REQUEST_ID,
      timestamp: `${referenceDate}T09:10:00`,
      title: 'Intake conversation started',
      detail:
        'John Harrison opened Intelligent Intake for a high-value customer approval enhancement.',
      source: 'human',
      category: 'intake',
    },
    {
      id: 'tl-req1235-02',
      requestId: MAIN_REQUEST_ID,
      timestamp: `${referenceDate}T09:18:00`,
      title: 'Requirements clarified',
      detail: `Structured requirements confirmed: ${requirements.highValueThreshold}; approver ${requirements.approverRole}.`,
      source: 'human',
      category: 'intake',
    },
    {
      id: 'tl-req1235-03',
      requestId: MAIN_REQUEST_ID,
      timestamp: `${referenceDate}T09:20:00`,
      title: 'ServiceNow request created',
      detail: `${MAIN_REQUEST_ID} created under the Northstar intake configuration.`,
      source: 'system',
      category: 'integration',
    },
    {
      id: 'tl-req1235-04',
      requestId: MAIN_REQUEST_ID,
      timestamp: `${referenceDate}T09:21:00`,
      title: 'Jira ticket created',
      detail: `${MAIN_JIRA_ID} routed to Application Delivery queue (unassigned).`,
      source: 'system',
      category: 'integration',
    },
    {
      id: 'tl-req1235-05',
      requestId: MAIN_REQUEST_ID,
      timestamp: `${referenceDate}T09:22:00`,
      title: 'Technical review assigned',
      detail:
        'Sanjay Parashar assigned as solution architect for review. Request moved to Approval & Planning.',
      source: 'system',
      category: 'assignment',
    },
  ]
}

/**
 * Builds the atomic post-submit bundle for the main demo request.
 * Always produces the same identifiers so persistence cannot create duplicates.
 */
export function createSubmittedMainRequestBundle(
  requirements: StructuredRequirements,
  referenceDate: string = getSimulatedToday(),
): SubmittedSimulationBundle {
  const confirmed: StructuredRequirements = {
    ...requirements,
    acceptanceCriteria: requirements.acceptanceCriteria
      .map((item) => item.trim())
      .filter(Boolean),
    confirmationState: 'human_confirmed',
  }

  const mainRequest = buildMainRequest(confirmed, referenceDate)

  return {
    mainRequest,
    requirements: confirmed,
    linkedRecords: buildLinkedRecords(),
    timelineEvents: buildTimelineEvents(confirmed, referenceDate),
    estimation: getDefaultEstimationDecision(),
    activityEntries: [
      {
        id: 'act-req1235-01',
        requestId: MAIN_REQUEST_ID,
        timestamp: `${referenceDate}T09:22:00`,
        actor: 'OperateFlow',
        category: 'intake',
        message: `${MAIN_REQUEST_ID} submitted via Intelligent Intake; technical review assigned to Sanjay Parashar.`,
      },
      {
        id: 'act-req1235-02',
        requestId: MAIN_REQUEST_ID,
        timestamp: `${referenceDate}T09:21:00`,
        actor: 'OperateFlow',
        category: 'integration',
        message: `Linked records ${MAIN_REQUEST_ID} and ${MAIN_JIRA_ID}.`,
      },
    ],
  }
}
