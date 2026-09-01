import { useUi } from '../sim/store'
import { MemoryMap } from './MemoryMap'
import { StatusBar } from './StatusBar'
import { StatStrip } from './StatStrip'
import { Instruction } from './Instruction'
import { ConfidenceChip } from './ConfidenceChip'
import { FloorEventCard, MemoryCard, ToastLine, Morph } from './states/Cards'
import { RouteOverviewSheet, CarFound } from './states/Overlays'
import { findMyCar } from '../sim/actions'
import { SIM } from '../sim/constants'
import { LayersIcon } from '../ui/icons'

import { OriginHomeScreen } from './OriginHomeScreen'

/**
 * The 13-state router for the simulated phone screen.
 *
 * Laid out the way a real Android navigation app is: a full-bleed map with the
 * system bars drawn over it, a floating top bar, and a bottom sheet that owns
 * all of the guidance content.
 */
export function PhoneScreen() {
  const phase = useUi((s) => s.phase)
  const floorLbl = useUi((s) => s.floorLbl)
  const floorNm = useUi((s) => s.floorNm)
  const distanceRemaining = useUi((s) => s.distanceRemaining)
  const distance = useUi((s) => s.distance)

  const recording = phase === 'parked' || phase === 'remembering' || phase === 'floorTransition'
  const navigating = phase === 'returnNav' || phase === 'offRoute' || phase === 'recovered'
  const overview = phase === 'routeOverview'
  const ready = distance >= SIM.MEMORY_MIN_DIST

  // State 1 - Landing. Shows authentic iQOO 15 OriginOS 6 Home Screen with Park Trace app installed.
  if (phase === 'landing') {
    return <OriginHomeScreen />
  }

  return (
    <div className="phone-screen">
      <div className="phone-map">
        <MemoryMap />
      </div>

      <StatusBar />

      <div className="top-bar">
        <span className="app-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 12.5V8.5h4v-4h4V2"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="3.5" cy="12.5" r="2.1" fill="currentColor" />
          </svg>
        </span>
        <span className="app-title">Park Trace</span>
        <span className="sim-chip" title="No real sensors are used in this prototype">
          SIM
        </span>
      </div>

      <div className="map-chips">
        <div className="floor-chip">
          <span className="chip-icon" aria-hidden="true">
            <LayersIcon size={15} />
          </span>
          <b>{floorLbl}</b>
          <span>{floorNm.replace(/^\S+\s/, '')}</span>
        </div>
        {recording && (
          <div className="rec-pill">
            <i aria-hidden="true" />
            Remembering your walk
          </div>
        )}
      </div>

      {navigating && <ConfidenceChip />}

      <FloorEventCard />
      <MemoryCard />
      <ToastLine />

      {overview ? (
        <RouteOverviewSheet />
      ) : (
        <div className="bottom-sheet">
          <span className="sheet-handle" aria-hidden="true" />
          <Instruction />
          <StatStrip />
          {navigating ? (
            <button className="btn-tonal" disabled>
              {distanceRemaining} m to your car
            </button>
          ) : (
            <button className="btn-filled" onClick={findMyCar} disabled={phase === 'carFound' || !ready}>
              {ready ? 'Find my car' : 'Keep walking to build memory'}
            </button>
          )}
        </div>
      )}

      <span className="nav-pill" aria-hidden="true" />

      <Morph />
      <CarFound />
    </div>
  )
}
