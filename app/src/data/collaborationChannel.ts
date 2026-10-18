import type { CollaborationChannelId } from '../types/simulation'

export const COLLABORATION_CHANNEL_STORAGE_KEY =
  'operateflow.collaborationChannel'

export const DEFAULT_COLLABORATION_CHANNEL: CollaborationChannelId = 'teams'

export interface CollaborationChannelConfig {
  id: CollaborationChannelId
  label: string
  shortLabel: string
}

export const COLLABORATION_CHANNELS: Record<
  CollaborationChannelId,
  CollaborationChannelConfig
> = {
  teams: {
    id: 'teams',
    label: 'Microsoft Teams',
    shortLabel: 'Teams',
  },
  slack: {
    id: 'slack',
    label: 'Slack',
    shortLabel: 'Slack',
  },
}

export function isCollaborationChannelId(
  value: unknown,
): value is CollaborationChannelId {
  return value === 'teams' || value === 'slack'
}

export function getCollaborationChannel(
  id: CollaborationChannelId = DEFAULT_COLLABORATION_CHANNEL,
): CollaborationChannelConfig {
  return COLLABORATION_CHANNELS[id] ?? COLLABORATION_CHANNELS.teams
}

export function readStoredCollaborationChannel(): CollaborationChannelId {
  try {
    const raw = sessionStorage.getItem(COLLABORATION_CHANNEL_STORAGE_KEY)
    if (isCollaborationChannelId(raw)) return raw
  } catch {
    // Ignore unavailable sessionStorage.
  }
  return DEFAULT_COLLABORATION_CHANNEL
}

export function writeStoredCollaborationChannel(
  id: CollaborationChannelId,
): void {
  try {
    sessionStorage.setItem(COLLABORATION_CHANNEL_STORAGE_KEY, id)
  } catch {
    // Ignore unavailable sessionStorage.
  }
}
