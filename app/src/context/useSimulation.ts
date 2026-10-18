import { useContext } from 'react'
import { SimulationContext, type SimulationContextValue } from './simulation-context'

export function useSimulation(): SimulationContextValue {
  const value = useContext(SimulationContext)
  if (!value) {
    throw new Error('useSimulation must be used within SimulationProvider')
  }
  return value
}
