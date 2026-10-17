import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({
  label,
  children,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-of-ink-secondary transition-colors hover:border-of-border hover:bg-of-surface hover:text-of-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-of-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
