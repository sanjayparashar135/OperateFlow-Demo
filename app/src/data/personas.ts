import type { Persona, PersonaId } from '../types/persona'

export const PERSONAS: Persona[] = [
  {
    id: 'john-harrison',
    name: 'John Harrison',
    role: 'Business Requester',
    initials: 'JH',
  },
  {
    id: 'radhe-shyam',
    name: 'Radhe Shyam',
    role: 'Project Manager',
    initials: 'RS',
  },
  {
    id: 'sanjay-parashar',
    name: 'Sanjay Parashar',
    role: 'Technical Lead',
    initials: 'SP',
  },
  {
    id: 'ajay-raj',
    name: 'Ajay Raj',
    role: 'Developer',
    initials: 'AR',
  },
  {
    id: 'sreekanth-mamdekar',
    name: 'Sreekanth Mamdekar',
    role: 'Integration Lead',
    initials: 'SM',
  },
  {
    id: 'omer-ahmed',
    name: 'Omer Ahmed',
    role: 'Delivery Owner',
    initials: 'OA',
  },
]

export const DEFAULT_PERSONA_ID: PersonaId = 'radhe-shyam'

export function getPersonaById(id: PersonaId): Persona {
  const persona = PERSONAS.find((entry) => entry.id === id)
  if (!persona) {
    return PERSONAS.find((entry) => entry.id === DEFAULT_PERSONA_ID)!
  }
  return persona
}
