import { RotateCcw } from 'lucide-react'
import { useSimulation } from '../../context/useSimulation'
import { formatDisplayDate } from '../../lib/format'

export function ResetDemoButton() {
  const { hasMainRequest, resetDemo, demoCalendar } = useSimulation()

  if (!hasMainRequest) return null

  return (
    <button
      type="button"
      onClick={() => {
        const confirmed = window.confirm(
          `Reset Demo will clear REQ1235, restore the initial portfolio, and start a fresh simulated calendar from today's local date (currently anchored at ${formatDisplayDate(demoCalendar.baselineDate)}). Your selected persona will be kept. Continue?`,
        )
        if (confirmed) {
          resetDemo()
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-of-border bg-of-surface px-2.5 py-2 text-xs font-semibold text-of-ink-secondary transition-colors hover:border-of-border-strong hover:bg-of-canvas hover:text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary"
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Reset Demo</span>
      <span className="sm:hidden">Reset</span>
    </button>
  )
}
