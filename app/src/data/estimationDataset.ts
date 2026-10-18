import type { EstimationSuggestion } from '../types/simulation'

/** Fictional historical comparables and AI-suggested estimate for REQ1235. */
export const ESTIMATION_SUGGESTION: EstimationSuggestion = {
  suggestedHours: 56,
  rangeMin: 48,
  rangeMax: 64,
  breakdown: [
    { component: 'Analysis & design', hours: 8 },
    { component: 'Approval workflow', hours: 20 },
    { component: 'API integration', hours: 12 },
    { component: 'Testing', hours: 12 },
    { component: 'Deployment preparation', hours: 4 },
  ],
  comparables: [
    {
      jiraId: 'JIRA-119820',
      title: 'Approval workflow',
      historicalEffortHours: 40,
      relevance:
        'Similar approval routing and notification patterns for onboarding changes.',
    },
    {
      jiraId: 'JIRA-120415',
      title: 'Conditional routing',
      historicalEffortHours: 32,
      relevance:
        'Comparable conditional workflow rules and branching for customer criteria.',
    },
    {
      jiraId: 'JIRA-121090',
      title: 'Onboarding validation',
      historicalEffortHours: 48,
      relevance:
        'Related onboarding validation and activation-constraint testing effort.',
    },
  ],
  rationale:
    'Comparable Northstar onboarding work clustered between 32 and 48 hours of historical effort. The suggested 56-hour baseline adds analysis, approval workflow changes, regional approval API integration, validation of activation restrictions, and deployment preparation within a 48–64 hour planning range.',
  defaultApproach:
    'Implement configurable approval routing, enhance the regional approval integration, notify the onboarding team, and validate account activation restrictions.',
}

export const ESTIMATION_CONFIRMED_ATTENTION =
  'Technical estimate confirmed. Awaiting business approval.'

export const ESTIMATION_TIMELINE_EVENT_ID = 'tl-req1235-06'
export const ESTIMATION_ACTIVITY_ID = 'act-req1235-03'
