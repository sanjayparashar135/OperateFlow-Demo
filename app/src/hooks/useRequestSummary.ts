import { useCallback, useMemo, useState } from 'react'
import type { DeliveryRequest } from '../types/delivery'
import type { PersonaId } from '../types/persona'
import {
  getAttentionReasons,
  getRequestById,
  isRequestVisibleToPersona,
} from '../data/portfolioSelectors'
import { getSimulatedToday } from '../data/simDate'

export function useRequestSummary(
  personaId: PersonaId,
  referenceDate: string = getSimulatedToday(),
) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [boundPersonaId, setBoundPersonaId] = useState(personaId)

  if (boundPersonaId !== personaId) {
    setBoundPersonaId(personaId)
    setSelectedId(null)
  }

  const request = useMemo(() => {
    if (!selectedId) return null
    const found = getRequestById(selectedId) ?? null
    if (!found) return null
    if (!isRequestVisibleToPersona(found, personaId)) return null
    return found
  }, [selectedId, personaId])

  const reasons = useMemo(
    () => (request ? getAttentionReasons(request, referenceDate) : []),
    [request, referenceDate],
  )

  const openRequest = useCallback((next: DeliveryRequest | string) => {
    setSelectedId(typeof next === 'string' ? next : next.id)
  }, [])

  const closeRequest = useCallback(() => {
    setSelectedId(null)
  }, [])

  return {
    selectedId,
    request,
    reasons,
    open: request !== null,
    openRequest,
    closeRequest,
  }
}
