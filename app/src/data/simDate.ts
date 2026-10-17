/**
 * Central simulated calendar for scripted demo calculations.
 * Later presenter controls can advance this value without changing selectors.
 */
export const SIMULATED_TODAY = '2026-10-17'

export function getSimulatedToday(): string {
  return SIMULATED_TODAY
}
