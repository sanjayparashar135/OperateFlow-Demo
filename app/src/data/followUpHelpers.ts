import type {
  CollaborationChannelId,
  FollowUpRecord,
  FollowUpResponseKind,
  SubmittedSimulationBundle,
} from '../types/simulation'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../types/simulation'
import { hydrateAssignmentRecord } from './approvalHelpers'
import {
  DEFAULT_COLLABORATION_CHANNEL,
  getCollaborationChannel,
  isCollaborationChannelId,
} from './collaborationChannel'
import { formatDisplayDate } from '../lib/format'
import { daysUntilTarget } from './portfolioSelectors'
import {
  getActiveDemoCalendar,
  type DemoCalendar,
} from './simDate'
import {
  BLOCKED_TECHNICAL_DETAIL,
  FOLLOW_UP_ACTIVITY_ID,
  FOLLOW_UP_ID,
  FOLLOW_UP_RESPONSE_ACTIVITY_ID,
  FOLLOW_UP_RESPONSE_TIMELINE_EVENT_ID,
  FOLLOW_UP_TIMELINE_EVENT_ID,
  buildFollowUpMessage,
} from './followUpDataset'

export type ApplyFollowUpTriggerResult =
  | { ok: true; bundle: SubmittedSimulationBundle; created: boolean }
  | { ok: false; reason: string }

export type ApplyFollowUpResponseResult =
  | { ok: true; bundle: SubmittedSimulationBundle }
  | { ok: false; reason: string }

export interface FollowUpResponseInput {
  kind: FollowUpResponseKind
  detail?: string
  referenceDate: string
}

export function hydrateFollowUp(
  followUp: FollowUpRecord | undefined,
): FollowUpRecord | undefined {
  if (!followUp) return undefined
  return {
    ...followUp,
    channelId: isCollaborationChannelId(followUp.channelId)
      ? followUp.channelId
      : DEFAULT_COLLABORATION_CHANNEL,
  }
}

export function isFollowUpTriggerEligible(
  bundle: SubmittedSimulationBundle,
  simulatedToday: string,
  calendar: DemoCalendar = getActiveDemoCalendar(),
): boolean {
  const { mainRequest, execution, followUp } = bundle
  if (followUp) return false
  if (!execution) return false
  // Assignment may be explicit or legacy-hydrated; developerId is the durable signal.
  const assignment = hydrateAssignmentRecord(bundle)
  if (!assignment && mainRequest.parties.developerId !== 'ajay-raj') return false
  if (mainRequest.lifecycleStage !== 'Execution') return false
  if (mainRequest.parties.developerId !== 'ajay-raj') return false
  if (simulatedToday !== calendar.advanceDate) return false
  if (daysUntilTarget(mainRequest.targetDate, simulatedToday) !== 2) return false
  // Stale developer update relative to the scripted last-update cutoff (D+2).
  if (execution.lastDeveloperUpdateDate > calendar.lastDeveloperUpdateDate) {
    return false
  }
  return true
}

export function applyFollowUpTrigger(
  bundle: SubmittedSimulationBundle,
  simulatedToday: string,
  channelId: CollaborationChannelId = DEFAULT_COLLABORATION_CHANNEL,
  calendar: DemoCalendar = getActiveDemoCalendar(),
): ApplyFollowUpTriggerResult {
  if (bundle.followUp) {
    return { ok: true, bundle, created: false }
  }
  if (
    bundle.timelineEvents.some(
      (event) => event.id === FOLLOW_UP_TIMELINE_EVENT_ID,
    )
  ) {
    return { ok: true, bundle, created: false }
  }
  if (!isFollowUpTriggerEligible(bundle, simulatedToday, calendar)) {
    return { ok: false, reason: 'Follow-up trigger conditions not met.' }
  }

  const channel = getCollaborationChannel(channelId)
  const triggeredAt = `${simulatedToday}T09:00:00`
  const message = buildFollowUpMessage(channelId, calendar)
  const followUp: FollowUpRecord = {
    id: FOLLOW_UP_ID,
    status: 'open',
    triggeredAt,
    message,
    channelId,
    responseKind: null,
    responseDetail: null,
    respondedAt: null,
  }

  return {
    ok: true,
    created: true,
    bundle: {
      ...bundle,
      followUp,
      timelineEvents: [
        ...bundle.timelineEvents,
        {
          id: FOLLOW_UP_TIMELINE_EVENT_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: triggeredAt,
          title: 'Proactive status follow-up opened',
          detail: `OperateFlow opened a ${channel.label} status check with Ajay Raj for ${MAIN_JIRA_ID} (target ${calendar.targetDate}; two days remaining).`,
          source: 'system',
          category: 'follow_up',
        },
      ],
      activityEntries: [
        ...bundle.activityEntries,
        {
          id: FOLLOW_UP_ACTIVITY_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: triggeredAt,
          actor: 'OperateFlow',
          category: 'progress',
          message: `Follow-up sent via ${channel.label} to Ajay Raj for ${MAIN_REQUEST_ID}.`,
        },
      ],
    },
  }
}

export function applyFollowUpResponse(
  bundle: SubmittedSimulationBundle,
  input: FollowUpResponseInput,
  calendar: DemoCalendar = getActiveDemoCalendar(),
): ApplyFollowUpResponseResult {
  const followUp = bundle.followUp
  if (!followUp) {
    return { ok: false, reason: 'No open follow-up to respond to.' }
  }
  if (followUp.status === 'responded') {
    return { ok: false, reason: 'Follow-up already responded.' }
  }
  if (
    bundle.timelineEvents.some(
      (event) => event.id === FOLLOW_UP_RESPONSE_TIMELINE_EVENT_ID,
    )
  ) {
    return { ok: false, reason: 'Follow-up already responded.' }
  }

  let responseDetail: string | null = null
  let workflowStatus = bundle.mainRequest.workflowStatus
  let deliveryHealth = bundle.mainRequest.deliveryHealth
  let timelineDetail = ''
  let activityMessage = ''

  const targetLabel = formatDisplayDate(calendar.targetDate)

  switch (input.kind) {
    case 'on_track':
      responseDetail = `Developer reported delivery remains on track for the ${targetLabel} target.`
      workflowStatus = 'In Progress'
      deliveryHealth = 'On Track'
      timelineDetail = `Ajay Raj reported ${MAIN_JIRA_ID} is on track for ${calendar.targetDate}.`
      activityMessage = `${MAIN_REQUEST_ID}: developer reported On Track.`
      break
    case 'completed':
      responseDetail =
        'Developer reported the work as completed. Pending verification before UAT handoff.'
      workflowStatus = 'In Progress'
      deliveryHealth = 'On Track'
      timelineDetail = `Ajay Raj reported ${MAIN_JIRA_ID} completed (pending verification). Request remains in Execution.`
      activityMessage = `${MAIN_REQUEST_ID}: developer reported Completed (pending verification).`
      break
    case 'other': {
      const text = input.detail?.trim() ?? ''
      if (!text) {
        return { ok: false, reason: 'Other Update requires a non-empty response.' }
      }
      responseDetail = text
      workflowStatus = 'In Progress'
      deliveryHealth = 'On Track'
      timelineDetail = `Ajay Raj provided an update on ${MAIN_JIRA_ID}: ${text}`
      activityMessage = `${MAIN_REQUEST_ID}: developer provided an Other Update.`
      break
    }
    case 'blocked':
      responseDetail = BLOCKED_TECHNICAL_DETAIL
      workflowStatus = 'Blocked'
      deliveryHealth = 'At Risk'
      timelineDetail = `Ajay Raj reported a blocker on ${MAIN_JIRA_ID}: ${BLOCKED_TECHNICAL_DETAIL}`
      activityMessage = `${MAIN_REQUEST_ID}: developer reported I'm Blocked.`
      break
    default:
      return { ok: false, reason: 'Unsupported response kind.' }
  }

  const respondedAt = `${input.referenceDate}T10:30:00`
  const nextFollowUp: FollowUpRecord = {
    ...followUp,
    status: 'responded',
    responseKind: input.kind,
    responseDetail,
    respondedAt,
  }

  return {
    ok: true,
    bundle: {
      ...bundle,
      followUp: nextFollowUp,
      mainRequest: {
        ...bundle.mainRequest,
        lifecycleStage: 'Execution',
        workflowStatus,
        deliveryHealth,
        lastUpdated: input.referenceDate,
        attentionReasons:
          input.kind === 'blocked'
            ? [
                `Developer reported a blocker affecting the ${targetLabel} target`,
              ]
            : undefined,
      },
      timelineEvents: [
        ...bundle.timelineEvents,
        {
          id: FOLLOW_UP_RESPONSE_TIMELINE_EVENT_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: respondedAt,
          title: 'Developer follow-up response recorded',
          detail: timelineDetail,
          source: 'human',
          category: 'follow_up',
        },
      ],
      activityEntries: [
        ...bundle.activityEntries,
        {
          id: FOLLOW_UP_RESPONSE_ACTIVITY_ID,
          requestId: MAIN_REQUEST_ID,
          timestamp: respondedAt,
          actor: 'Ajay Raj',
          category: input.kind === 'blocked' ? 'risk' : 'progress',
          message: activityMessage,
        },
      ],
    },
  }
}
