interface OperateFlowMarkProps {
  className?: string
  title?: string
}

/** Connected Flow mark — three nodes on a primary blue field with teal accent. */
export function OperateFlowMark({
  className = 'h-9 w-9',
  title = 'OperateFlow',
}: OperateFlowMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="32" height="32" rx="8" fill="#1d4ed8" />
      <path
        d="M7 16H25"
        stroke="#bfdbfe"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="8" cy="16" r="3" fill="#eff6ff" />
      <circle cx="16" cy="16" r="3.25" fill="#99f6e4" />
      <circle cx="24" cy="16" r="3" fill="#eff6ff" />
    </svg>
  )
}
