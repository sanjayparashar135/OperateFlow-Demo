/**
 * Build 3 + Build 4 regression checks:
 * - Seed portfolio unchanged (12 records, no REQ1235)
 * - Post-submit visibility / KPI expectations for the merged portfolio
 * - Atomic factory produces stable IDs (no duplicate timeline/activity ids)
 * - Estimation accept / override / invalid override / idempotency
 * - Confirmed status Pending Approval without Execution or developer assignment
 */
import {
  buildDefaultStructuredRequirements,
  createSubmittedMainRequestBundle,
} from '../src/data/mainRequestFactory.ts'
import {
  applyEstimationConfirmation,
  hydrateEstimationDecision,
  validateConfirmEstimationInput,
} from '../src/data/estimationHelpers.ts'
import {
  ESTIMATION_SUGGESTION,
  ESTIMATION_TIMELINE_EVENT_ID,
  ESTIMATION_CONFIRMED_ATTENTION,
} from '../src/data/estimationDataset.ts'
import {
  DELIVERY_INSIGHTS,
  PORTFOLIO_REQUESTS,
  RECENT_ACTIVITY,
} from '../src/data/portfolio.ts'
import {
  EXPECTED_PERSONA_VISIBLE_COUNTS,
  getPortfolioKpis,
  getVisibleRequests,
  validatePortfolioConsistency,
} from '../src/data/portfolioSelectors.ts'
import { PERSONAS } from '../src/data/personas.ts'
import { SIMULATED_TODAY } from '../src/data/simDate.ts'
import {
  MAIN_JIRA_ID,
  MAIN_REQUEST_ID,
} from '../src/types/simulation.ts'

const issues: string[] = []

function assert(condition: boolean, message: string) {
  if (!condition) issues.push(message)
}

// --- Seed remains Build 2 baseline ---
const seedIssues = validatePortfolioConsistency()
assert(seedIssues.length === 0, `Seed consistency failed: ${seedIssues.join('; ')}`)
assert(PORTFOLIO_REQUESTS.length === 12, 'Seed portfolio must remain 12 records')
assert(
  !PORTFOLIO_REQUESTS.some((request) => request.id === MAIN_REQUEST_ID),
  'Seed must not include REQ1235',
)
assert(
  !JSON.stringify({ PORTFOLIO_REQUESTS, RECENT_ACTIVITY, DELIVERY_INSIGHTS }).includes(
    MAIN_JIRA_ID,
  ),
  'Seed data must not include JIRA-122345',
)

for (const persona of PERSONAS) {
  const visible = getVisibleRequests(persona.id, PORTFOLIO_REQUESTS)
  assert(
    visible.length === EXPECTED_PERSONA_VISIBLE_COUNTS[persona.id],
    `Seed visible count for ${persona.id}: expected ${EXPECTED_PERSONA_VISIBLE_COUNTS[persona.id]}, got ${visible.length}`,
  )
}

// --- Post-submit merged portfolio ---
const requirements = buildDefaultStructuredRequirements()
requirements.confirmationState = 'human_confirmed'
const bundle = createSubmittedMainRequestBundle(requirements, SIMULATED_TODAY)
const merged = [...PORTFOLIO_REQUESTS, bundle.mainRequest]

assert(merged.length === 13, `Merged portfolio expected 13, got ${merged.length}`)
assert(bundle.mainRequest.id === MAIN_REQUEST_ID, 'Main request id must be REQ1235')
assert(
  bundle.linkedRecords.some((record) => record.id === MAIN_JIRA_ID),
  'Bundle must include JIRA-122345',
)
assert(
  bundle.mainRequest.primaryOwnerId === 'sanjay-parashar',
  'Primary owner must be Sanjay',
)
assert(
  bundle.mainRequest.parties.technicalLeadId === 'sanjay-parashar',
  'Technical lead must be Sanjay',
)
assert(
  bundle.mainRequest.parties.requesterId === 'john-harrison',
  'Requester must be John',
)
assert(
  bundle.mainRequest.parties.developerId === undefined &&
    bundle.mainRequest.parties.integrationLeadId === undefined &&
    bundle.mainRequest.parties.deliveryOwnerId === undefined,
  'Developer / integration / delivery owner must be omitted at intake',
)
assert(
  bundle.mainRequest.lifecycleStage === 'Approval & Planning',
  'Lifecycle must be Approval & Planning',
)
assert(
  bundle.mainRequest.workflowStatus === 'Awaiting Technical Review',
  'Workflow status must be Awaiting Technical Review',
)
assert(
  bundle.mainRequest.deliveryHealth === 'On Track',
  'Delivery health must be On Track',
)
assert(bundle.mainRequest.priority === 'High', 'Priority must be High')
assert(
  bundle.mainRequest.targetDate === '2026-10-23',
  'Target date must be 2026-10-23',
)

const estimationPending = hydrateEstimationDecision(bundle.estimation)
assert(
  estimationPending.decisionState === 'pending_review',
  'Post-intake estimation must be pending_review',
)

const timelineIds = bundle.timelineEvents.map((event) => event.id)
assert(
  new Set(timelineIds).size === timelineIds.length,
  'Timeline event ids must be unique',
)
const activityIds = bundle.activityEntries.map((entry) => entry.id)
assert(
  new Set(activityIds).size === activityIds.length,
  'Activity entry ids must be unique',
)

// Second factory call produces the same primary identifiers (atomic, non-accumulating)
const bundleAgain = createSubmittedMainRequestBundle(requirements, SIMULATED_TODAY)
assert(
  bundleAgain.mainRequest.id === MAIN_REQUEST_ID &&
    bundleAgain.timelineEvents.length === bundle.timelineEvents.length &&
    bundleAgain.activityEntries.length === bundle.activityEntries.length,
  'Factory must produce a stable non-accumulating bundle',
)

const expectedPostSubmitVisible: Record<string, number> = {
  'radhe-shyam': 13,
  'john-harrison': 5,
  'sanjay-parashar': 4,
  'ajay-raj': 3,
  'sreekanth-mamdekar': 3,
  'omer-ahmed': 6,
}

for (const persona of PERSONAS) {
  const visible = getVisibleRequests(persona.id, merged)
  assert(
    visible.length === expectedPostSubmitVisible[persona.id],
    `Post-submit visible for ${persona.id}: expected ${expectedPostSubmitVisible[persona.id]}, got ${visible.length}`,
  )
}

const radheVisible = getVisibleRequests('radhe-shyam', merged)
const radheKpis = getPortfolioKpis(radheVisible, SIMULATED_TODAY)
assert(radheKpis.activeRequests === 11, `Radhe active expected 11, got ${radheKpis.activeRequests}`)
assert(
  radheKpis.needsAttention === 8,
  `Radhe attention expected 8, got ${radheKpis.needsAttention}`,
)
assert(radheKpis.atRisk === 2, `Radhe at risk expected 2, got ${radheKpis.atRisk}`)
assert(
  radheKpis.inExecution === 3,
  `Radhe execution expected 3, got ${radheKpis.inExecution}`,
)

// --- Build 4: invalid override rejected ---
assert(
  validateConfirmEstimationInput({
    mode: 'overridden',
    confirmedHours: 60,
    overrideJustification: '',
    confirmedApproach: ESTIMATION_SUGGESTION.defaultApproach,
    decidedById: 'sanjay-parashar',
    referenceDate: SIMULATED_TODAY,
  }) !== null,
  'Empty override justification must be rejected',
)
assert(
  validateConfirmEstimationInput({
    mode: 'overridden',
    confirmedHours: 0,
    overrideJustification: 'Too low',
    confirmedApproach: ESTIMATION_SUGGESTION.defaultApproach,
    decidedById: 'sanjay-parashar',
    referenceDate: SIMULATED_TODAY,
  }) !== null,
  'Non-positive override hours must be rejected',
)
assert(
  applyEstimationConfirmation(bundle, {
    mode: 'overridden',
    confirmedHours: 72,
    overrideJustification: '',
    confirmedApproach: ESTIMATION_SUGGESTION.defaultApproach,
    decidedById: 'sanjay-parashar',
    referenceDate: SIMULATED_TODAY,
  }).ok === false,
  'applyEstimationConfirmation must reject invalid override',
)

// --- Build 4: accept path ---
const acceptResult = applyEstimationConfirmation(bundle, {
  mode: 'accepted',
  confirmedApproach: ESTIMATION_SUGGESTION.defaultApproach,
  decidedById: 'sanjay-parashar',
  referenceDate: SIMULATED_TODAY,
})
assert(acceptResult.ok === true, 'Accept path must succeed')
if (acceptResult.ok) {
  const accepted = acceptResult.bundle
  assert(
    accepted.estimation?.decisionState === 'confirmed',
    'Accepted estimation must be confirmed',
  )
  assert(accepted.estimation?.mode === 'accepted', 'Mode must be accepted')
  assert(
    accepted.estimation?.confirmedHours === ESTIMATION_SUGGESTION.suggestedHours,
    'Accepted hours must equal suggested 56',
  )
  assert(
    accepted.mainRequest.workflowStatus === 'Pending Approval',
    'Accepted status must be Pending Approval',
  )
  assert(
    accepted.mainRequest.lifecycleStage === 'Approval & Planning',
    'Accepted lifecycle must remain Approval & Planning',
  )
  assert(
    accepted.mainRequest.deliveryHealth === 'On Track',
    'Accepted health must remain On Track',
  )
  assert(
    accepted.mainRequest.primaryOwnerId === 'sanjay-parashar',
    'Primary owner must remain Sanjay after accept',
  )
  assert(
    accepted.mainRequest.parties.developerId === undefined,
    'Developer must remain unassigned after accept',
  )
  assert(
    accepted.mainRequest.attentionReasons?.[0] === ESTIMATION_CONFIRMED_ATTENTION,
    'Attention must explain business approval handoff',
  )
  assert(
    accepted.timelineEvents.filter(
      (event) => event.id === ESTIMATION_TIMELINE_EVENT_ID,
    ).length === 1,
    'Exactly one estimation timeline event after accept',
  )
  assert(
    ESTIMATION_SUGGESTION.breakdown.reduce((sum, item) => sum + item.hours, 0) ===
      ESTIMATION_SUGGESTION.suggestedHours,
    'Suggested breakdown must total suggested hours (reference evidence)',
  )

  const acceptAgain = applyEstimationConfirmation(accepted, {
    mode: 'accepted',
    confirmedApproach: ESTIMATION_SUGGESTION.defaultApproach,
    decidedById: 'sanjay-parashar',
    referenceDate: SIMULATED_TODAY,
  })
  assert(acceptAgain.ok === false, 'Repeated accept must be idempotent (rejected)')
  assert(
    accepted.timelineEvents.filter(
      (event) => event.id === ESTIMATION_TIMELINE_EVENT_ID,
    ).length === 1,
    'No duplicate estimation timeline events on repeat',
  )

  const afterAcceptMerged = [...PORTFOLIO_REQUESTS, accepted.mainRequest]
  const radheAfterAccept = getPortfolioKpis(
    getVisibleRequests('radhe-shyam', afterAcceptMerged),
    SIMULATED_TODAY,
  )
  assert(
    radheAfterAccept.inExecution === 3,
    `After accept inExecution must stay 3, got ${radheAfterAccept.inExecution}`,
  )
  for (const persona of PERSONAS) {
    const visible = getVisibleRequests(persona.id, afterAcceptMerged)
    assert(
      visible.length === expectedPostSubmitVisible[persona.id],
      `Post-estimate visible for ${persona.id} must match post-submit`,
    )
  }
}

// --- Build 4: override path (fresh pending bundle) ---
const overrideSource = createSubmittedMainRequestBundle(requirements, SIMULATED_TODAY)
const overrideResult = applyEstimationConfirmation(overrideSource, {
  mode: 'overridden',
  confirmedHours: 64,
  overrideJustification: 'Additional integration hardening for regional approval.',
  confirmedApproach: ESTIMATION_SUGGESTION.defaultApproach,
  decidedById: 'sanjay-parashar',
  referenceDate: SIMULATED_TODAY,
})
assert(overrideResult.ok === true, 'Override path must succeed')
if (overrideResult.ok) {
  const overridden = overrideResult.bundle
  assert(overridden.estimation?.mode === 'overridden', 'Mode must be overridden')
  assert(
    overridden.estimation?.confirmedHours === 64,
    'Confirmed hours must be the revised total',
  )
  assert(
    overridden.estimation?.confirmedHours !== ESTIMATION_SUGGESTION.suggestedHours,
    'Confirmed override total must differ from suggested total in this case',
  )
  assert(
    overridden.estimation?.overrideJustification?.includes('integration hardening') ===
      true,
    'Override justification must be persisted',
  )
  assert(
    overridden.mainRequest.workflowStatus === 'Pending Approval',
    'Override status must be Pending Approval',
  )
  assert(
    overridden.mainRequest.lifecycleStage === 'Approval & Planning',
    'Override lifecycle must remain Approval & Planning',
  )
  assert(
    overridden.mainRequest.parties.developerId === undefined,
    'Developer must remain unassigned after override',
  )
  // Suggested breakdown remains static reference — not rewritten as confirmed allocation
  assert(
    ESTIMATION_SUGGESTION.suggestedHours === 56,
    'Static suggested hours must remain 56 as reference evidence',
  )
}

// --- Build 3 session hydration (missing estimation field) ---
const legacyBundle = {
  ...createSubmittedMainRequestBundle(requirements, SIMULATED_TODAY),
}
delete (legacyBundle as { estimation?: unknown }).estimation
const hydrated = hydrateEstimationDecision(legacyBundle.estimation)
assert(
  hydrated.decisionState === 'pending_review',
  'Missing estimation must hydrate to pending_review',
)
const legacyConfirm = applyEstimationConfirmation(
  { ...legacyBundle, estimation: undefined },
  {
    mode: 'accepted',
    confirmedApproach: ESTIMATION_SUGGESTION.defaultApproach,
    decidedById: 'sanjay-parashar',
    referenceDate: SIMULATED_TODAY,
  },
)
assert(legacyConfirm.ok === true, 'Build 3 sessions without estimation must confirm')

// Reset semantics: dropping the submitted request restores seed counts
const afterReset = PORTFOLIO_REQUESTS
for (const persona of PERSONAS) {
  const visible = getVisibleRequests(persona.id, afterReset)
  assert(
    visible.length === EXPECTED_PERSONA_VISIBLE_COUNTS[persona.id],
    `After reset visible for ${persona.id} should match seed`,
  )
}

const report = {
  ok: issues.length === 0,
  issues,
  seedSize: PORTFOLIO_REQUESTS.length,
  mergedSize: merged.length,
  postSubmitVisible: Object.fromEntries(
    PERSONAS.map((persona) => [
      persona.id,
      getVisibleRequests(persona.id, merged).map((request) => request.id),
    ]),
  ),
  radheKpis,
  suggestionHours: ESTIMATION_SUGGESTION.suggestedHours,
}

console.log(JSON.stringify(report, null, 2))
if (issues.length > 0) {
  process.exitCode = 1
}
