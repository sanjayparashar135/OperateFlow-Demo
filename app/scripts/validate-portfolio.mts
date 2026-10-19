import { PERSONAS } from '../src/data/personas.ts'
import {
  getDeliveryInsights,
  getPortfolioRequests,
  getRecentActivity,
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
import {
  createDemoCalendar,
  setActiveDemoCalendar,
} from '../src/data/simDate.ts'

const MATRIX_ANCHORS = ['2026-11-15', '2026-12-28', '2027-01-05'] as const

function validateForAnchor(anchor: string) {
  const calendar = createDemoCalendar(anchor)
  setActiveDemoCalendar(calendar)
  const baseline = calendar.baselineDate
  const portfolio = getPortfolioRequests(baseline)
  const activity = getRecentActivity(baseline)
  const insights = getDeliveryInsights(baseline)

  const issues = validatePortfolioConsistency(
    portfolio,
    activity,
    insights,
    baseline,
  )
  const blob = JSON.stringify({ portfolio, activity, insights })

  const personaReports = PERSONAS.map((persona) => {
    const visible = getVisibleRequests(persona.id, portfolio)
    const kpis = getPortfolioKpis(visible, baseline)
    const scopedInsights = getScopedInsights(visible, insights, 10)
    const scopedActivity = getScopedActivity(visible, activity)
    const insightLeak = scopedInsights.some((insight) =>
      insight.requestIds.some(
        (id) => !visible.some((request) => request.id === id),
      ),
    )
    const activityLeak = scopedActivity.some(
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
          applyRequestsViewPreset(visible, 'active', baseline).length ===
          kpis.activeRequests,
        attention:
          applyRequestsViewPreset(visible, 'attention', baseline).length ===
          kpis.needsAttention,
        atRisk:
          applyRequestsViewPreset(visible, 'at-risk', baseline).length ===
          kpis.atRisk,
        execution:
          applyRequestsViewPreset(visible, 'execution', baseline).length ===
          kpis.inExecution,
      },
      insightIds: scopedInsights.map((insight) => ({
        id: insight.id,
        requestIds: insight.requestIds,
      })),
      insightLeak,
      activityLeak,
    }
  })

  const relativeDatesOk = portfolio.every((request) => {
    // Closed historical requests must stay before baseline.
    if (request.id === 'REQ1211' || request.id === 'REQ1212') {
      return request.targetDate < baseline && request.lastUpdated < baseline
    }
    return true
  })

  return {
    anchor,
    baseline,
    portfolioSize: portfolio.length,
    consistencyIssues: issues,
    forbiddenInData: blob.includes('REQ1235') || blob.includes('JIRA-122345'),
    relativeDatesOk,
    personaReports,
    failed:
      issues.length > 0 ||
      blob.includes('REQ1235') ||
      blob.includes('JIRA-122345') ||
      !relativeDatesOk ||
      personaReports.some(
        (row) =>
          row.insightLeak ||
          row.activityLeak ||
          row.visibleCount !== row.expectedCount ||
          !row.kpiMatchesViews.active ||
          !row.kpiMatchesViews.attention ||
          !row.kpiMatchesViews.atRisk ||
          !row.kpiMatchesViews.execution,
      ),
  }
}

const matrix = MATRIX_ANCHORS.map((anchor) => validateForAnchor(anchor))
const report = {
  ok: matrix.every((row) => !row.failed),
  matrix,
}

console.log(JSON.stringify(report, null, 2))

if (!report.ok) {
  process.exitCode = 1
}
