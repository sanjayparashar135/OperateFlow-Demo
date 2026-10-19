import type { CollaborationChannelId } from '../types/simulation'
import { MAIN_JIRA_ID, MAIN_REQUEST_ID } from '../types/simulation'
import { formatDisplayDate } from '../lib/format'
import { getCollaborationChannel } from './collaborationChannel'
import {
  getActiveDemoCalendar,
  type DemoCalendar,
} from './simDate'

export const FOLLOW_UP_ID = 'fu-req1235-01'
export const FOLLOW_UP_TIMELINE_EVENT_ID = 'tl-req1235-09'
export const FOLLOW_UP_RESPONSE_TIMELINE_EVENT_ID = 'tl-req1235-10'
export const FOLLOW_UP_ACTIVITY_ID = 'act-req1235-06'
export const FOLLOW_UP_RESPONSE_ACTIVITY_ID = 'act-req1235-07'

export const BLOCKED_TECHNICAL_DETAIL =
  'The regional approval service intermittently returns HTTP 504. Approval callbacks aren\'t being persisted, blocking integration testing.'

export function buildFollowUpMessage(
  channelId: CollaborationChannelId = 'teams',
  calendar: DemoCalendar = getActiveDemoCalendar(),
): string {
  const channel = getCollaborationChannel(channelId)
  const targetLabel = formatDisplayDate(calendar.targetDate)
  const lastUpdateLabel = formatDisplayDate(calendar.lastDeveloperUpdateDate)
  return (
    `Hi Ajay — OperateFlow is checking status on ${MAIN_JIRA_ID} (${MAIN_REQUEST_ID}) ` +
    `via ${channel.label} before the ${targetLabel} target. The last developer update was ${lastUpdateLabel} and the deadline is two days away. ` +
    `Please confirm whether delivery remains on track.`
  )
}
