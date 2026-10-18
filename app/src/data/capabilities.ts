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

/**
 * Demo persona capability: only John Harrison may approve the business
 * estimate after technical confirmation. Not production RBAC.
 */
export function canApproveBusinessEstimate(personaId: PersonaId): boolean {
  return personaId === 'john-harrison'
}

/**
 * Demo persona capability: only Radhe Shyam (Project Manager) may assign
 * delivery resources after business approval. Not production RBAC.
 */
export function canAssignResources(personaId: PersonaId): boolean {
  return personaId === 'radhe-shyam'
}

/**
 * Demo persona capability: only Ajay Raj (Developer) may respond to the
 * proactive collaboration follow-up. Not production RBAC.
 */
export function canRespondToFollowUp(personaId: PersonaId): boolean {
  return personaId === 'ajay-raj'
}
