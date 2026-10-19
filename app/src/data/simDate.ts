/**
 * Centralized session demo calendar.
 * Capture local calendar date once per presentation; derive the six-day
 * storyline with UTC day arithmetic. Do not call `new Date()` for business
 * dates outside this module (except optional inject for tests).
 */

export const DEMO_OFFSETS = {
  lastDeveloperUpdate: 2,
  advance: 4,
  target: 6,
} as const

export const DEMO_CALENDAR_STORAGE_KEY = 'operateflow.demoCalendar.v1'
export const DEMO_CALENDAR_STORAGE_VERSION = 1 as const

export interface DemoCalendar {
  /** Local calendar YYYY-MM-DD captured when the session started or reset. */
  demoAnchorDate: string
  /** D0 — baseline simulated today. */
  baselineDate: string
  /** D+2 — scripted last developer update / stale cutoff. */
  lastDeveloperUpdateDate: string
  /** D+4 — presenter advance / follow-up trigger day. */
  advanceDate: string
  /** D+6 — REQ1235 delivery target. */
  targetDate: string
}

export interface PersistedDemoCalendarV1 {
  version: typeof DEMO_CALENDAR_STORAGE_VERSION
  demoAnchorDate: string
  simulatedToday: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Add calendar days to YYYY-MM-DD using UTC arithmetic (no DST drift). */
export function addDaysIso(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Local machine calendar day as YYYY-MM-DD.
 * Uses getFullYear/getMonth/getDate — never toISOString().slice (timezone drift).
 */
export function getLocalCalendarIso(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isIsoDateString(value: string): boolean {
  return ISO_DATE.test(value)
}

export function createDemoCalendar(anchorDate: string): DemoCalendar {
  if (!isIsoDateString(anchorDate)) {
    throw new Error(`Invalid demo anchor date: ${anchorDate}`)
  }
  return {
    demoAnchorDate: anchorDate,
    baselineDate: anchorDate,
    lastDeveloperUpdateDate: addDaysIso(
      anchorDate,
      DEMO_OFFSETS.lastDeveloperUpdate,
    ),
    advanceDate: addDaysIso(anchorDate, DEMO_OFFSETS.advance),
    targetDate: addDaysIso(anchorDate, DEMO_OFFSETS.target),
  }
}

/** Module-level calendar for scripts and factory fallbacks. */
let activeCalendar: DemoCalendar | null = null

export function setActiveDemoCalendar(calendar: DemoCalendar): void {
  activeCalendar = calendar
}

export function getActiveDemoCalendar(): DemoCalendar {
  if (!activeCalendar) {
    activeCalendar = createDemoCalendar(getLocalCalendarIso())
  }
  return activeCalendar
}

/** Baseline (D0). Prefer `useSimulation().simulatedToday` in React UI. */
export function getSimulatedBaseline(): string {
  return getActiveDemoCalendar().baselineDate
}

/**
 * Default reference for scripts/factories when no provider date is available.
 * Equals the session baseline (D0), not the advanced date.
 */
export function getSimulatedToday(): string {
  return getActiveDemoCalendar().baselineDate
}

export function getSimulatedAdvanceDate(): string {
  return getActiveDemoCalendar().advanceDate
}

export function getDemoTargetDate(): string {
  return getActiveDemoCalendar().targetDate
}

export function getLastDeveloperUpdateDate(): string {
  return getActiveDemoCalendar().lastDeveloperUpdateDate
}

export function isSimulatedAdvanceDate(date: string): boolean {
  return date === getActiveDemoCalendar().advanceDate
}

export function isSimulatedBaselineDate(date: string): boolean {
  return date === getActiveDemoCalendar().baselineDate
}

export function readPersistedDemoCalendar(): PersistedDemoCalendarV1 | null {
  try {
    const raw = sessionStorage.getItem(DEMO_CALENDAR_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedDemoCalendarV1
    if (parsed.version !== DEMO_CALENDAR_STORAGE_VERSION) return null
    if (
      typeof parsed.demoAnchorDate !== 'string' ||
      !isIsoDateString(parsed.demoAnchorDate)
    ) {
      return null
    }
    if (
      typeof parsed.simulatedToday !== 'string' ||
      !isIsoDateString(parsed.simulatedToday)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writePersistedDemoCalendar(
  demoAnchorDate: string,
  simulatedToday: string,
): void {
  const payload: PersistedDemoCalendarV1 = {
    version: DEMO_CALENDAR_STORAGE_VERSION,
    demoAnchorDate,
    simulatedToday,
  }
  sessionStorage.setItem(DEMO_CALENDAR_STORAGE_KEY, JSON.stringify(payload))
}

export function clearPersistedDemoCalendar(): void {
  try {
    sessionStorage.removeItem(DEMO_CALENDAR_STORAGE_KEY)
  } catch {
    // Ignore unavailable sessionStorage.
  }
}

/**
 * Capture a fresh local-date anchor and activate it.
 * Used on first visit and Reset Demo.
 */
export function captureFreshDemoCalendar(
  now: Date = new Date(),
): { calendar: DemoCalendar; simulatedToday: string } {
  const calendar = createDemoCalendar(getLocalCalendarIso(now))
  setActiveDemoCalendar(calendar)
  return { calendar, simulatedToday: calendar.baselineDate }
}

/**
 * Restore a session calendar from persisted anchor.
 * `simulatedToday` must be baseline or advance for that anchor; otherwise baseline.
 */
export function restoreDemoCalendar(
  demoAnchorDate: string,
  simulatedToday: string,
): { calendar: DemoCalendar; simulatedToday: string } {
  const calendar = createDemoCalendar(demoAnchorDate)
  setActiveDemoCalendar(calendar)
  const nextToday =
    simulatedToday === calendar.baselineDate ||
    simulatedToday === calendar.advanceDate
      ? simulatedToday
      : calendar.baselineDate
  return { calendar, simulatedToday: nextToday }
}
