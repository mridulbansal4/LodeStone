/**
 * Android status bar. Drawn as real icon geometry rather than text glyphs, so
 * it reads as a system bar instead of a decoration.
 */
export function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <span className="clock">9:41</span>
      <span className="sys-icons">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon percent={78} />
      </span>
    </div>
  )
}

function SignalIcon() {
  // Ascending wedge: vertical edge on the right, rising left to right.
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="currentColor">
      <path d="M11.6 0.4a0.9 0.9 0 0 1 0.9 0.9v8.4a0.9 0.9 0 0 1-0.9 0.9H1.1a0.7 0.7 0 0 1-0.5-1.2L10.9 0.7a0.9 0.9 0 0 1 0.7-0.3Z" />
    </svg>
  )
}

function WifiIcon() {
  // Fan with a curved top edge, the way the system icon is drawn.
  return (
    <svg width="14" height="11" viewBox="0 0 15 11" fill="currentColor">
      <path d="M7.5 10.6 0.5 2.9A10.4 10.4 0 0 1 14.5 2.9L7.5 10.6Z" />
    </svg>
  )
}

function BatteryIcon({ percent }: { percent: number }) {
  return (
    <span className="battery">
      <svg width="20" height="11" viewBox="0 0 22 11" fill="none">
        <rect x="0.55" y="0.55" width="18" height="9.9" rx="3" stroke="currentColor" strokeWidth="1.1" />
        <rect x="2.1" y="2.1" width={Math.max(2, (14.8 * percent) / 100)} height="6.8" rx="1.6" fill="currentColor" />
        <rect x="20" y="3.6" width="1.6" height="3.8" rx="0.8" fill="currentColor" />
      </svg>
    </span>
  )
}
