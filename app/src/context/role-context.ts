import { createContext } from 'react'
import type { Persona, PersonaId } from '../types/persona'

export interface RoleContextValue {
  personas: Persona[]
  currentPersona: Persona
  setPersonaId: (id: PersonaId) => void
}

export const RoleContext = createContext<RoleContextValue | null>(null)
