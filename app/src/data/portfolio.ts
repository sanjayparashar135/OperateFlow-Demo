import type {
  ActivityEntry,
  DeliveryInsight,
  DeliveryRequest,
} from '../types/delivery'
import { formatDisplayDate } from '../lib/format'
import { addDaysIso, getSimulatedBaseline } from './simDate'

/**
 * Initial Northstar portfolio offsets relative to demo baseline (D0).
 * Radhe (PM) KPI snapshot at baseline:
 * - Visible: 12
 * - Active Requests: 10 (excludes REQ1211, REQ1212 Closed)
 * - Needs Attention: 7 (REQ1202–REQ1207, REQ1209)
 * - At Risk: 2 (REQ1206, REQ1209)
 * - In Execution: 3 (REQ1206, REQ1207, REQ1208)
 * Lifecycle distribution (all 12): Intake 2, Planning 3, Execution 3, UAT 2, Hypercare 2
 *
 * Persona visibility (relationship + primary owner; PM sees all):
 * - John 4 · Sanjay 3 · Ajay 3 · Sreekanth 3 · Omer 6 · Radhe 12
 * REQ1210 keeps primaryOwnerId sanjay-parashar; Omer sees it via deliveryOwnerId.
 *
 * Does NOT include REQ1235 or JIRA-122345 (created during Intelligent Intake).
 */

interface PortfolioRequestSeed {
  id: string
  title: string
  application: string
  primaryOwnerId: DeliveryRequest['primaryOwnerId']
  parties: DeliveryRequest['parties']
  lifecycleStage: DeliveryRequest['lifecycleStage']
  workflowStatus: DeliveryRequest['workflowStatus']
  deliveryHealth: DeliveryRequest['deliveryHealth']
  priority: DeliveryRequest['priority']
  /** Calendar-day offset from baseline for targetDate. */
  targetOffset: number
  /** Calendar-day offset from baseline for lastUpdated. */
  lastUpdatedOffset: number
  summary: string
  attentionReasons?: string[]
  /** When set, attentionReasons are built with formatDisplayDate(baseline+offset). */
  releaseWindowAttentionOffset?: number
}

const PORTFOLIO_REQUEST_SEEDS: PortfolioRequestSeed[] = [
  {
    id: 'REQ1201',
    title: 'Digital identity verification soft-fail recovery',
    application: 'Customer Onboarding Portal',
    primaryOwnerId: 'john-harrison',
    parties: { requesterId: 'john-harrison' },
    lifecycleStage: 'Intelligent Intake',
    workflowStatus: 'Draft',
    deliveryHealth: 'On Track',
    priority: 'Medium',
    targetOffset: 19,
    lastUpdatedOffset: -1,
    summary:
      'Clarify recovery messaging when soft-fail identity checks pause account activation during onboarding.',
  },
  {
    id: 'REQ1202',
    title: 'Beneficiary update confirmation email template',
    application: 'Customer Self-Service',
    primaryOwnerId: 'john-harrison',
    parties: { requesterId: 'john-harrison' },
    lifecycleStage: 'Intelligent Intake',
    workflowStatus: 'Awaiting Review',
    deliveryHealth: 'On Track',
    priority: 'Low',
    targetOffset: 26,
    lastUpdatedOffset: -2,
    summary:
      'Add a confirmation email when customers update beneficiary details in self-service.',
    attentionReasons: ['Intake draft awaiting business review'],
  },
  {
    id: 'REQ1203',
    title: 'Wire transfer dual-control threshold adjustment',
    application: 'Payments Hub',
    primaryOwnerId: 'radhe-shyam',
    parties: {
      requesterId: 'john-harrison',
      deliveryOwnerId: 'omer-ahmed',
    },
    lifecycleStage: 'Approval & Planning',
    workflowStatus: 'Pending Approval',
    deliveryHealth: 'On Track',
    priority: 'High',
    targetOffset: 11,
    lastUpdatedOffset: -1,
    summary:
      'Raise dual-control threshold for domestic wires and update compliance attestation text.',
    attentionReasons: ['Waiting on delivery-owner approval'],
  },
  {
    id: 'REQ1204',
    title: 'Mobile deposit receipt PDF branding refresh',
    application: 'Mobile Banking',
    primaryOwnerId: 'sanjay-parashar',
    parties: { technicalLeadId: 'sanjay-parashar' },
    lifecycleStage: 'Approval & Planning',
    workflowStatus: 'Awaiting Technical Review',
    deliveryHealth: 'On Track',
    priority: 'Medium',
    targetOffset: 17,
    lastUpdatedOffset: -3,
    summary:
      'Align mobile deposit receipt PDF with updated Northstar brand guidelines.',
    attentionReasons: ['Awaiting technical lead review'],
  },
  {
    id: 'REQ1205',
    title: 'Claims status webhook resilience',
    application: 'Claims Portal',
    primaryOwnerId: 'sreekanth-mamdekar',
    parties: {
      technicalLeadId: 'sanjay-parashar',
      integrationLeadId: 'sreekanth-mamdekar',
    },
    lifecycleStage: 'Approval & Planning',
    workflowStatus: 'Awaiting Technical Review',
    deliveryHealth: 'On Track',
    priority: 'High',
    targetOffset: 3,
    lastUpdatedOffset: -4,
    summary:
      'Add retry and dead-letter handling for claims status webhooks to partner systems.',
    attentionReasons: [
      'Technical review pending',
      'Target date within three days',
    ],
  },
  {
    id: 'REQ1206',
    title: 'Core banking statement API latency hardening',
    application: 'Statements Service',
    primaryOwnerId: 'ajay-raj',
    parties: {
      developerId: 'ajay-raj',
      integrationLeadId: 'sreekanth-mamdekar',
      deliveryOwnerId: 'omer-ahmed',
    },
    lifecycleStage: 'Execution',
    workflowStatus: 'Blocked',
    deliveryHealth: 'At Risk',
    priority: 'Critical',
    targetOffset: 5,
    lastUpdatedOffset: -1,
    summary:
      'Reduce intermittent latency spikes on statement retrieval used by online banking.',
    attentionReasons: [
      'Blocked on dependent core-banking sandbox capacity',
      'Delivery health At Risk',
    ],
  },
  {
    id: 'REQ1207',
    title: 'ATM locator weekend hours sync',
    application: 'Branch Finder',
    primaryOwnerId: 'ajay-raj',
    parties: { developerId: 'ajay-raj' },
    lifecycleStage: 'Execution',
    workflowStatus: 'In Progress',
    deliveryHealth: 'Delayed',
    priority: 'Medium',
    targetOffset: 1,
    lastUpdatedOffset: -2,
    summary:
      'Sync weekend ATM and branch hours from facilities feed into Branch Finder.',
    attentionReasons: [
      'Delivery health Delayed',
      'Target date within three days',
    ],
  },
  {
    id: 'REQ1208',
    title: 'Fraud alert preference center AMS enhancement',
    application: 'Fraud Alerts',
    primaryOwnerId: 'radhe-shyam',
    parties: { developerId: 'ajay-raj' },
    lifecycleStage: 'Execution',
    workflowStatus: 'In Progress',
    deliveryHealth: 'On Track',
    priority: 'High',
    targetOffset: 13,
    lastUpdatedOffset: -1,
    summary:
      'Allow customers to choose SMS versus push for fraud alert preferences.',
  },
  {
    id: 'REQ1209',
    title: 'Loan origination document upload size increase',
    application: 'Loan Origination',
    primaryOwnerId: 'omer-ahmed',
    parties: { deliveryOwnerId: 'omer-ahmed' },
    lifecycleStage: 'UAT & Release',
    workflowStatus: 'In UAT',
    deliveryHealth: 'At Risk',
    priority: 'High',
    targetOffset: 2,
    lastUpdatedOffset: -1,
    summary:
      'Increase document upload limit for loan packages and validate virus-scan timeouts.',
    releaseWindowAttentionOffset: 2,
    attentionReasons: ['Delivery health At Risk'],
  },
  {
    id: 'REQ1210',
    title: 'Wealth portal statement archive search',
    application: 'Wealth Portal',
    primaryOwnerId: 'sanjay-parashar',
    parties: {
      technicalLeadId: 'sanjay-parashar',
      deliveryOwnerId: 'omer-ahmed',
    },
    lifecycleStage: 'UAT & Release',
    workflowStatus: 'Ready for Release',
    deliveryHealth: 'On Track',
    priority: 'Medium',
    targetOffset: 7,
    lastUpdatedOffset: -2,
    summary:
      'Enable date-range search across archived wealth statements after UAT sign-off.',
  },
  {
    id: 'REQ1211',
    title: 'Card activation IVR prompt update',
    application: 'Card Services IVR',
    primaryOwnerId: 'omer-ahmed',
    parties: {
      requesterId: 'john-harrison',
      deliveryOwnerId: 'omer-ahmed',
    },
    lifecycleStage: 'Hypercare & Closure',
    workflowStatus: 'Closed',
    deliveryHealth: 'On Track',
    priority: 'Low',
    targetOffset: -9,
    lastUpdatedOffset: -7,
    summary:
      'Updated IVR activation prompts; hypercare complete and request closed.',
  },
  {
    id: 'REQ1212',
    title: 'Vendor invoice portal SSO enablement',
    application: 'Vendor Portal',
    primaryOwnerId: 'sreekanth-mamdekar',
    parties: {
      integrationLeadId: 'sreekanth-mamdekar',
      deliveryOwnerId: 'omer-ahmed',
    },
    lifecycleStage: 'Hypercare & Closure',
    workflowStatus: 'Closed',
    deliveryHealth: 'On Track',
    priority: 'Medium',
    targetOffset: -12,
    lastUpdatedOffset: -8,
    summary:
      'SSO for vendor invoice portal went live; monitoring window closed without incidents.',
  },
]

interface ActivitySeed {
  id: string
  requestId: string
  /** Calendar-day offset from baseline for the date portion. */
  dayOffset: number
  time: string
  actor: string
  category: ActivityEntry['category']
  message: string
}

const ACTIVITY_SEEDS: ActivitySeed[] = [
  {
    id: 'act-01',
    requestId: 'REQ1206',
    dayOffset: -1,
    time: '16:40:00',
    actor: 'Ajay Raj',
    category: 'risk',
    message:
      'Escalated core-banking sandbox capacity blocker; delivery health set to At Risk.',
  },
  {
    id: 'act-02',
    requestId: 'REQ1203',
    dayOffset: -1,
    time: '14:10:00',
    actor: 'Radhe Shyam',
    category: 'review',
    message:
      'Submitted dual-control threshold change for delivery-owner approval.',
  },
  {
    id: 'act-03',
    requestId: 'REQ1208',
    dayOffset: -1,
    time: '11:25:00',
    actor: 'Ajay Raj',
    category: 'progress',
    message:
      'Completed preference-center API wiring; UI validation remaining.',
  },
  {
    id: 'act-04',
    requestId: 'REQ1209',
    dayOffset: -1,
    time: '09:50:00',
    actor: 'Sanjay Parashar',
    category: 'uat_release',
    message:
      'Logged UAT finding on virus-scan timeout for large loan packages.',
  },
  {
    id: 'act-05',
    requestId: 'REQ1205',
    dayOffset: -2,
    time: '17:05:00',
    actor: 'Sreekanth Mamdekar',
    category: 'assignment',
    message:
      'Assigned claims webhook resilience design to technical review queue.',
  },
  {
    id: 'act-06',
    requestId: 'REQ1207',
    dayOffset: -2,
    time: '13:20:00',
    actor: 'Radhe Shyam',
    category: 'progress',
    message:
      'Noted facilities feed delay; ATM hours sync marked Delayed.',
  },
  {
    id: 'act-07',
    requestId: 'REQ1210',
    dayOffset: -2,
    time: '10:00:00',
    actor: 'Omer Ahmed',
    category: 'uat_release',
    message:
      'Business UAT signed off; request marked Ready for Release.',
  },
  {
    id: 'act-08',
    requestId: 'REQ1202',
    dayOffset: -3,
    time: '15:35:00',
    actor: 'John Harrison',
    category: 'review',
    message:
      'Submitted beneficiary email template draft for intake review.',
  },
]

export function buildPortfolioRequests(
  baselineDate: string = getSimulatedBaseline(),
): DeliveryRequest[] {
  return PORTFOLIO_REQUEST_SEEDS.map((seed) => {
    const attentionReasons = [...(seed.attentionReasons ?? [])]
    if (seed.releaseWindowAttentionOffset !== undefined) {
      const releaseDate = addDaysIso(
        baselineDate,
        seed.releaseWindowAttentionOffset,
      )
      attentionReasons.unshift(
        `UAT findings may miss ${formatDisplayDate(releaseDate)} release window`,
      )
    }
    return {
      id: seed.id,
      title: seed.title,
      application: seed.application,
      primaryOwnerId: seed.primaryOwnerId,
      parties: seed.parties,
      lifecycleStage: seed.lifecycleStage,
      workflowStatus: seed.workflowStatus,
      deliveryHealth: seed.deliveryHealth,
      priority: seed.priority,
      targetDate: addDaysIso(baselineDate, seed.targetOffset),
      lastUpdated: addDaysIso(baselineDate, seed.lastUpdatedOffset),
      summary: seed.summary,
      attentionReasons:
        attentionReasons.length > 0 ? attentionReasons : undefined,
    }
  })
}

export function buildRecentActivity(
  baselineDate: string = getSimulatedBaseline(),
): ActivityEntry[] {
  return ACTIVITY_SEEDS.map((seed) => ({
    id: seed.id,
    requestId: seed.requestId,
    timestamp: `${addDaysIso(baselineDate, seed.dayOffset)}T${seed.time}`,
    actor: seed.actor,
    category: seed.category,
    message: seed.message,
  }))
}

/**
 * Scripted insights. Selectors re-scope title, detail, and evidence IDs
 * so persona views never cite hidden requests.
 */
export function buildDeliveryInsights(
  _baselineDate: string = getSimulatedBaseline(),
): DeliveryInsight[] {
  return [
    {
      id: 'insight-deadline',
      kind: 'deadline',
      title: 'Deliveries approaching their target dates',
      detail:
        'These requests have target dates within the next three days. Confirm owners and delivery readiness before their deadlines.',
      requestIds: ['REQ1205', 'REQ1207', 'REQ1209'],
    },
    {
      id: 'insight-approval',
      kind: 'approval',
      title: 'Approval and review items are waiting',
      detail:
        'Clearing pending review and approval statuses unblocks planning throughput for Northstar delivery.',
      requestIds: ['REQ1202', 'REQ1203', 'REQ1204', 'REQ1205'],
    },
    {
      id: 'insight-risk',
      kind: 'risk',
      title: 'Delivery risks need prompt attention',
      detail:
        'At Risk items may miss near-term targets unless dependency owners escalate and recover the timeline.',
      requestIds: ['REQ1206', 'REQ1209'],
    },
  ]
}

/** Seed portfolio for the active demo calendar baseline. */
export function getPortfolioRequests(
  baselineDate: string = getSimulatedBaseline(),
): DeliveryRequest[] {
  return buildPortfolioRequests(baselineDate)
}

export function getRecentActivity(
  baselineDate: string = getSimulatedBaseline(),
): ActivityEntry[] {
  return buildRecentActivity(baselineDate)
}

export function getDeliveryInsights(
  baselineDate: string = getSimulatedBaseline(),
): DeliveryInsight[] {
  return buildDeliveryInsights(baselineDate)
}
