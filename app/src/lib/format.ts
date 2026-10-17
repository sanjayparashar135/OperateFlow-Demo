const DISPLAY_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const DISPLAY_DATETIME = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
})

/** Format an ISO date (YYYY-MM-DD) for display without using local wall clock. */
export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return DISPLAY_DATE.format(new Date(Date.UTC(year, month - 1, day)))
}

/** Format an ISO datetime for activity timestamps. */
export function formatDisplayDateTime(isoDateTime: string): string {
  return DISPLAY_DATETIME.format(new Date(isoDateTime + 'Z'))
}

export function greetingForPersona(name: string): string {
  return `Hello, ${name}`
}
