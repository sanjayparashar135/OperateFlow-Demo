interface AvatarProps {
  initials: string
  size?: 'sm' | 'md'
}

export function Avatar({ initials, size = 'md' }: AvatarProps) {
  const sizeClass =
    size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-of-primary-soft font-semibold text-of-primary ring-1 ring-of-primary-border ${sizeClass}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
