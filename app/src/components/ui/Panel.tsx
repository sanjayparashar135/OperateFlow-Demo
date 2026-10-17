import type { ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  className?: string
  padding?: 'md' | 'lg'
}

export function Panel({
  children,
  className = '',
  padding = 'md',
}: PanelProps) {
  const pad = padding === 'lg' ? 'p-6' : 'p-5'
  return (
    <section
      className={`rounded-xl border border-of-border bg-of-surface shadow-of-panel ${pad} ${className}`}
    >
      {children}
    </section>
  )
}

interface PanelHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PanelHeader({ title, description, action }: PanelHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="m-0 text-base font-semibold tracking-tight text-of-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-of-ink-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
