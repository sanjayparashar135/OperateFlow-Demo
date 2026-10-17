import { useRole } from '../../context/useRole'

interface PagePlaceholderProps {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  const { currentPersona } = useRole()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-of-border bg-of-surface px-8 py-10 shadow-of-panel">
        <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-of-primary uppercase">
          OperateFlow
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-of-ink">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-of-ink-secondary">
          {description}
        </p>
        <p className="mt-6 border-t border-of-border pt-4 text-sm text-of-ink-muted">
          Viewing as {currentPersona.name} · {currentPersona.role}
        </p>
        <p className="mt-2 text-sm text-of-ink-muted">
          Feature content for this area will be added in a later milestone.
        </p>
      </div>
    </div>
  )
}
