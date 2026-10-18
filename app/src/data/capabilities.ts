import type { PersonaId } from '../types/persona'

/**
 * Demo persona capability: only John Harrison (Business Requester) may
 * initiate Intelligent Intake. Not production RBAC.
 */
export function canCreateRequest(personaId: PersonaId): boolean {
  return personaId === 'john-harrison'
}

/**
 * Demo persona capability: only Sanjay Parashar (Solution Architect) may
 * confirm or override the technical estimate. Not production RBAC.
 */
export function canConfirmEstimation(personaId: PersonaId): boolean {
  return personaId === 'sanjay-parashar'
}
