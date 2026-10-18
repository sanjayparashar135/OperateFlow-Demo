import type { DiagnosticDirectionId } from '../types/simulation'

export interface DiagnosticDirection {
  id: DiagnosticDirectionId
  title: string
  summary: string
  steps: string[]
}

export const TROUBLESHOOTING_ISSUE_SUMMARY =
  'Ajay reported intermittent HTTP 504 responses from the regional approval service and approval callbacks that are not being persisted, which is blocking integration testing.'

export const DIAGNOSTIC_DIRECTIONS: DiagnosticDirection[] = [
  {
    id: 'regional_timeout',
    title: 'Regional approval service timeout',
    summary:
      'Investigate whether downstream latency or timeout configuration is causing intermittent 504 responses.',
    steps: [
      'Check downstream response latency for the regional approval service.',
      'Inspect timeout configuration on the approval integration path.',
      'Review service health indicators and relevant application logs.',
    ],
  },
  {
    id: 'callback_persistence',
    title: 'Callback persistence',
    summary:
      'Investigate whether approval callbacks are delivered, acknowledged, and persisted reliably.',
    steps: [
      'Verify callback delivery and acknowledgement for approval events.',
      'Check persistence failures and related exception logs.',
      'Investigate retry behavior and idempotency handling.',
    ],
  },
  {
    id: 'integration_dependency',
    title: 'Integration dependency',
    summary:
      'Investigate connectivity and correlation across the integration path, coordinating with the Integration Lead where helpful.',
    steps: [
      'Review integration-service connectivity to the regional approval path.',
      'Check relevant request correlation IDs across services.',
      'Coordinate with Integration Lead Sreekanth Mamdekar where appropriate.',
    ],
  },
]

export function getDiagnosticDirection(
  id: DiagnosticDirectionId,
): DiagnosticDirection | undefined {
  return DIAGNOSTIC_DIRECTIONS.find((direction) => direction.id === id)
}
