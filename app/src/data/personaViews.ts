import type { PersonaId } from '../types/persona'

export interface PersonaViewCopy {
  contextLabel: string
  /** Compact Requests page heading label (count appended separately). */
  requestsLabel: string
  overviewBlurb: string
}

export const PERSONA_VIEW_COPY: Record<PersonaId, PersonaViewCopy> = {
  'radhe-shyam': {
    contextLabel: 'Portfolio Overview',
    requestsLabel: 'Portfolio Requests',
    overviewBlurb:
      'Full Northstar delivery portfolio across intake through hypercare.',
  },
  'john-harrison': {
    contextLabel: 'My Requests',
    requestsLabel: 'My Requests',
    overviewBlurb: 'Delivery requests you submitted as business requester.',
  },
  'sanjay-parashar': {
    contextLabel: 'Technical Review',
    requestsLabel: 'Technical Review',
    overviewBlurb:
      'Requests where you are technical lead or primary technical owner.',
  },
  'ajay-raj': {
    contextLabel: 'My Assigned Work',
    requestsLabel: 'My Assigned Work',
    overviewBlurb: 'Requests assigned to you for development delivery.',
  },
  'sreekanth-mamdekar': {
    contextLabel: 'Integration Work',
    requestsLabel: 'Integration Work',
    overviewBlurb:
      'Requests involving you as integration lead across partner and platform work.',
  },
  'omer-ahmed': {
    contextLabel: 'Delivery Overview',
    requestsLabel: 'Delivery Overview',
    overviewBlurb:
      'Requests within your delivery-owner accountability and approvals.',
  },
}

export function getPersonaViewCopy(personaId: PersonaId): PersonaViewCopy {
  return PERSONA_VIEW_COPY[personaId]
}
