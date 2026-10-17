import { PERSONAS } from '../src/data/personas.ts'
import {
  DELIVERY_INSIGHTS,
  PORTFOLIO_REQUESTS,
  RECENT_ACTIVITY,
} from '../src/data/portfolio.ts'
import {
  EXPECTED_PERSONA_VISIBLE_COUNTS,
  applyRequestsViewPreset,
  getPortfolioKpis,
  getScopedActivity,
  getScopedInsights,
  getVisibleRequests,
  validatePortfolioConsistency,
} from '../src/data/portfolioSelectors.ts'
import { SIMULATED_TODAY } from '../src/data/simDate.ts'

const issues = validatePortfolioConsistency()
const blob = JSON.stringify({
  PORTFOLIO_REQUESTS,
  RECENT_ACTIVITY,
  DELIVERY_INSIGHTS,
})

const personaReports = PERSONAS.map((persona) => {
  const visible = getVisibleRequests(persona.id)
  const kpis = getPortfolioKpis(visible, SIMULATED_TODAY)
  const insights = getScopedInsights(visible, DELIVERY_INSIGHTS, 10)
  const activity = getScopedActivity(visible)
  const insightLeak = insights.some((insight) =>
    insight.requestIds.some(
      (id) => !visible.some((request) => request.id === id),
    ),
  )
  const activityLeak = activity.some(
    (entry) => !visible.some((request) => request.id === entry.requestId),
  )

  return {
    personaId: persona.id,
    visibleCount: visible.length,
    expectedCount: EXPECTED_PERSONA_VISIBLE_COUNTS[persona.id],
    visibleIds: visible.map((request) => request.id),
    kpis,
    kpiMatchesViews: {
      active:
        applyRequestsViewPreset(visible, 'active', SIMULATED_TODAY).length ===
        kpis.activeRequests,
      attention:
        applyRequestsViewPreset(visible, 'attention', SIMULATED_TODAY)
          .length === kpis.needsAttention,
      atRisk:
        applyRequestsViewPreset(visible, 'at-risk', SIMULATED_TODAY).length ===
        kpis.atRisk,
      execution:
        applyRequestsViewPreset(visible, 'execution', SIMULATED_TODAY)
          .length === kpis.inExecution,
    },
    insightIds: insights.map((insight) => ({
      id: insight.id,
      requestIds: insight.requestIds,
    })),
    insightLeak,
    activityLeak,
  }
})

const report = {
  simulatedToday: SIMULATED_TODAY,
  portfolioSize: PORTFOLIO_REQUESTS.length,
  consistencyIssues: issues,
  forbiddenInData: blob.includes('REQ1235') || blob.includes('JIRA-122345'),
  personaReports,
}

console.log(JSON.stringify(report, null, 2))

if (
  issues.length > 0 ||
  report.forbiddenInData ||
  personaReports.some((row) => row.insightLeak || row.activityLeak)
) {
  process.exitCode = 1
}
