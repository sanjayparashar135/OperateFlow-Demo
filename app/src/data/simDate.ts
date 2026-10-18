/**
 * Central simulated calendar constants for scripted demo calculations.
 * The authoritative current date lives in SimulationProvider state and is
 * exposed as `simulatedToday` — do not mutate module state for UI reactivity.
 */
export const SIMULATED_TODAY = '2026-10-17'
export const SIMULATED_ADVANCE_DATE = '2026-10-21'

/** Baseline constant used by seed validation and Reset Demo. */
export function getSimulatedBaseline(): string {
  return SIMULATED_TODAY
}

/**
 * Default reference for scripts and factories when no provider date is
 * available. Prefer `useSimulation().simulatedToday` in React UI.
 */
export function getSimulatedToday(): string {
  return SIMULATED_TODAY
}

export function isSimulatedAdvanceDate(date: string): boolean {
  return date === SIMULATED_ADVANCE_DATE
}
