import { useMemo } from 'react'
import { DeliveryIntelligence } from '../components/overview/DeliveryIntelligence'
import { KpiGrid } from '../components/overview/KpiGrid'
import { LifecycleDistribution } from '../components/overview/LifecycleDistribution'
import { NeedsAttentionPanel } from '../components/overview/NeedsAttentionPanel'
import { OverviewHeader } from '../components/overview/OverviewHeader'
import { RecentActivity } from '../components/overview/RecentActivity'
import { RequestSummaryModal } from '../components/requests/RequestSummaryModal'
import { useRole } from '../context/useRole'
import { useSimulation } from '../context/useSimulation'
import {
  getAttentionItems,
  getLifecycleDistribution,
  getPortfolioKpis,
  getScopedActivity,
  getScopedInsights,
  getVisibleRequests,
} from '../data/portfolioSelectors'
import { useRequestSummary } from '../hooks/useRequestSummary'

export function OverviewPage() {
  const { currentPersona } = useRole()
  const {
    requests,
    activity: portfolioActivity,
    simulatedToday,
  } = useSimulation()
  const referenceDate = simulatedToday

  const visible = useMemo(
    () => getVisibleRequests(currentPersona.id, requests),
    [currentPersona.id, requests],
  )
  const kpis = useMemo(
    () => getPortfolioKpis(visible, referenceDate),
    [visible, referenceDate],
  )
  const attentionItems = useMemo(
    () => getAttentionItems(visible, referenceDate),
    [visible, referenceDate],
  )
  const lifecycle = useMemo(
    () => getLifecycleDistribution(visible),
    [visible],
  )
  const insights = useMemo(
    () => getScopedInsights(visible, undefined, 2),
    [visible],
  )
  const activity = useMemo(
    () => getScopedActivity(visible, portfolioActivity),
    [visible, portfolioActivity],
  )
  const summary = useRequestSummary(
    currentPersona.id,
    requests,
    referenceDate,
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <OverviewHeader
        kpis={kpis}
        visibleCount={visible.length}
        simulatedToday={simulatedToday}
      />
      <KpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <DeliveryIntelligence
            insights={insights}
            onSelectRequest={summary.openRequest}
          />
        </div>
        <div className="xl:col-span-2">
          <NeedsAttentionPanel
            items={attentionItems}
            onSelectRequest={summary.openRequest}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <LifecycleDistribution buckets={lifecycle} />
        <RecentActivity
          entries={activity}
          onSelectRequest={summary.openRequest}
        />
      </div>

      <RequestSummaryModal
        request={summary.request}
        reasons={summary.reasons}
        open={summary.open}
        onClose={summary.closeRequest}
      />
    </div>
  )
}
