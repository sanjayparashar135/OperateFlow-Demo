import type { CoordinationActionId } from '../types/simulation'

export interface CoordinationActionSuggestion {
  id: CoordinationActionId
  title: string
  detail: string
}

export const COORDINATION_ACTIONS: CoordinationActionSuggestion[] = [
  {
    id: 'coordinate_investigation',
    title: 'Coordinate investigation',
    detail:
      'Coordinate investigation with Ajay and the Integration Lead on the regional approval dependency.',
  },
  {
    id: 'assess_target_impact',
    title: 'Assess target-date impact',
    detail:
      'Assess the impact on integration testing and the October 23 target while investigation continues.',
  },
  {
    id: 'update_business_owner',
    title: 'Update business owner',
    detail:
      'Provide John with a clear business-oriented progress update on delivery risk.',
  },
  {
    id: 'arrange_focused_discussion',
    title: 'Arrange focused discussion',
    detail:
      'Arrange a focused discussion if the integration dependency cannot be cleared promptly.',
  },
]

/** AI-drafted client-facing rewrite. Static suggestion until Radhe confirms. */
export const AI_STAKEHOLDER_UPDATE_DRAFT =
  'During integration testing, the team identified an intermittent issue with the regional approval service that is preventing validation of the new approval workflow. The delivery team is investigating the issue and coordinating the required technical support. The October 23 target is being assessed, and we will provide a further progress update.'

export const DEFAULT_NEXT_UPDATE_NOTE =
  'Further progress update after technical investigation'

export const BUILD7_MEETING_HANDOFF =
  'The integration issue may benefit from focused coordination between Ajay, Sreekanth, and Radhe.'

export const STAKEHOLDER_RECIPIENT_ID = 'john-harrison' as const

export function getCoordinationAction(
  id: CoordinationActionId,
): CoordinationActionSuggestion | undefined {
  return COORDINATION_ACTIONS.find((action) => action.id === id)
}

export function getCoordinationActionLabels(
  ids: CoordinationActionId[],
): string[] {
  return ids
    .map((id) => getCoordinationAction(id)?.title)
    .filter((title): title is string => Boolean(title))
}
