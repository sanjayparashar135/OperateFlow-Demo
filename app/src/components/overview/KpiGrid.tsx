import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Layers,
} from 'lucide-react'
import type { PortfolioKpis } from '../../data/portfolioSelectors'
import type { RequestsViewPreset } from '../../types/delivery'

interface KpiGridProps {
  kpis: PortfolioKpis
}

const CARDS: {
  key: keyof PortfolioKpis
  label: string
  hint: string
  view: RequestsViewPreset
  icon: typeof Activity
  accent: string
}[] = [
  {
    key: 'activeRequests',
    label: 'Active Requests',
    hint: 'Excludes closed work',
    view: 'active',
    icon: ClipboardList,
    accent: 'text-of-primary bg-of-primary-soft',
  },
  {
    key: 'needsAttention',
    label: 'Needs Attention',
    hint: 'Health, reviews, or deadlines',
    view: 'attention',
    icon: AlertTriangle,
    accent: 'text-amber-700 bg-amber-50',
  },
  {
    key: 'atRisk',
    label: 'At Risk',
    hint: 'Delivery health At Risk',
    view: 'at-risk',
    icon: Activity,
    accent: 'text-rose-700 bg-rose-50',
  },
  {
    key: 'inExecution',
    label: 'In Execution',
    hint: 'Lifecycle stage Execution',
    view: 'execution',
    icon: Layers,
    accent: 'text-of-ai bg-of-ai-soft',
  },
]

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon
        return (
          <Link
            key={card.key}
            to={`/requests?view=${card.view}`}
            className="rounded-xl border border-of-border bg-of-surface p-5 shadow-of-panel transition-shadow hover:border-of-primary-border hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
            aria-label={`View ${card.label} on Requests`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-sm font-medium text-of-ink-muted">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-of-ink">
                  {kpis[card.key]}
                </p>
                <p className="mt-1 text-xs text-of-ink-muted">{card.hint}</p>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.accent}`}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
