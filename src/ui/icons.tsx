/**
 * Shared icon set.
 *
 * One stroke weight (1.7 at a 20px box), round caps and joins, drawn on a
 * consistent grid so icons sitting next to each other in a control cluster
 * read as one family. Sized by the `size` prop rather than scaled with CSS
 * transforms, so strokes never go fractional.
 */

interface IconProps {
  size?: number
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

/** Stacked floor plates - the exploded-levels idea, at icon scale. */
export function LayersIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M10 2.6 17 6.3 10 10 3 6.3 10 2.6Z" />
      <path d="M3 10.6 10 14.3 17 10.6" />
      <path d="M3 14.4 10 18.1 17 14.4" opacity="0.45" />
    </svg>
  )
}

export function ZoomInIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="8.6" cy="8.6" r="5.4" />
      <path d="m12.7 12.7 4 4" />
      <path d="M8.6 6.4v4.4M6.4 8.6h4.4" />
    </svg>
  )
}

export function ZoomOutIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="8.6" cy="8.6" r="5.4" />
      <path d="m12.7 12.7 4 4" />
      <path d="M6.4 8.6h4.4" />
    </svg>
  )
}

/** Keyboard, for the controls toggle. Reads better than a question mark. */
export function KeyboardIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="1.8" y="5" width="16.4" height="10" rx="2.4" />
      <path d="M5.4 8.4h.01M8.4 8.4h.01M11.4 8.4h.01M14.4 8.4h.01M6.6 11.6h6.8" />
    </svg>
  )
}

/** Lift car between floors: the up/down pair used on the floor-event card. */
export function ElevatorIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M6.2 16.4V7.6m0 0L3.8 10m2.4-2.4L8.6 10" />
      <path d="M13.8 3.6v8.8m0 0 2.4-2.4m-2.4 2.4L11.4 10" />
    </svg>
  )
}

export function StairsIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M2.6 16.4h4v-4h4v-4h4v-4h2.2" />
    </svg>
  )
}

export function EscalatorIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3.4 15.6 15 4.4" />
      <path d="M15 4.4h-3.6M15 4.4V8" />
      <path d="M3.4 15.6h3.4" opacity="0.5" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3.6 10h12.8m0 0-4.4-4.4M16.4 10l-4.4 4.4" />
    </svg>
  )
}

export function SwapIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3.4 7h11.2m0 0-2.8-2.8M14.6 7l-2.8 2.8" />
      <path d="M16.6 13H5.4m0 0 2.8-2.8M5.4 13l2.8 2.8" />
    </svg>
  )
}

export function ReplayIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M16.4 10a6.4 6.4 0 1 1-1.9-4.5" />
      <path d="M16.4 3.2v3.6h-3.6" />
    </svg>
  )
}
