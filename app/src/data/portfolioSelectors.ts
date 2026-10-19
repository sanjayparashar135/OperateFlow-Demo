import type { PersonaId } from '../types/persona'
import type {
  ActivityEntry,
  DeliveryHealth,
  DeliveryInsight,
  DeliveryRequest,
  LifecycleStage,
  RequestsViewPreset,
  WorkflowStatus,
} from '../types/delivery'
import {
  DEADLINE_ATTENTION_DAYS,
  LIFECYCLE_STAGES,
  PENDING_REVIEW_STATUSES,
  REQUESTS_VIEW_PRESETS,
} from '../types/delivery'
import { PERSONAS } from './personas'
import {
  getDeliveryInsights as getSeedDeliveryInsights,
  getPortfolioRequests as getSeedPortfolioRequests,
  getRecentActivity as getSeedRecentActivity,
} from './portfolio'
import { getSimulatedToday } from './simDate'

export interface PortfolioKpis {
  activeRequests: number
  needsAttention: number
  atRisk: number
  inExecution: number
}

export interface LifecycleBucket {
  stage: LifecycleStage
  count: number
}

export interface AttentionItem extends DeliveryRequest {
  derivedReasons: string[]
}

export const EXPECTED_PERSONA_VISIBLE_COUNTS: Record<PersonaId, number> = {
  'radhe-shyam': 12,
  'john-harrison': 4,
  'sanjay-parashar': 3,
  'ajay-raj': 3,
  'sreekanth-mamdekar': 3,
  'omer-ahmed': 6,
}

const VALID_PERSONA_IDS = new Set<PersonaId>(PERSONAS.map((p) => p.id))

function parseIsoDate(value: string): number {
  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** Calendar-day difference: target − reference. Never uses wall-clock time. */
export function daysUntilTarget(
  targetDate: string,
  referenceDate: string,
): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round(
    (parseIsoDate(targetDate) - parseIsoDate(referenceDate)) / msPerDay,
  )
}

export function isClosed(request: DeliveryRequest): boolean {
  return request.workflowStatus === 'Closed'
}

export function isPendingReviewStatus(status: WorkflowStatus): boolean {
  return PENDING_REVIEW_STATUSES.includes(status)
}

export function isDeadlineApproaching(
  request: DeliveryRequest,
  referenceDate: string,
  windowDays: number = DEADLINE_ATTENTION_DAYS,
): boolean {
  if (isClosed(request)) return false
  const days = daysUntilTarget(request.targetDate, referenceDate)
  return days >= 0 && days <= windowDays
}

export function getAttentionReasons(
  request: DeliveryRequest,
  referenceDate: string,
): string[] {
  if (isClosed(request)) return []

  const reasons: string[] = []

  if (
    request.deliveryHealth === 'At Risk' ||
    request.deliveryHealth === 'Delayed'
  ) {
    reasons.push(`Delivery health is ${request.deliveryHealth}`)
  }

  if (isPendingReviewStatus(request.workflowStatus)) {
    reasons.push(`Workflow status: ${request.workflowStatus}`)
  }

  if (isDeadlineApproaching(request, referenceDate)) {
    reasons.push(
      `Target date ${request.targetDate} is within ${DEADLINE_ATTENTION_DAYS} days of ${referenceDate}`,
    )
  }

  if (request.attentionReasons?.length) {
    for (const reason of request.attentionReasons) {
      if (!reasons.includes(reason)) {
        reasons.push(reason)
      }
    }
  }

  return reasons
}

export function needsAttention(
  request: DeliveryRequest,
  referenceDate: string,
): boolean {
  return getAttentionReasons(request, referenceDate).length > 0
}

function healthSortRank(health: DeliveryHealth): number {
  switch (health) {
    case 'Delayed':
      return 0
    case 'At Risk':
      return 1
    default:
      return 2
  }
}

export function isRequestVisibleToPersona(
  request: DeliveryRequest,
  personaId: PersonaId,
): boolean {
  if (personaId === 'radhe-shyam') return true

  if (request.primaryOwnerId === personaId) return true

  const { parties } = request
  return (
    parties.requesterId === personaId ||
    parties.technicalLeadId === personaId ||
    parties.developerId === personaId ||
    parties.integrationLeadId === personaId ||
    parties.deliveryOwnerId === personaId
  )
}

/** True when the persona is primary owner or named in parties. */
export function personaRelatesToRequest(
  request: DeliveryRequest,
  personaId: PersonaId,
): boolean {
  if (request.primaryOwnerId === personaId) return true
  const { parties } = request
  return (
    parties.requesterId === personaId ||
    parties.technicalLeadId === personaId ||
    parties.developerId === personaId ||
    parties.integrationLeadId === personaId ||
    parties.deliveryOwnerId === personaId
  )
}

export function getVisibleRequests(
  personaId: PersonaId,
  requests: DeliveryRequest[] = getSeedPortfolioRequests(),
): DeliveryRequest[] {
  return requests.filter((request) =>
    isRequestVisibleToPersona(request, personaId),
  )
}

export function getPortfolioRequests(
  requests: DeliveryRequest[] = getSeedPortfolioRequests(),
): DeliveryRequest[] {
  return requests
}

export function getRequestById(
  id: string,
  requests: DeliveryRequest[] = getSeedPortfolioRequests(),
): DeliveryRequest | undefined {
  return requests.find((request) => request.id === id)
}

export function getAttentionItems(
  requests: DeliveryRequest[] = getSeedPortfolioRequests(),
  referenceDate: string = getSimulatedToday(),
): AttentionItem[] {
  return requests
    .filter((request) => needsAttention(request, referenceDate))
    .map((request) => ({
      ...request,
      derivedReasons: getAttentionReasons(request, referenceDate),
    }))
    .sort((a, b) => {
      const healthDiff =
        healthSortRank(a.deliveryHealth) - healthSortRank(b.deliveryHealth)
      if (healthDiff !== 0) return healthDiff
      return a.targetDate.localeCompare(b.targetDate)
    })
}

export function getPortfolioKpis(
  requests: DeliveryRequest[] = getSeedPortfolioRequests(),
  referenceDate: string = getSimulatedToday(),
): PortfolioKpis {
  const activeRequests = requests.filter((request) => !isClosed(request)).length
  const needsAttentionCount = getAttentionItems(requests, referenceDate).length
  const atRisk = requests.filter(
    (request) => request.deliveryHealth === 'At Risk',
  ).length
  const inExecution = requests.filter(
    (request) => request.lifecycleStage === 'Execution',
  ).length

  return {
    activeRequests,
    needsAttention: needsAttentionCount,
    atRisk,
    inExecution,
  }
}

export function getLifecycleDistribution(
  requests: DeliveryRequest[] = getSeedPortfolioRequests(),
): LifecycleBucket[] {
  const counts = new Map<LifecycleStage, number>(
    LIFECYCLE_STAGES.map((stage) => [stage, 0]),
  )

  for (const request of requests) {
    counts.set(
      request.lifecycleStage,
      (counts.get(request.lifecycleStage) ?? 0) + 1,
    )
  }

  return LIFECYCLE_STAGES.map((stage) => ({
    stage,
    count: counts.get(stage) ?? 0,
  }))
}

function formatEvidenceList(ids: string[]): string {
  if (ids.length === 1) return ids[0]
  if (ids.length === 2) return `${ids[0]} and ${ids[1]}`
  return `${ids.slice(0, -1).join(', ')}, and ${ids[ids.length - 1]}`
}

function scopeInsightTitle(kind: DeliveryInsight['kind'], count: number): string {
  switch (kind) {
    case 'deadline':
      return count === 1
        ? 'One delivery approaches its target date'
        : `${count} deliveries approach their target dates`
    case 'approval':
      return count === 1
        ? 'One approval or review item is waiting'
        : `${count} approval and review items are waiting`
    case 'risk':
      return count === 1
        ? 'One delivery risk needs prompt attention'
        : `${count} delivery risks need prompt attention`
  }
}

function deadlineInsightDetail(count: number): string {
  return count === 1
    ? 'This request has a target date within the next three days. Confirm the owner and delivery readiness before the deadline.'
    : 'These requests have target dates within the next three days. Confirm owners and delivery readiness before their deadlines.'
}

function scopeInsightDetail(
  insight: DeliveryInsight,
  scopedIds: string[],
  visibleById: Map<string, DeliveryRequest>,
): string {
  const evidence = formatEvidenceList(scopedIds)
  const snippets = scopedIds.map((id) => {
    const request = visibleById.get(id)
    if (!request) return id
    return `${id} (${request.workflowStatus}, ${request.deliveryHealth})`
  })
  const evidenceDetail = snippets.join('; ')

  switch (insight.kind) {
    case 'deadline':
      return `${deadlineInsightDetail(scopedIds.length)} Evidence: ${evidenceDetail}.`
    case 'approval':
      return `${insight.detail} In your view: ${evidenceDetail}.`
    case 'risk':
      return `${insight.detail} In your view: ${evidenceDetail}.`
    default:
      return `${insight.detail} Evidence: ${evidence}.`
  }
}

/**
 * Scope scripted insights to visible requests. Rebuilds title/detail counts
 * and evidence IDs so hidden requests never appear. Omits empty insights.
 */
export function getScopedInsights(
  visibleRequests: DeliveryRequest[],
  insights: DeliveryInsight[] = getSeedDeliveryInsights(),
  limit = 2,
): DeliveryInsight[] {
  const visibleById = new Map(
    visibleRequests.map((request) => [request.id, request]),
  )
  const scoped: DeliveryInsight[] = []

  for (const insight of insights) {
    const scopedIds = insight.requestIds.filter((id) => visibleById.has(id))
    if (scopedIds.length === 0) continue

    scoped.push({
      id: insight.id,
      kind: insight.kind,
      title: scopeInsightTitle(insight.kind, scopedIds.length),
      detail: scopeInsightDetail(insight, scopedIds, visibleById),
      requestIds: scopedIds,
    })

    if (scoped.length >= limit) break
  }

  return scoped
}

export function getScopedActivity(
  visibleRequests: DeliveryRequest[],
  activity: ActivityEntry[] = getSeedRecentActivity(),
): ActivityEntry[] {
  const visibleIds = new Set(visibleRequests.map((request) => request.id))
  return activity
    .filter((entry) => visibleIds.has(entry.requestId))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function parseRequestsViewPreset(
  value: string | null,
): RequestsViewPreset {
  if (value && REQUESTS_VIEW_PRESETS.includes(value as RequestsViewPreset)) {
    return value as RequestsViewPreset
  }
  return 'all'
}

export function applyRequestsViewPreset(
  requests: DeliveryRequest[],
  view: RequestsViewPreset,
  referenceDate: string = getSimulatedToday(),
): DeliveryRequest[] {
  switch (view) {
    case 'active':
      return requests.filter((request) => !isClosed(request))
    case 'attention':
      return requests.filter((request) => needsAttention(request, referenceDate))
    case 'at-risk':
      return requests.filter(
        (request) => request.deliveryHealth === 'At Risk',
      )
    case 'execution':
      return requests.filter(
        (request) => request.lifecycleStage === 'Execution',
      )
    default:
      return requests
  }
}

export function requestsViewLabel(view: RequestsViewPreset): string {
  switch (view) {
    case 'active':
      return 'Active requests'
    case 'attention':
      return 'Needs attention'
    case 'at-risk':
      return 'At Risk'
    case 'execution':
      return 'In Execution'
    default:
      return 'All visible requests'
  }
}

export function getDeliveryInsights(
  insights: DeliveryInsight[] = getSeedDeliveryInsights(),
): DeliveryInsight[] {
  return insights
}

export function getRecentActivity(
  activity: ActivityEntry[] = getSeedRecentActivity(),
): ActivityEntry[] {
  return [...activity].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function validatePortfolioConsistency(
  requests: DeliveryRequest[] = getSeedPortfolioRequests(),
  activity: ActivityEntry[] = getSeedRecentActivity(),
  insights: DeliveryInsight[] = getSeedDeliveryInsights(),
  referenceDate: string = getSimulatedToday(),
): string[] {
  const ids = new Set(requests.map((request) => request.id))
  const issues: string[] = []

  for (const forbidden of ['REQ1235', 'JIRA-122345']) {
    if (ids.has(forbidden)) {
      issues.push(`Forbidden demo record present: ${forbidden}`)
    }
  }

  if (requests.length !== 12) {
    issues.push(`Expected 12 portfolio records, found ${requests.length}`)
  }

  for (const request of requests) {
    if (!VALID_PERSONA_IDS.has(request.primaryOwnerId)) {
      issues.push(`${request.id} has invalid primaryOwnerId`)
    }
    for (const [key, value] of Object.entries(request.parties)) {
      if (value && !VALID_PERSONA_IDS.has(value as PersonaId)) {
        issues.push(`${request.id} parties.${key} is invalid`)
      }
    }
  }

  for (const entry of activity) {
    if (!ids.has(entry.requestId)) {
      issues.push(`Activity ${entry.id} references missing ${entry.requestId}`)
    }
  }

  for (const insight of insights) {
    for (const requestId of insight.requestIds) {
      if (!ids.has(requestId)) {
        issues.push(`Insight ${insight.id} references missing ${requestId}`)
      }
    }
  }

  const lifecycle = getLifecycleDistribution(requests)
  const lifecycleTotal = lifecycle.reduce((sum, bucket) => sum + bucket.count, 0)
  if (lifecycleTotal !== requests.length) {
    issues.push(
      `Lifecycle total ${lifecycleTotal} does not match portfolio size ${requests.length}`,
    )
  }

  const expectedLifecycle = [2, 3, 3, 2, 2]
  lifecycle.forEach((bucket, index) => {
    if (bucket.count !== expectedLifecycle[index]) {
      issues.push(
        `Lifecycle ${bucket.stage} expected ${expectedLifecycle[index]}, got ${bucket.count}`,
      )
    }
  })

  const radheVisible = getVisibleRequests('radhe-shyam', requests)
  const radheKpis = getPortfolioKpis(radheVisible, referenceDate)
  if (radheVisible.length !== 12) {
    issues.push(`Radhe visible expected 12, got ${radheVisible.length}`)
  }
  if (radheKpis.activeRequests !== 10) {
    issues.push(`Radhe active expected 10, got ${radheKpis.activeRequests}`)
  }
  if (radheKpis.needsAttention !== 7) {
    issues.push(
      `Radhe needsAttention expected 7, got ${radheKpis.needsAttention}`,
    )
  }
  if (radheKpis.atRisk !== 2) {
    issues.push(`Radhe atRisk expected 2, got ${radheKpis.atRisk}`)
  }
  if (radheKpis.inExecution !== 3) {
    issues.push(`Radhe inExecution expected 3, got ${radheKpis.inExecution}`)
  }

  for (const persona of PERSONAS) {
    const visible = getVisibleRequests(persona.id, requests)
    const expected = EXPECTED_PERSONA_VISIBLE_COUNTS[persona.id]
    if (visible.length !== expected) {
      issues.push(
        `${persona.id} visible expected ${expected}, got ${visible.length}`,
      )
    }

    const kpis = getPortfolioKpis(visible, referenceDate)
    const activeView = applyRequestsViewPreset(visible, 'active', referenceDate)
    const attentionView = applyRequestsViewPreset(
      visible,
      'attention',
      referenceDate,
    )
    const atRiskView = applyRequestsViewPreset(visible, 'at-risk', referenceDate)
    const executionView = applyRequestsViewPreset(
      visible,
      'execution',
      referenceDate,
    )

    if (activeView.length !== kpis.activeRequests) {
      issues.push(
        `${persona.id} active view ${activeView.length} != KPI ${kpis.activeRequests}`,
      )
    }
    if (attentionView.length !== kpis.needsAttention) {
      issues.push(
        `${persona.id} attention view ${attentionView.length} != KPI ${kpis.needsAttention}`,
      )
    }
    if (atRiskView.length !== kpis.atRisk) {
      issues.push(
        `${persona.id} at-risk view ${atRiskView.length} != KPI ${kpis.atRisk}`,
      )
    }
    if (executionView.length !== kpis.inExecution) {
      issues.push(
        `${persona.id} execution view ${executionView.length} != KPI ${kpis.inExecution}`,
      )
    }

    for (const scoped of getScopedInsights(visible, insights, 10)) {
      for (const requestId of scoped.requestIds) {
        if (!visible.some((request) => request.id === requestId)) {
          issues.push(
            `${persona.id} insight ${scoped.id} cites hidden ${requestId}`,
          )
        }
        if (
          !scoped.detail.includes(requestId) &&
          !scoped.title.includes(String(scoped.requestIds.length))
        ) {
          // detail must mention each evidence id
        }
        if (!scoped.detail.includes(requestId)) {
          issues.push(
            `${persona.id} insight ${scoped.id} detail missing evidence ${requestId}`,
          )
        }
      }
    }

    for (const entry of getScopedActivity(visible, activity)) {
      if (!visible.some((request) => request.id === entry.requestId)) {
        issues.push(
          `${persona.id} activity ${entry.id} cites hidden ${entry.requestId}`,
        )
      }
    }
  }

  return issues
}
