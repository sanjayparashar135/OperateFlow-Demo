import { useEffect, useState, type ReactNode } from 'react'
import {
  DEFAULT_PERSONA_ID,
  getPersonaById,
  PERSONAS,
} from '../data/personas'
import type { PersonaId } from '../types/persona'
import { RoleContext } from './role-context'

const STORAGE_KEY = 'operateflow.activePersonaId'

function readStoredPersonaId(): PersonaId {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored && PERSONAS.some((persona) => persona.id === stored)) {
      return stored as PersonaId
    }
  } catch {
    // Ignore unavailable sessionStorage in constrained environments.
  }
  return DEFAULT_PERSONA_ID
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<PersonaId>(readStoredPersonaId)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, personaId)
    } catch {
      // Ignore unavailable sessionStorage in constrained environments.
    }
  }, [personaId])

  return (
    <RoleContext.Provider
      value={{
        personas: PERSONAS,
        currentPersona: getPersonaById(personaId),
        setPersonaId: setPersonaIdState,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}
