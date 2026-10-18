import type { PersonaId } from '../types/persona'
import type {
  DeliveryHealth,
  LifecycleStage,
  WorkflowStatus,
} from '../types/delivery'
import type { SubmittedSimulationBundle } from '../types/simulation'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../types/simulation'
import {
  DIAGNOSTIC_DIRECTIONS,
  TROUBLESHOOTING_ISSUE_SUMMARY,
  type DiagnosticDirection,
} from './blockerTroubleshootingDataset'
import { BLOCKED_TECHNICAL_DETAIL } from './followUpDataset'
import { hydrateEstimationDecision } from './estimationHelpers'
import {
  hydrateMeeting,
  isMeetingVisibleToPersona,
} from './meetingHelpers'
import { isRequestVisibleToPersona } from './portfolioSelectors'
import { formatDisplayDate } from '../lib/format'

export const MEETING_BRIEFING_CLIENT = 'Northstar Financial Services'

export const MEETING_BRIEFING_INTEGRATION_OBJECTIVE =
  'You are invited as Integration Lead to collaborate with Ajay Raj and Radhe Shyam on the regional approval integration blocker: clarify investigation ownership, validate timeout and callback-persistence hypotheses, and agree next technical actions while the October 23 target remains under assessment.'

export interface MeetingRequestBriefing {
  requestId: string
  jiraId: string
  title: string
  client: string
  application: string
  businessObjective: string
  progressMilestones: string[]
  currentBlocker: string | null
  diagnosticDirections: DiagnosticDirection[]
  meetingObjective: string
  lifecycleStage: LifecycleStage
  workflowStatus: WorkflowStatus
  deliveryHealth: DeliveryHealth
  targetDateLabel: string
}

/**
 * Meeting attendees without Request Details access may open a read-only
 * AI briefing for the meeting's related request only.
 */
export function canViewMeetingRequestBriefing(
  bundle: SubmittedSimulationBundle | null,
  personaId: PersonaId,
): boolean {
  if (!bundle) return false
  const meeting = hydrateMeeting(bundle.meeting)
  if (!meeting) return false
  if (meeting.requestId !== MAIN_REQUEST_ID) return false
  if (!isMeetingVisibleToPersona(meeting, personaId)) return false
  return !isRequestVisibleToPersona(bundle.mainRequest, personaId)
}

function buildProgressMilestones(
  bundle: SubmittedSimulationBundle,
): string[] {
  const milestones: string[] = []
  const estimation = hydrateEstimationDecision(bundle.estimation)

  milestones.push(
    'Intelligent Intake completed; ServiceNow and Jira records created for technical review.',
  )

  if (estimation?.decisionState === 'confirmed') {
    const hours = estimation.confirmedHours
    milestones.push(
      hours != null
        ? `Technical estimate confirmed (${hours} hours); awaiting business approval.`
        : 'Technical estimate confirmed; awaiting business approval.',
    )
  }

  if (bundle.approval) {
    milestones.push(
      'Business owner approved the estimate and delivery approach.',
    )
  }

  if (bundle.assignment) {
    milestones.push(
      'Project manager assigned development resources and moved work into Execution.',
    )
  }

  if (
    bundle.execution ||
    bundle.mainRequest.lifecycleStage === 'Execution'
  ) {
    const progress = bundle.execution?.reportedProgressPercent
    milestones.push(
      progress != null
        ? `Execution in progress with developer-reported progress at ${progress}%.`
        : 'Execution in progress with developer delivery underway.',
    )
  }

  if (bundle.followUp) {
    milestones.push(
      'Proactive developer follow-up was issued ahead of the delivery target.',
    )
  }

  if (bundle.followUp?.responseKind === 'blocked') {
    milestones.push(
      'Developer reported a blocker that placed delivery health At Risk.',
    )
  }

  return milestones
}

function buildBusinessObjectiveNarrative(
  bundle: SubmittedSimulationBundle,
): string {
  const req = bundle.requirements
  return (
    `${req.businessObjective} ` +
    `${req.activationConstraint} ` +
    `${req.pendingRejectedBehavior}`
  )
}

/**
 * Builds a read-only meeting-ready briefing from the current simulation bundle.
 * Returns null when the confirmed meeting / related request are not available.
 */
export function buildMeetingRequestBriefing(
  bundle: SubmittedSimulationBundle | null,
): MeetingRequestBriefing | null {
  if (!bundle) return null
  const meeting = hydrateMeeting(bundle.meeting)
  if (!meeting || meeting.requestId !== MAIN_REQUEST_ID) return null

  const request = bundle.mainRequest
  const jira =
    bundle.linkedRecords.find((record) => record.system === 'Jira')?.id ??
    MAIN_JIRA_ID

  const blocked =
    request.workflowStatus === 'Blocked' ||
    bundle.followUp?.responseKind === 'blocked'

  return {
    requestId: request.id,
    jiraId: jira,
    title: request.title,
    client: MEETING_BRIEFING_CLIENT,
    application: request.application,
    businessObjective: buildBusinessObjectiveNarrative(bundle),
    progressMilestones: buildProgressMilestones(bundle),
    currentBlocker: blocked
      ? bundle.followUp?.responseDetail?.trim() ||
        BLOCKED_TECHNICAL_DETAIL ||
        TROUBLESHOOTING_ISSUE_SUMMARY
      : null,
    diagnosticDirections: [...DIAGNOSTIC_DIRECTIONS],
    meetingObjective: MEETING_BRIEFING_INTEGRATION_OBJECTIVE,
    lifecycleStage: request.lifecycleStage,
    workflowStatus: request.workflowStatus,
    deliveryHealth: request.deliveryHealth,
    targetDateLabel: formatDisplayDate(request.targetDate),
  }
}
