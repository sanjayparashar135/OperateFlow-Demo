/**
 * Build 3–7 regression checks:
 * - Seed portfolio unchanged (12 records, no REQ1235)
 * - Estimation accept / override / invalid override / idempotency
 * - John business approval → Approved — Awaiting Assignment
 * - Radhe resource assignment → Execution + Ajay
 * - Simulated date advance → one follow-up
 * - Developer responses including I'm Blocked
 * - Collaboration channel presentation defaults to Teams
 * - Build 6 blocker troubleshooting, coordination, stakeholder communication
 * - Build 7 smart meeting confirmation and attendee visibility
 */
import {
  applyBusinessApproval,
  applyResourceAssignment,
  APPROVAL_TIMELINE_EVENT_ID,
  ASSIGNMENT_TIMELINE_EVENT_ID,
  canApplyBusinessApproval,
  canApplyResourceAssignment,
  hydrateApprovalRecord,
  hydrateAssignmentRecord,
} from '../src/data/approvalHelpers.ts'
import {
  AI_STAKEHOLDER_UPDATE_DRAFT,
} from '../src/data/blockerCoordinationDataset.ts'
import {
  applyCoordinationSelection,
  applyStakeholderCommunication,
  applyTroubleshootingProgress,
  getConfirmedStakeholderMessage,
  hydrateBlockerResolution,
  STAKEHOLDER_TIMELINE_EVENT_ID,
  TROUBLESHOOTING_TIMELINE_EVENT_ID,
} from '../src/data/blockerResolutionHelpers.ts'
import {
  DEFAULT_COLLABORATION_CHANNEL,
  getCollaborationChannel,
} from '../src/data/collaborationChannel.ts'
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
  applyFollowUpResponse,
  applyFollowUpTrigger,
  isFollowUpTriggerEligible,
} from '../src/data/followUpHelpers.ts'
import {
  BLOCKED_TECHNICAL_DETAIL,
  FOLLOW_UP_ID,
  FOLLOW_UP_TIMELINE_EVENT_ID,
  FOLLOW_UP_RESPONSE_TIMELINE_EVENT_ID,
} from '../src/data/followUpDataset.ts'
import {
  MEETING_ACTIVITY_ID,
  MEETING_DEFAULT_AGENDA,
  MEETING_DEFAULT_TITLE,
  MEETING_ID,
  MEETING_SAMPLE_PROMPT,
  MEETING_TIMELINE_EVENT_ID,
} from '../src/data/meetingDataset.ts'
import {
  applyMeetingConfirmation,
  hydrateMeeting,
  isMeetingVisibleToPersona,
  parseMeetingIntent,
} from '../src/data/meetingHelpers.ts'
import {
  DELIVERY_INSIGHTS,
  PORTFOLIO_REQUESTS,
  RECENT_ACTIVITY,
} from '../src/data/portfolio.ts'
import {
  EXPECTED_PERSONA_VISIBLE_COUNTS,
  getPortfolioKpis,
  getVisibleRequests,
  isRequestVisibleToPersona,
  validatePortfolioConsistency,
} from '../src/data/portfolioSelectors.ts'
import { PERSONAS } from '../src/data/personas.ts'
import {
  SIMULATED_ADVANCE_DATE,
  SIMULATED_TODAY,
} from '../src/data/simDate.ts'
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

// --- Build 5 refinements: split business approval and resource assignment ---
assert(
  canApplyBusinessApproval(bundle) !== null,
  'Business approval must be blocked before estimation is confirmed',
)
assert(
  applyBusinessApproval(bundle, 'john-harrison', SIMULATED_TODAY).ok === false,
  'John cannot approve without confirmed estimate',
)
assert(
  DEFAULT_COLLABORATION_CHANNEL === 'teams',
  'Default collaboration channel must be Microsoft Teams',
)
assert(
  getCollaborationChannel('teams').label === 'Microsoft Teams',
  'Teams label must be Microsoft Teams',
)
assert(
  getCollaborationChannel('slack').label === 'Slack',
  'Slack label must be Slack',
)

assert(acceptResult.ok === true, 'Build 5 requires successful Build 4 accept fixture')
if (acceptResult.ok) {
  const pendingApproval = acceptResult.bundle

  assert(
    canApplyResourceAssignment(pendingApproval) !== null,
    'Radhe cannot assign before business approval',
  )
  assert(
    applyResourceAssignment(pendingApproval, 'radhe-shyam', SIMULATED_TODAY).ok ===
      false,
    'Assignment without business approval must fail',
  )
  assert(
    canApplyBusinessApproval(pendingApproval) === null,
    'John may approve after technical estimate',
  )
  assert(
    applyBusinessApproval(pendingApproval, 'radhe-shyam', SIMULATED_TODAY).ok ===
      false,
    'Only John may approve the business estimate',
  )

  const businessResult = applyBusinessApproval(
    pendingApproval,
    'john-harrison',
    SIMULATED_TODAY,
  )
  assert(businessResult.ok === true, 'John business approval must succeed')
  if (businessResult.ok) {
    const businessApproved = businessResult.bundle
    assert(
      businessApproved.mainRequest.lifecycleStage === 'Approval & Planning',
      'Business approval must remain Approval & Planning',
    )
    assert(
      businessApproved.mainRequest.workflowStatus ===
        'Approved — Awaiting Assignment',
      'Business approval status must be Approved — Awaiting Assignment',
    )
    assert(
      businessApproved.mainRequest.parties.developerId === undefined,
      'Developer must remain unassigned after business approval',
    )
    assert(
      businessApproved.mainRequest.primaryOwnerId === 'sanjay-parashar',
      'Primary owner stays Sanjay until resource assignment',
    )
    assert(
      businessApproved.timelineEvents.filter(
        (e) => e.id === APPROVAL_TIMELINE_EVENT_ID,
      ).length === 1,
      'Exactly one business approval timeline event',
    )
    assert(
      businessApproved.timelineEvents.filter(
        (e) => e.id === ASSIGNMENT_TIMELINE_EVENT_ID,
      ).length === 0,
      'No assignment event during business approval',
    )
    assert(
      applyBusinessApproval(
        businessApproved,
        'john-harrison',
        SIMULATED_TODAY,
      ).ok === false,
      'Repeated business approval must be rejected',
    )
    assert(
      !getVisibleRequests('ajay-raj', [
        ...PORTFOLIO_REQUESTS,
        businessApproved.mainRequest,
      ]).some((r) => r.id === MAIN_REQUEST_ID),
      'Ajay must not see REQ1235 before assignment',
    )

    assert(
      canApplyResourceAssignment(businessApproved) === null,
      'Radhe may assign after business approval',
    )
    const assignResult = applyResourceAssignment(
      businessApproved,
      'radhe-shyam',
      SIMULATED_TODAY,
    )
    assert(assignResult.ok === true, 'Resource assignment must succeed')
    if (assignResult.ok) {
      const assigned = assignResult.bundle
      assert(
        assigned.mainRequest.lifecycleStage === 'Execution',
        'Assignment moves lifecycle to Execution',
      )
      assert(
        assigned.mainRequest.workflowStatus === 'In Progress',
        'Assignment workflow must be In Progress',
      )
      assert(
        assigned.mainRequest.primaryOwnerId === 'radhe-shyam',
        'Primary owner transfers to Radhe on assignment',
      )
      assert(
        assigned.mainRequest.parties.developerId === 'ajay-raj',
        'Ajay must be assigned',
      )
      assert(
        assigned.mainRequest.parties.technicalLeadId === 'sanjay-parashar',
        'Sanjay remains technical lead',
      )
      assert(
        assigned.mainRequest.parties.requesterId === 'john-harrison',
        'John remains requester',
      )
      assert(
        assigned.timelineEvents.filter((e) => e.id === APPROVAL_TIMELINE_EVENT_ID)
          .length === 1,
        'Business approval event remains exactly once',
      )
      assert(
        assigned.timelineEvents.filter(
          (e) => e.id === ASSIGNMENT_TIMELINE_EVENT_ID,
        ).length === 1,
        'Exactly one assignment timeline event',
      )
      assert(
        applyResourceAssignment(assigned, 'radhe-shyam', SIMULATED_TODAY).ok ===
          false,
        'Repeated assignment must be rejected',
      )

      const afterAssignMerged = [...PORTFOLIO_REQUESTS, assigned.mainRequest]
      assert(
        getVisibleRequests('ajay-raj', afterAssignMerged).length === 4,
        'Ajay visible count must be 4 after assignment',
      )
      const radheExecKpis = getPortfolioKpis(
        getVisibleRequests('radhe-shyam', afterAssignMerged),
        SIMULATED_TODAY,
      )
      assert(
        radheExecKpis.inExecution === 4,
        `Radhe inExecution expected 4 after assignment, got ${radheExecKpis.inExecution}`,
      )

      assert(
        isFollowUpTriggerEligible(assigned, SIMULATED_TODAY) === false,
        'Follow-up must not trigger on baseline date',
      )
      const triggerTeams = applyFollowUpTrigger(
        assigned,
        SIMULATED_ADVANCE_DATE,
        'teams',
      )
      assert(
        triggerTeams.ok === true && triggerTeams.created === true,
        'Oct 21 must create follow-up',
      )
      if (triggerTeams.ok) {
        const withFollowUp = triggerTeams.bundle
        assert(withFollowUp.followUp?.id === FOLLOW_UP_ID, 'Follow-up id stable')
        assert(
          withFollowUp.followUp?.channelId === 'teams',
          'Follow-up channel defaults to teams',
        )
        assert(
          withFollowUp.timelineEvents.filter(
            (e) => e.id === FOLLOW_UP_TIMELINE_EVENT_ID,
          ).length === 1,
          'Exactly one follow-up timeline event',
        )
        const triggerAgain = applyFollowUpTrigger(
          withFollowUp,
          SIMULATED_ADVANCE_DATE,
          'slack',
        )
        assert(
          triggerAgain.ok === true && triggerAgain.created === false,
          'Second trigger idempotent; Slack config does not create another follow-up',
        )
        assert(
          withFollowUp.followUp?.channelId === 'teams',
          'Slack presentation config must not alter existing follow-up channel',
        )

        const blocked = applyFollowUpResponse(structuredClone(withFollowUp), {
          kind: 'blocked',
          referenceDate: SIMULATED_ADVANCE_DATE,
        })
        assert(blocked.ok === true, "I'm Blocked must succeed")
        if (blocked.ok) {
          assert(
            blocked.bundle.mainRequest.lifecycleStage === 'Execution',
            'Blocked remains Execution',
          )
          assert(
            blocked.bundle.mainRequest.workflowStatus === 'Blocked',
            'Blocked workflow',
          )
          assert(
            blocked.bundle.mainRequest.deliveryHealth === 'At Risk',
            'Blocked At Risk',
          )
          assert(
            blocked.bundle.followUp?.responseDetail === BLOCKED_TECHNICAL_DETAIL,
            'Blocked detail matches script',
          )
          assert(
            blocked.bundle.timelineEvents.filter(
              (e) => e.id === FOLLOW_UP_RESPONSE_TIMELINE_EVENT_ID,
            ).length === 1,
            'Exactly one response timeline event',
          )

          // --- Build 6: blocker resolution ---
          const blockedBase = blocked.bundle
          const legacyHydrated = hydrateBlockerResolution(undefined)
          assert(
            legacyHydrated.troubleshooting.decisionState === 'pending',
            'Missing blockerResolution hydrates to pending troubleshooting',
          )
          assert(
            getConfirmedStakeholderMessage(undefined) === null,
            'John must not see unapproved communication draft',
          )

          assert(
            applyTroubleshootingProgress(structuredClone(blockedBase), {
              directionId: 'regional_timeout',
              progressNote: 'Checking latency and timeout config.',
              needsIntegrationAssist: true,
              recordedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
            }).ok === false,
            'Radhe cannot record troubleshooting',
          )
          assert(
            applyTroubleshootingProgress(structuredClone(blockedBase), {
              directionId: 'regional_timeout',
              progressNote: 'Checking latency and timeout config.',
              needsIntegrationAssist: true,
              recordedById: 'john-harrison',
              referenceDate: SIMULATED_ADVANCE_DATE,
            }).ok === false,
            'John cannot record troubleshooting',
          )

          const troubleshoot = applyTroubleshootingProgress(
            structuredClone(blockedBase),
            {
              directionId: 'regional_timeout',
              progressNote: 'Checking latency and timeout config.',
              needsIntegrationAssist: true,
              recordedById: 'ajay-raj',
              referenceDate: SIMULATED_ADVANCE_DATE,
            },
          )
          assert(troubleshoot.ok === true, 'Ajay can record troubleshooting')
          if (troubleshoot.ok) {
            assert(
              troubleshoot.bundle.followUp?.responseDetail ===
                BLOCKED_TECHNICAL_DETAIL,
              'Original blocker unchanged after troubleshooting',
            )
            assert(
              troubleshoot.bundle.blockerResolution?.troubleshooting
                .decisionState === 'recorded',
              'Troubleshooting marked recorded',
            )
            assert(
              troubleshoot.bundle.blockerResolution?.troubleshooting
                .needsIntegrationAssist === true,
              'Integration assist flag persists',
            )
            assert(
              troubleshoot.bundle.timelineEvents.filter(
                (e) => e.id === TROUBLESHOOTING_TIMELINE_EVENT_ID,
              ).length === 1,
              'Exactly one troubleshooting timeline event',
            )
            assert(
              troubleshoot.bundle.mainRequest.workflowStatus === 'Blocked' &&
                troubleshoot.bundle.mainRequest.deliveryHealth === 'At Risk' &&
                troubleshoot.bundle.mainRequest.lifecycleStage === 'Execution',
              'Status unchanged after troubleshooting',
            )
            assert(
              applyTroubleshootingProgress(structuredClone(troubleshoot.bundle), {
                directionId: 'callback_persistence',
                progressNote: 'Retry note',
                needsIntegrationAssist: false,
                recordedById: 'ajay-raj',
                referenceDate: SIMULATED_ADVANCE_DATE,
              }).ok === false,
              'Duplicate troubleshooting rejected',
            )
          }

          assert(
            applyCoordinationSelection(structuredClone(blockedBase), {
              actionIds: ['coordinate_investigation'],
              selectedById: 'ajay-raj',
              referenceDate: SIMULATED_ADVANCE_DATE,
            }).ok === false,
            'Ajay cannot select coordination actions',
          )

          const coordinated = applyCoordinationSelection(
            structuredClone(blockedBase),
            {
              actionIds: [
                'coordinate_investigation',
                'update_business_owner',
              ],
              selectedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
            },
          )
          assert(coordinated.ok === true, 'Radhe can select coordination actions')
          if (coordinated.ok) {
            assert(
              coordinated.bundle.blockerResolution?.coordination.selectedActionIds
                .length === 2,
              'Selected coordination actions persist',
            )
            assert(
              getConfirmedStakeholderMessage(
                coordinated.bundle.blockerResolution,
              ) === null,
              'Unapproved draft remains hidden from John',
            )
            assert(
              coordinated.bundle.timelineEvents.every(
                (e) => e.id !== STAKEHOLDER_TIMELINE_EVENT_ID,
              ),
              'Coordination selection does not create stakeholder timeline event',
            )
          }

          assert(
            applyStakeholderCommunication(structuredClone(blockedBase), {
              message: AI_STAKEHOLDER_UPDATE_DRAFT,
              recipientId: 'john-harrison',
              nextUpdateNote: 'Further progress update after investigation',
              channelId: 'teams',
              confirmedById: 'ajay-raj',
              referenceDate: SIMULATED_ADVANCE_DATE,
              actionIds: ['coordinate_investigation'],
            }).ok === false,
            'Ajay cannot confirm stakeholder communication',
          )
          assert(
            applyStakeholderCommunication(structuredClone(blockedBase), {
              message: AI_STAKEHOLDER_UPDATE_DRAFT,
              recipientId: 'john-harrison',
              nextUpdateNote: null,
              channelId: 'teams',
              confirmedById: 'john-harrison',
              referenceDate: SIMULATED_ADVANCE_DATE,
              actionIds: ['coordinate_investigation'],
            }).ok === false,
            'John cannot confirm stakeholder communication',
          )

          const confirmedComms = applyStakeholderCommunication(
            structuredClone(
              troubleshoot.ok ? troubleshoot.bundle : blockedBase,
            ),
            {
              message:
                'During integration testing, the team identified an intermittent issue with the regional approval service.',
              recipientId: 'john-harrison',
              nextUpdateNote: 'Further progress update after investigation',
              channelId: 'teams',
              confirmedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
              actionIds: [
                'coordinate_investigation',
                'assess_target_impact',
                'update_business_owner',
              ],
            },
          )
          assert(
            confirmedComms.ok === true,
            'Radhe can confirm stakeholder communication without requiring prior troubleshooting dependency beyond blocked state',
          )
          if (confirmedComms.ok) {
            assert(
              confirmedComms.bundle.followUp?.responseDetail ===
                BLOCKED_TECHNICAL_DETAIL,
              'Original blocker unchanged after stakeholder confirm',
            )
            assert(
              getConfirmedStakeholderMessage(
                confirmedComms.bundle.blockerResolution,
              )?.includes('intermittent issue') === true,
              'Confirmed communication visible to John',
            )
            assert(
              confirmedComms.bundle.blockerResolution?.coordination
                .selectedActionIds.length === 3,
              'Confirmed coordination actions persist',
            )
            assert(
              confirmedComms.bundle.timelineEvents.filter(
                (e) => e.id === STAKEHOLDER_TIMELINE_EVENT_ID,
              ).length === 1,
              'Exactly one stakeholder timeline event',
            )
            assert(
              confirmedComms.bundle.mainRequest.lifecycleStage === 'Execution' &&
                confirmedComms.bundle.mainRequest.workflowStatus === 'Blocked' &&
                confirmedComms.bundle.mainRequest.deliveryHealth === 'At Risk',
              'REQ1235 remains Execution / Blocked / At Risk after Build 6',
            )
            assert(
              applyStakeholderCommunication(
                structuredClone(confirmedComms.bundle),
                {
                  message: 'Duplicate attempt',
                  recipientId: 'john-harrison',
                  nextUpdateNote: null,
                  channelId: 'teams',
                  confirmedById: 'radhe-shyam',
                  referenceDate: SIMULATED_ADVANCE_DATE,
                  actionIds: ['coordinate_investigation'],
                },
              ).ok === false,
              'Duplicate stakeholder confirmation rejected',
            )

            // Refresh / hydrate persistence of developer progress
            const rehydrated = hydrateBlockerResolution(
              confirmedComms.bundle.blockerResolution,
            )
            assert(
              rehydrated.troubleshooting.decisionState === 'recorded' &&
                rehydrated.troubleshooting.progressNote?.includes('latency') ===
                  true,
              'Developer progress survives hydrate/refresh',
            )
          }

          // Confirm without troubleshooting first remains valid
          const confirmWithoutTroubleshoot = applyStakeholderCommunication(
            structuredClone(blockedBase),
            {
              message: AI_STAKEHOLDER_UPDATE_DRAFT,
              recipientId: 'john-harrison',
              nextUpdateNote: null,
              channelId: 'slack',
              confirmedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
              actionIds: ['arrange_focused_discussion'],
            },
          )
          assert(
            confirmWithoutTroubleshoot.ok === true,
            'Radhe confirm does not require Ajay troubleshooting first',
          )

          // --- Build 7: smart meeting ---
          const intent = parseMeetingIntent(
            MEETING_SAMPLE_PROMPT,
            SIMULATED_ADVANCE_DATE,
          )
          assert(intent.ok === true, 'Sample meeting intent must be recognized')
          if (intent.ok) {
            assert(
              intent.suggestion.meetingDate === '2026-10-22',
              'Sample intent resolves to October 22',
            )
            assert(
              intent.suggestion.startTime === '10:00' &&
                intent.suggestion.endTime === '10:30',
              'Sample intent resolves to 10:00–10:30',
            )
          }

          assert(
            parseMeetingIntent('schedule lunch with everyone', SIMULATED_ADVANCE_DATE)
              .ok === false,
            'Unsupported NL intent must fail honestly',
          )

          const meetingBase = blockedBase
          assert(
            hydrateMeeting(undefined) === undefined,
            'Legacy bundles hydrate without inventing a meeting',
          )

          assert(
            applyMeetingConfirmation(structuredClone(meetingBase), {
              title: MEETING_DEFAULT_TITLE,
              purpose: 'Coordinate investigation',
              meetingDate: '2026-10-22',
              startTime: '10:00',
              durationMinutes: 30,
              attendeeIds: [
                'radhe-shyam',
                'ajay-raj',
                'sreekanth-mamdekar',
              ],
              agenda: [...MEETING_DEFAULT_AGENDA],
              scheduleNote: null,
              confirmedById: 'ajay-raj',
              referenceDate: SIMULATED_ADVANCE_DATE,
            }).ok === false,
            'Ajay cannot confirm a meeting',
          )

          assert(
            applyMeetingConfirmation(structuredClone(meetingBase), {
              title: '',
              purpose: 'Coordinate investigation',
              meetingDate: '2026-10-22',
              startTime: '10:00',
              durationMinutes: 30,
              attendeeIds: [
                'radhe-shyam',
                'ajay-raj',
                'sreekanth-mamdekar',
              ],
              agenda: [...MEETING_DEFAULT_AGENDA],
              scheduleNote: null,
              confirmedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
            }).ok === false,
            'Empty title must be rejected',
          )

          assert(
            applyMeetingConfirmation(structuredClone(meetingBase), {
              title: MEETING_DEFAULT_TITLE,
              purpose: 'Coordinate investigation',
              meetingDate: '2026-10-20',
              startTime: '10:00',
              durationMinutes: 30,
              attendeeIds: [
                'radhe-shyam',
                'ajay-raj',
                'sreekanth-mamdekar',
              ],
              agenda: [...MEETING_DEFAULT_AGENDA],
              scheduleNote: null,
              confirmedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
            }).ok === false,
            'Meeting before simulated date must be rejected',
          )

          assert(
            applyMeetingConfirmation(structuredClone(meetingBase), {
              title: MEETING_DEFAULT_TITLE,
              purpose: 'Coordinate investigation',
              meetingDate: '2026-10-22',
              startTime: '10:00',
              durationMinutes: 30,
              attendeeIds: ['radhe-shyam'],
              agenda: [...MEETING_DEFAULT_AGENDA],
              scheduleNote: null,
              confirmedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
            }).ok === false,
            'Organizer-only attendee list must be rejected',
          )

          const editedTitle = 'Edited Blocker Resolution Working Session'
          const meetingConfirmed = applyMeetingConfirmation(
            structuredClone(meetingBase),
            {
              title: editedTitle,
              purpose: 'Focus the technical investigation owners.',
              meetingDate: '2026-10-22',
              startTime: '10:00',
              durationMinutes: 30,
              attendeeIds: [
                'radhe-shyam',
                'ajay-raj',
                'sreekanth-mamdekar',
              ],
              agenda: [...MEETING_DEFAULT_AGENDA],
              scheduleNote: 'Recommended demo slot for October 22 (not calendar-verified).',
              confirmedById: 'radhe-shyam',
              referenceDate: SIMULATED_ADVANCE_DATE,
            },
          )
          assert(meetingConfirmed.ok === true, 'Radhe can confirm meeting')
          if (meetingConfirmed.ok) {
            const mtg = meetingConfirmed.bundle.meeting
            assert(mtg?.id === MEETING_ID, 'Meeting id stable')
            assert(mtg?.title === editedTitle, 'Edited title retained')
            assert(mtg?.status === 'scheduled', 'Meeting status scheduled')
            assert(
              mtg?.attendeeIds.includes('ajay-raj') === true &&
                mtg?.attendeeIds.includes('sreekanth-mamdekar') === true,
              'Ajay and Sreekanth are attendees',
            )
            assert(
              mtg !== undefined &&
                isMeetingVisibleToPersona(mtg, 'ajay-raj') &&
                isMeetingVisibleToPersona(mtg, 'sreekanth-mamdekar'),
              'Ajay and Sreekanth can see the meeting',
            )
            assert(
              mtg !== undefined &&
                isMeetingVisibleToPersona(mtg, 'sanjay-parashar') === false,
              'Sanjay cannot see meeting when not selected',
            )
            assert(
              mtg !== undefined &&
                isMeetingVisibleToPersona(mtg, 'john-harrison') === false,
              'John is not an attendee by default',
            )
            assert(
              meetingConfirmed.bundle.mainRequest.parties.integrationLeadId ===
                undefined,
              'Meeting does not mutate RequestParties integrationLeadId',
            )
            assert(
              isRequestVisibleToPersona(
                meetingConfirmed.bundle.mainRequest,
                'sreekanth-mamdekar',
              ) === false,
              'Sreekanth still cannot see REQ1235 via request visibility',
            )
            assert(
              meetingConfirmed.bundle.followUp?.responseDetail ===
                BLOCKED_TECHNICAL_DETAIL,
              'Original blocker unchanged after meeting',
            )
            assert(
              meetingConfirmed.bundle.mainRequest.lifecycleStage ===
                'Execution' &&
                meetingConfirmed.bundle.mainRequest.workflowStatus ===
                  'Blocked' &&
                meetingConfirmed.bundle.mainRequest.deliveryHealth ===
                  'At Risk' &&
                meetingConfirmed.bundle.mainRequest.targetDate === '2026-10-23',
              'REQ1235 remains Execution / Blocked / At Risk with Oct 23 target',
            )
            assert(
              meetingConfirmed.bundle.timelineEvents.filter(
                (e) => e.id === MEETING_TIMELINE_EVENT_ID,
              ).length === 1,
              'Exactly one meeting timeline event',
            )
            assert(
              meetingConfirmed.bundle.activityEntries.filter(
                (e) => e.id === MEETING_ACTIVITY_ID,
              ).length === 1,
              'Exactly one meeting activity entry',
            )
            assert(
              applyMeetingConfirmation(
                structuredClone(meetingConfirmed.bundle),
                {
                  title: 'Duplicate',
                  purpose: 'Should fail',
                  meetingDate: '2026-10-22',
                  startTime: '10:00',
                  durationMinutes: 30,
                  attendeeIds: [
                    'radhe-shyam',
                    'ajay-raj',
                    'sreekanth-mamdekar',
                  ],
                  agenda: [...MEETING_DEFAULT_AGENDA],
                  scheduleNote: null,
                  confirmedById: 'radhe-shyam',
                  referenceDate: SIMULATED_ADVANCE_DATE,
                },
              ).ok === false,
              'Duplicate meeting confirmation rejected',
            )

            const withSanjay = applyMeetingConfirmation(
              structuredClone(meetingBase),
              {
                title: MEETING_DEFAULT_TITLE,
                purpose: 'Include architect',
                meetingDate: '2026-10-22',
                startTime: '10:00',
                durationMinutes: 30,
                attendeeIds: [
                  'radhe-shyam',
                  'ajay-raj',
                  'sreekanth-mamdekar',
                  'sanjay-parashar',
                ],
                agenda: [...MEETING_DEFAULT_AGENDA],
                scheduleNote: null,
                confirmedById: 'radhe-shyam',
                referenceDate: SIMULATED_ADVANCE_DATE,
              },
            )
            assert(withSanjay.ok === true, 'Optional Sanjay attendee allowed')
            if (withSanjay.ok && withSanjay.bundle.meeting) {
              assert(
                isMeetingVisibleToPersona(
                  withSanjay.bundle.meeting,
                  'sanjay-parashar',
                ),
                'Sanjay sees meeting when selected',
              )
            }

            const rehydratedMeeting = hydrateMeeting(
              meetingConfirmed.bundle.meeting,
            )
            assert(
              rehydratedMeeting?.title === editedTitle,
              'Meeting survives hydrate/refresh',
            )
          }
        }

        assert(
          applyFollowUpResponse(structuredClone(withFollowUp), {
            kind: 'on_track',
            referenceDate: SIMULATED_ADVANCE_DATE,
          }).ok === true,
          'On Track response must succeed',
        )
        assert(
          applyFollowUpResponse(structuredClone(withFollowUp), {
            kind: 'other',
            detail: '   ',
            referenceDate: SIMULATED_ADVANCE_DATE,
          }).ok === false,
          'Empty Other Update must fail',
        )
      }

      // Slack channel at trigger time is presentation-only metadata
      const assignedFresh = assignResult.bundle
      const slackOnly = applyFollowUpTrigger(
        assignedFresh,
        SIMULATED_ADVANCE_DATE,
        'slack',
      )
      assert(
        slackOnly.ok === true &&
          slackOnly.created === true &&
          slackOnly.bundle.followUp?.channelId === 'slack',
        'Slack can be recorded as presentation channel without changing business rules',
      )
      assert(
        slackOnly.ok &&
          slackOnly.bundle.mainRequest.lifecycleStage === 'Execution' &&
          slackOnly.bundle.mainRequest.parties.developerId === 'ajay-raj',
        'Slack channel does not alter execution assignment state',
      )
    }
  }
}

// Legacy Build 4 session (estimate confirmed, no approval) can still business-approve
const legacyPlanning = acceptResult.ok
  ? {
      ...acceptResult.bundle,
      approval: undefined,
      assignment: undefined,
      execution: undefined,
      followUp: undefined,
    }
  : null
if (legacyPlanning) {
  const legacyApprove = applyBusinessApproval(
    legacyPlanning,
    'john-harrison',
    SIMULATED_TODAY,
  )
  assert(legacyApprove.ok === true, 'Build 4 sessions must hydrate into John approval path')
}

// Legacy combined Build 5 Execution session without separate assignment record
if (acceptResult.ok) {
  const legacyCombined = {
    ...acceptResult.bundle,
    approval: {
      approvedById: 'radhe-shyam' as const,
      approvedAt: `${SIMULATED_TODAY}T11:00:00`,
      assignedDeveloperId: 'ajay-raj' as const,
    },
    assignment: undefined,
    execution: {
      reportedProgressPercent: 60,
      lastDeveloperUpdateDate: '2026-10-19',
    },
    mainRequest: {
      ...acceptResult.bundle.mainRequest,
      lifecycleStage: 'Execution' as const,
      workflowStatus: 'In Progress' as const,
      primaryOwnerId: 'radhe-shyam' as const,
      parties: {
        ...acceptResult.bundle.mainRequest.parties,
        developerId: 'ajay-raj' as const,
      },
    },
    timelineEvents: acceptResult.bundle.timelineEvents.filter(
      (e) =>
        e.id !== APPROVAL_TIMELINE_EVENT_ID &&
        e.id !== ASSIGNMENT_TIMELINE_EVENT_ID,
    ),
  }
  const hydratedApproval = hydrateApprovalRecord(legacyCombined.approval)
  const hydratedAssignment = hydrateAssignmentRecord(legacyCombined)
  assert(
    hydratedApproval?.approvedById === 'radhe-shyam',
    'Legacy approval actor preserved without inventing new events',
  )
  assert(
    hydratedAssignment?.assignedDeveloperId === 'ajay-raj',
    'Legacy Execution session hydrates assignment in memory',
  )
  assert(
    legacyCombined.timelineEvents.every(
      (e) =>
        e.id !== APPROVAL_TIMELINE_EVENT_ID &&
        e.id !== ASSIGNMENT_TIMELINE_EVENT_ID,
    ),
    'Hydration must not fabricate historical approval/assignment timeline events',
  )
  assert(
    isFollowUpTriggerEligible(legacyCombined, SIMULATED_ADVANCE_DATE) === true,
    'Legacy Execution sessions remain eligible for follow-up trigger',
  )
}

// Reset semantics: dropping the submitted request restores seed counts
const afterReset = PORTFOLIO_REQUESTS
for (const persona of PERSONAS) {
  const visible = getVisibleRequests(persona.id, afterReset)
  assert(
    visible.length === EXPECTED_PERSONA_VISIBLE_COUNTS[persona.id],
    `After reset visible for ${persona.id} should match seed`,
  )
}
assert(SIMULATED_TODAY === '2026-10-17', 'Baseline simulated date constant must remain Oct 17')

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
  advanceDate: SIMULATED_ADVANCE_DATE,
}

console.log(JSON.stringify(report, null, 2))
if (issues.length > 0) {
  process.exitCode = 1
}
