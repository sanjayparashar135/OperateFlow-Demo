import type {
  ActivityEntry,
  DeliveryInsight,
  DeliveryRequest,
} from '../types/delivery'

/**
 * Initial Northstar portfolio for Build 2.
 * Radhe (PM) KPI snapshot at SIMULATED_TODAY (2026-10-17):
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
export const PORTFOLIO_REQUESTS: DeliveryRequest[] = [
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
    targetDate: '2026-11-05',
    lastUpdated: '2026-10-16',
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
    targetDate: '2026-11-12',
    lastUpdated: '2026-10-15',
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
    targetDate: '2026-10-28',
    lastUpdated: '2026-10-16',
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
    targetDate: '2026-11-03',
    lastUpdated: '2026-10-14',
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
    targetDate: '2026-10-20',
    lastUpdated: '2026-10-13',
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
    targetDate: '2026-10-22',
    lastUpdated: '2026-10-16',
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
    targetDate: '2026-10-18',
    lastUpdated: '2026-10-15',
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
    targetDate: '2026-10-30',
    lastUpdated: '2026-10-16',
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
    targetDate: '2026-10-19',
    lastUpdated: '2026-10-16',
    summary:
      'Increase document upload limit for loan packages and validate virus-scan timeouts.',
    attentionReasons: [
      'UAT findings may miss October 19 release window',
      'Delivery health At Risk',
    ],
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
    targetDate: '2026-10-24',
    lastUpdated: '2026-10-15',
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
    targetDate: '2026-10-08',
    lastUpdated: '2026-10-10',
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
    targetDate: '2026-10-05',
    lastUpdated: '2026-10-09',
    summary:
      'SSO for vendor invoice portal went live; monitoring window closed without incidents.',
  },
]

export const RECENT_ACTIVITY: ActivityEntry[] = [
  {
    id: 'act-01',
    requestId: 'REQ1206',
    timestamp: '2026-10-16T16:40:00',
    actor: 'Ajay Raj',
    category: 'risk',
    message:
      'Escalated core-banking sandbox capacity blocker; delivery health set to At Risk.',
  },
  {
    id: 'act-02',
    requestId: 'REQ1203',
    timestamp: '2026-10-16T14:10:00',
    actor: 'Radhe Shyam',
    category: 'review',
    message:
      'Submitted dual-control threshold change for delivery-owner approval.',
  },
  {
    id: 'act-03',
    requestId: 'REQ1208',
    timestamp: '2026-10-16T11:25:00',
    actor: 'Ajay Raj',
    category: 'progress',
    message:
      'Completed preference-center API wiring; UI validation remaining.',
  },
  {
    id: 'act-04',
    requestId: 'REQ1209',
    timestamp: '2026-10-16T09:50:00',
    actor: 'Sanjay Parashar',
    category: 'uat_release',
    message:
      'Logged UAT finding on virus-scan timeout for large loan packages.',
  },
  {
    id: 'act-05',
    requestId: 'REQ1205',
    timestamp: '2026-10-15T17:05:00',
    actor: 'Sreekanth Mamdekar',
    category: 'assignment',
    message:
      'Assigned claims webhook resilience design to technical review queue.',
  },
  {
    id: 'act-06',
    requestId: 'REQ1207',
    timestamp: '2026-10-15T13:20:00',
    actor: 'Radhe Shyam',
    category: 'progress',
    message:
      'Noted facilities feed delay; ATM hours sync marked Delayed.',
  },
  {
    id: 'act-07',
    requestId: 'REQ1210',
    timestamp: '2026-10-15T10:00:00',
    actor: 'Omer Ahmed',
    category: 'uat_release',
    message:
      'Business UAT signed off; request marked Ready for Release.',
  },
  {
    id: 'act-08',
    requestId: 'REQ1202',
    timestamp: '2026-10-14T15:35:00',
    actor: 'John Harrison',
    category: 'review',
    message:
      'Submitted beneficiary email template draft for intake review.',
  },
]

/**
 * Scripted insights. Selectors re-scope title, detail, and evidence IDs
 * so persona views never cite hidden requests.
 */
export const DELIVERY_INSIGHTS: DeliveryInsight[] = [
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
