import type { PersonaId } from '../types/persona'

/**
 * Demo persona capability: only John Harrison (Business Requester) may
 * initiate Intelligent Intake. Not production RBAC.
 */
export function canCreateRequest(personaId: PersonaId): boolean {
  return personaId === 'john-harrison'
}
