import { getPersonaById } from '../data/personas'
import type { DeliveryRequest } from '../types/delivery'
import type { PersonaId } from '../types/persona'

export function personaDisplayName(id: PersonaId): string {
  return getPersonaById(id).name
}

export function primaryOwnerName(request: DeliveryRequest): string {
  return personaDisplayName(request.primaryOwnerId)
}

export interface PartyDisplayRow {
  label: string
  name: string
}

export function getPartyDisplayRows(request: DeliveryRequest): PartyDisplayRow[] {
  const rows: PartyDisplayRow[] = [
    { label: 'Primary owner', name: primaryOwnerName(request) },
  ]
  const { parties } = request
  if (parties.requesterId) {
    rows.push({
      label: 'Requester',
      name: personaDisplayName(parties.requesterId),
    })
  }
  if (parties.technicalLeadId) {
    rows.push({
      label: 'Solution architect',
      name: personaDisplayName(parties.technicalLeadId),
    })
  }
  if (parties.developerId) {
    rows.push({
      label: 'Developer',
      name: personaDisplayName(parties.developerId),
    })
  }
  if (parties.integrationLeadId) {
    rows.push({
      label: 'Integration lead',
      name: personaDisplayName(parties.integrationLeadId),
    })
  }
  if (parties.deliveryOwnerId) {
    rows.push({
      label: 'Delivery owner',
      name: personaDisplayName(parties.deliveryOwnerId),
    })
  }
  return rows
}
