export type RequestDetailsTabId =
  | 'summary'
  | 'requirements'
  | 'activity'
  | 'linked'
  | 'estimation'

export const REQUEST_DETAILS_TABS: {
  id: RequestDetailsTabId
  label: string
}[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'activity', label: 'Activity' },
  { id: 'linked', label: 'Linked Records' },
  { id: 'estimation', label: 'Estimation' },
]
