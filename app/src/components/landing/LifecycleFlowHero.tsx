import { LIFECYCLE_STAGES } from '../../types/delivery'

/** Horizontal positions for the five lifecycle nodes in the SVG viewBox. */
const NODE_X = [80, 260, 440, 620, 800] as const
const NODE_Y = 100
const VIEW_W = 880
const VIEW_H = 160

/**
 * Premium animated lifecycle pipeline — centerpiece visual for the welcome page.
 * Pure CSS/SVG motion; respects prefers-reduced-motion via stylesheet.
 */
export function LifecycleFlowHero() {
  const pathD = `M ${NODE_X[0]} ${NODE_Y} C 160 ${NODE_Y - 36}, 180 ${NODE_Y + 36}, ${NODE_X[1]} ${NODE_Y} S 340 ${NODE_Y - 36}, ${NODE_X[2]} ${NODE_Y} S 520 ${NODE_Y + 36}, ${NODE_X[3]} ${NODE_Y} S 720 ${NODE_Y - 28}, ${NODE_X[4]} ${NODE_Y}`

  return (
    <div
      className="of-lifecycle-hero relative mx-auto w-full max-w-5xl"
      role="img"
      aria-label={`Delivery lifecycle: ${LIFECYCLE_STAGES.join(', ')}`}
    >
      <div className="of-lifecycle-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      <svg
        className="of-lifecycle-svg relative z-10 h-auto w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="of-flow-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="45%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="of-flow-soft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#99f6e4" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="of-node-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </radialGradient>
          <radialGradient id="of-node-active" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ccfbf1" />
            <stop offset="60%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>
          <filter id="of-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="of-particle-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient underlay path */}
        <path
          d={pathD}
          stroke="url(#of-flow-soft)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Base connector */}
        <path
          className="of-flow-base"
          d={pathD}
          stroke="url(#of-flow-stroke)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Animated dash flow */}
        <path
          className="of-flow-dash"
          d={pathD}
          stroke="url(#of-flow-stroke)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="10 18"
        />

        {/* Traveling information particles */}
        {[0, 1, 2].map((index) => (
          <g key={index} className={`of-flow-particle of-flow-particle-${index}`} filter="url(#of-particle-glow)">
            <circle r="5" fill="#0f766e">
              <animateMotion
                dur={`${5.5 + index * 0.7}s`}
                begin={`${index * 1.4}s`}
                repeatCount="indefinite"
                path={pathD}
              />
            </circle>
            <circle r="2.25" fill="#ffffff">
              <animateMotion
                dur={`${5.5 + index * 0.7}s`}
                begin={`${index * 1.4}s`}
                repeatCount="indefinite"
                path={pathD}
              />
            </circle>
          </g>
        ))}

        {/* Stage nodes */}
        {NODE_X.map((x, index) => (
          <g
            key={LIFECYCLE_STAGES[index]}
            className={`of-flow-node of-flow-node-${index}`}
            style={{ ['--node-delay' as string]: `${0.35 + index * 0.12}s` }}
          >
            <circle
              className="of-flow-node-halo"
              cx={x}
              cy={NODE_Y}
              r="28"
              fill="#1d4ed8"
              opacity="0.12"
              filter="url(#of-soft-glow)"
            />
            <circle
              cx={x}
              cy={NODE_Y}
              r="16"
              fill="url(#of-node-core)"
              stroke="#1d4ed8"
              strokeWidth="2"
            />
            <circle
              className="of-flow-node-pulse"
              cx={x}
              cy={NODE_Y}
              r="7"
              fill="url(#of-node-active)"
            />
          </g>
        ))}
      </svg>

      <ol className="sr-only">
        {LIFECYCLE_STAGES.map((stage) => (
          <li key={stage}>{stage}</li>
        ))}
      </ol>

      {/* Full stage names — refined legend, not cards */}
      <ul className="of-lifecycle-legend mt-1 hidden list-none items-stretch justify-between gap-1 px-1 sm:flex">
        {LIFECYCLE_STAGES.map((stage, index) => (
          <li
            key={stage}
            className="of-lifecycle-chip min-w-0 flex-1 text-center"
            style={{ animationDelay: `${0.55 + index * 0.08}s` }}
          >
            <span className="block text-[0.65rem] font-semibold tracking-wide text-of-ai">
              {`0${index + 1}`}
            </span>
            <span className="mt-0.5 block text-[0.72rem] font-medium leading-snug text-of-ink-secondary lg:text-xs">
              {stage}
            </span>
          </li>
        ))}
      </ul>

      <ul className="of-lifecycle-stage-chips mt-3 flex list-none flex-wrap justify-center gap-2 px-2 sm:hidden">
        {LIFECYCLE_STAGES.map((stage, index) => (
          <li
            key={stage}
            className="of-lifecycle-chip rounded-full border border-of-primary-border/80 bg-white/80 px-3 py-1 text-[0.7rem] font-medium text-of-ink-secondary backdrop-blur-sm"
            style={{ animationDelay: `${0.5 + index * 0.08}s` }}
          >
            <span className="mr-1.5 text-of-ai">{`0${index + 1}`}</span>
            {stage}
          </li>
        ))}
      </ul>
    </div>
  )
}
