import { useUi } from '../sim/store'
import { MemoryMap } from './MemoryMap'
import { StatStrip } from './StatStrip'
import { Instruction } from './Instruction'
import { ConfidenceChip } from './ConfidenceChip'
import { FloorEventCard, MemoryCard, ToastLine, Morph } from './states/Cards'
import { RouteOverview, CarFound } from './states/Overlays'
import { findMyCar } from '../sim/actions'
import { SIM } from '../sim/constants'

/** The 13-state router for the simulated phone screen. */
export function PhoneScreen() {
  const phase = useUi((s) => s.phase)
  const floorLbl = useUi((s) => s.floorLbl)
  const distanceRemaining = useUi((s) => s.distanceRemaining)
  const distance = useUi((s) => s.distance)

  const recording = phase === 'parked' || phase === 'remembering' || phase === 'floorTransition'
  const navigating = phase === 'returnNav' || phase === 'offRoute' || phase === 'recovered'
  // Route Overview hands the whole screen to the map; the sheet carries the copy.
  const overview = phase === 'routeOverview'
  const ready = distance >= SIM.MEMORY_MIN_DIST

  return (
    <div className="phone-screen">
      <div className="status-bar">
        <span>9:41</span>
        <span aria-hidden="true">▮▮▮ ⌁ 78%</span>
      </div>

      <div className="phone-header">
        <div className="brand">
          <i aria-hidden="true" />
          Parking Memory
        </div>
        <div className="sim-chip" title="No real sensors are used in this prototype">
          <i aria-hidden="true" />
          Sim
        </div>
      </div>

      <div className="phone-map">
        <MemoryMap />
        <div className="map-chip">{floorLbl}</div>
        {recording && (
          <div className="rec-pill">
            <i aria-hidden="true" />
            Remembering your walk
          </div>
        )}
        {navigating && <ConfidenceChip />}
        <FloorEventCard />
        <MemoryCard />
        <ToastLine />
      </div>

      {!overview && <Instruction />}
      {!overview && <StatStrip />}

      {!overview && (
      <div className="phone-action">
        {navigating ? (
          <button className="ghost" disabled>
            {distanceRemaining} m to your car
          </button>
        ) : (
          <button onClick={findMyCar} disabled={phase === 'carFound' || !ready}>
            {ready ? 'Find My Car' : 'Keep walking — building memory'}
          </button>
        )}
      </div>
      )}

      <Morph />
      <RouteOverview />
      <CarFound />
    </div>
  )
}
