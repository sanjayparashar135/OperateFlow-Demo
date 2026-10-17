export type PersonaId =
  | 'john-harrison'
  | 'radhe-shyam'
  | 'sanjay-parashar'
  | 'ajay-raj'
  | 'sreekanth-mamdekar'
  | 'omer-ahmed'

export interface Persona {
  id: PersonaId
  name: string
  role: string
  initials: string
}
