# Parking Memory — Indoor Localization Without Infrastructure

**Tagline:** Your phone remembers the walk, not the pin.

**Category:** On-device sensor fusion / indoor positioning / ambient computing
**Target hardware:** iQOO (Android, Funtouch OS, Snapdragon or Dimensity with sensor hub)

---

## 1. The Problem

You park in the basement of a mall, an airport, or a hospital. Two hours later you have no idea where the car is. You remember "somewhere near a pillar, maybe level 2?"

GPS is useless here. A concrete deck with steel rebar above you kills the signal. The last valid fix your phone has is the ramp at street level, which is often 200 metres and three floors away from where you actually stopped.

This is not a small problem. Multi-level parking is the default in every large Indian mall, every airport, every major hospital. The average person wastes 5–15 minutes per incident, and it is disproportionately painful for elderly users, people with mobility limits, and anyone returning from a week-long trip.

## 2. Why Existing Solutions Fail

| Approach | Why it breaks |
|---|---|
| Drop a GPS pin | No GPS signal underground. Pin lands at the garage entrance or drifts hundreds of metres. |
| Bluetooth beacon networks | Requires the venue to install and maintain hardware. Works in maybe 1% of garages. |
| Wi-Fi RSSI fingerprinting | Requires a prior survey of every garage. Zero coverage in an unmapped building. |
| Mall's own parking app | Only works in that one mall. Most garages have no app at all. |

Every one of these either needs infrastructure that does not exist, or requires the user to remember to do work.

## 3. The Solution

The phone automatically remembers the user's walk from their parked car using onboard sensors, reconstructs the indoor route, and later uses that stored sensor history to localize the user and guide them back to the parking area.

**When parking**, triggered automatically with no user action:
- Detect that you stopped driving and started walking using activity and Bluetooth signals
- Reconstruct your path using step counting plus relative gyroscope heading (pedestrian dead reckoning)
- Record a magnetic field signature along the path
- Detect elevator and stair transitions to estimate floor changes

**During the walk**:
- The phone silently records the steps, relative turns, approximate distance, magnetic fingerprint, floor-transition events, and timing.

**Later, when returning**:
- The phone records a short live sensor sequence
- Matches that sequence against the stored route to figure out where you currently are
- Guides you back along the reverse route with confidence-aware instructions

No infrastructure. Zero user effort. Works the first time you ever enter a garage.

## 4. The Core Technical Insight

Most teams attacking this try plain dead reckoning, which drifts badly. The interesting move is different:

> **In a parking garage, the magnetometer is a terrible compass and an excellent fingerprint.**

Steel rebar, structural beams and a hundred parked cars distort the local magnetic field severely. That distortion is what ruins compass headings. But it is also **spatially stable** — the same point in the garage produces the same anomalous reading every time you pass it.

So we do two things at once:

1. **Exclude the magnetometer from heading estimation.** Use `TYPE_GAME_ROTATION_VECTOR` (gyroscope + accelerometer, no magnetic reference). We do not need absolute north; we need relative turns from the car, and gyro drift over a three-minute walk is acceptable for short indoor routes.

2. **Use the magnetometer as a 1D location fingerprint.** Record magnetic field magnitude and normalized features along the path. On the return trip, align the live sequence against the stored sequence with Dynamic Time Warping (DTW). This tells us where along the route we are, independent of step counting, and corrects accumulated drift.

Performance depends on environmental stability, device orientation, walking path, and magnetic disturbances. This must be validated experimentally on the actual demo device.

---

## 5. System Architecture

```text
Motion sensors
      ↓
Step detection
      ↓
Stride estimation
      ↓
Relative heading
      ↓
PDR
      ↓
Route reconstruction
      ↓
Grid / Manhattan correction
      ↓
Magnetic fingerprint sequence
      ↓
Stored route
```

On return:

```text
Live sensor stream
      ↓
PDR
      ↓
Magnetic fingerprint sequence
      ↓
DTW alignment with stored route
      ↓
Position estimate along route
      ↓
Drift correction
      ↓
Reverse navigation
```

---

## 6. Hardware Prerequisites — Verify on Day Zero

Before writing any feature code, dump the sensor list on the actual demo device:

```kotlin
val sensors = sensorManager.getSensorList(Sensor.TYPE_ALL)
sensors.forEach { Log.d("SENSORS", "${it.name} | type=${it.type} | vendor=${it.vendor}") }
```

**What you are checking for:**

| Sensor | Constant | If missing |
|---|---|---|
| Hardware step detector | `TYPE_STEP_DETECTOR` | Implement software peak detection on accel magnitude. |
| Game rotation vector | `TYPE_GAME_ROTATION_VECTOR` | Fall back to raw gyro integration with periodic gravity re-alignment. |
| Uncalibrated magnetometer | `TYPE_MAGNETIC_FIELD_UNCALIBRATED` | Use calibrated version; slightly worse for fingerprinting. |

**Sampling rates:** accelerometer and gyroscope at `SENSOR_DELAY_GAME` (~50 Hz). Magnetometer at 20–25 Hz is plenty. Do not use `SENSOR_DELAY_FASTEST`; it burns battery and buys nothing.

---

## 7. Algorithm Detail

### 7.1 Step Detection

Prefer the hardware `TYPE_STEP_DETECTOR`, which runs on the low-power sensor hub. Fallback: peak detection on accelerometer magnitude.

### 7.2 Stride Length

Use the Weinberg estimator, which adapts to walking speed:

```text
stride = K · (a_max − a_min)^(1/4)
```

where `a_max` and `a_min` are the acceleration extremes within the step window.

### 7.3 Heading and Manhattan Snapping

Take yaw from `TYPE_GAME_ROTATION_VECTOR`, zeroed at the car so all headings are relative.

Then apply the key correction: **parking garages are grid-aligned.** Detect the dominant corridor direction from the first sustained straight segment, then snap subsequent headings to the nearest multiple of 90° from that axis, with hysteresis so you do not flicker at diagonal moments.

This single heuristic dramatically reduces accumulated heading error and turns a wobbly reconstructed path into a clean orthogonal one.

### 7.4 Floor Detection as Motion-Event Classification

Floor detection is treated as a motion-event classification problem, using a multi-signal state machine with assigned confidence scores.

**Elevator:** 
- walking stops
- step events disappear
- characteristic motion pattern (possible vertical acceleration pattern)
- movement resumes after the event

**Stairs:** 
- step events continue
- repeated vertical motion pattern
- sustained stair-like movement

**Escalator:** 
- little/no normal step progression
- sustained movement pattern consistent with riding an escalator

Example output:
```text
Floor transition detected
Type: Elevator
Estimated transition:  -3 → +2
Confidence: 0.78
```

Make clear that floor detection is one of the less certain parts of the system and should be cross-checked against route history and other sensor evidence.

### 7.5 Return-Trip Localization

When the user opens the app to go back, the system must localize them along the stored route.

1. Record a short live sensor sequence (magnetic field and motion) while they walk.
2. DTW-match that window against the stored magnetic sequence.
3. Lock onto the matched index, then dead-reckon forward with continuous DTW correction.

Use confidence scores to decide whether the system trusts the localization.

If a magnetic match is weak:

```text
Localization confidence: LOW

Continue walking to improve match.
Showing stored route as fallback.
```

The system should never pretend that a low-confidence match is precise.

---

## 8. Phone-In-Pocket Must Be Supported

The user should be able to put the phone in a pocket or carry it naturally. Do NOT require the phone to be held in front of the user. Do NOT require a specific orientation.

The system can estimate the phone's carry mode/orientation from gravity and motion patterns and use orientation-invariant or normalized features. Do not overpromise perfect accuracy for every carrying position, but support the core UX promise: **The user should not have to do anything special. They simply walk.**

---

## 9. Auto-Trigger Logic

Keep the automatic trigger concept realistic. Use multiple weak signals to infer a probable parking-walk event:

```text
Activity transition (VEHICLE → WALKING)
+
Bluetooth car connection state (disconnected)
+
GNSS context (accuracy collapse or leaving anchor)
+
Motion state
```

Normal product experience = automatic.
Development/demo fallback = manual start/replay.

---

## 10. No Visual Ground Truth

The system relies entirely on:
- PDR
- magnetic fingerprint matching
- detected turns
- floor-transition events
- route geometry
- confidence scores
- GNSS entrance anchor where available

If zone information cannot be inferred reliably, describe it as "the recorded parking area / route segment" rather than inventing labels.

---

## 11. Context Intelligence Layer

At the end of the outbound walk, generate a natural summary from the structured facts collected:

> "Parked on Basement 3. You walked ~180 m and took Elevator 4 to the 2nd floor. About a 4 minute walk back."

Additional context features:
- **Walk-back time estimate** derived from the user's actual measured outbound pace
- **Paid parking timer** with an expiry nudge notification
- **Share route** — send the return path to a family member's device
- **Session context** — time parked, duration, roughly where, tied to a history list

---

## 12. Tech Stack

| Layer | Choice |
|---|---|
| Language | Kotlin |
| Min SDK | 26 (Android 8.0) |
| Sensors | Android `SensorManager`, foreground service |
| Activity detection | Google Play Services Activity Recognition Transition API |
| Storage | Room (route metadata) + internal storage (sensor logs) |
| UI | Custom Canvas/path visualization |
| Algorithms | Mathematical/algorithmic implementation for PDR and DTW |

Everything runs on-device. No server. No account.

---

## 13. Data Model

The route object contains only information produced by the sensor-only system:

```json
{
  "route_id": "uuid",
  "created_at": "2026-08-30T14:22:11+05:30",
  "venue_hint": "Phoenix Mall, Pune",
  "entrance_fix": {
    "lat": 18.5621,
    "lng": 73.9187,
    "accuracy_m": 12
  },
  "path": [
    { "t": 0,    "x": 0.0,  "y": 0.0,  "heading": 0.0,   "floor": -3 },
    { "t": 780,  "x": 0.74, "y": 0.0,  "heading": 0.0,   "floor": -3 }
  ],
  "magnetic_series": [
    { "t": 0, "magnitude_uT": 48.2 },
    { "t": 40, "magnitude_uT": 51.7 }
  ],
  "floor_events": [
    { "t": 94000, "type": "ELEVATOR", "confidence": 0.81 }
  ],
  "turn_events": [
    { "t": 3200, "type": "LEFT_TURN", "confidence": 0.95 }
  ],
  "confidence": {
    "pdr": 0.85,
    "magnetic": 0.90
  },
  "total_distance_m": 181.4,
  "walk_duration_s": 143
}
```

---

## 14. Build Plan

### Tier 1 — Working Core
1. Sensor capability verification on actual iQOO device
2. Accelerometer + gyroscope logging
3. Step detection
4. Stride estimation
5. Relative heading
6. PDR route reconstruction
7. Manhattan/grid snapping
8. Route visualization
9. Route persistence
10. Reverse route playback

### Tier 2 — Differentiator
1. Magnetometer recording
2. Magnetic fingerprint representation
3. DTW route alignment
4. Return-trip localization
5. Drift correction
6. Floor-transition detection
7. Auto-trigger logic
8. Confidence scoring

### Tier 3 — Polish
- Better carry-mode handling
- Better confidence visualization
- Route history
- Parking timer
- Natural-language summaries
- Replay tooling
- Office Kit demo integration

---

## 15. Accuracy Targets

**The team will benchmark these values using real sensor traces from the actual iQOO device in a real indoor parking environment.** Do not present unverified numbers as facts.

| Metric | Goal | Status |
|---|---|---|
| Step detection | High reliability | Measure experimentally |
| PDR drift | Minimize over short walks | Measure experimentally |
| Magnetic route matching | Reliable enough to localize along recorded route | Validate experimentally |
| Floor detection | Useful classification | Validate experimentally |
| Return localization | Correct route segment | Validate experimentally |

---

## 16. Risks and Mitigations

### Magnetic environment changes
Cars and electrical equipment can change local magnetic readings.
**Mitigation:** Normalize features, use sequence matching rather than single readings, confidence thresholds, graceful fallback.

### PDR drift
Distance and heading errors accumulate.
**Mitigation:** Grid snapping, turn detection, magnetic alignment, short-route assumptions, confidence-aware guidance.

### Phone orientation
Pocket/hand/bag orientation changes sensor readings.
**Mitigation:** Orientation-aware processing, normalized magnetic features, carry-mode detection where useful.

### Floor detection
Motion signatures may be ambiguous.
**Mitigation:** Multi-signal state machine, confidence scores, route consistency checks.

### Auto-trigger
Activity/Bluetooth/GNSS signals may not perfectly identify a parking event.
**Mitigation:** Combine multiple signals, allow manual fallback in prototype.

### Background execution
Funtouch/OriginOS may restrict background services.
**Mitigation:** Foreground service with persistent notification, explicit battery-optimization exemption request, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`. Test early.

---

## 17. Demo Plan

### Demo A — Real sensor recording
Walk a real route. Show:
```text
Recording...
Steps: 142
Distance: ~175 m
Turns: 6
Floor transition: detected
```
Show the route being reconstructed live.

### Demo B — Magnetic fingerprint
Show:
```text
Outbound magnetic trace
        vs.
Return magnetic trace
```
Then show DTW aligning them. This is the main technical "wow" moment.

### Demo C — Return navigation
Start the return walk. Show the system locating the user on the stored route and guiding them backward.

### Demo D — Replay mode
Use **real sensor recordings**, not fabricated/simulated data. Be transparent that replay mode is recorded real-world sensor data.

---

## 18. Anticipated Judge Questions

### "Why not GPS?"
GPS is unreliable underground.

### "Why not Bluetooth beacons?"
Requires infrastructure.

### "Why not Wi-Fi fingerprinting?"
Requires mapping/surveying infrastructure.

### "Why don't you use the camera?"
We deliberately removed the camera because the product should require zero user effort. The user should be able to put the phone in their pocket and simply walk. Our localization is based on the phone's own motion and magnetic sensors.

### "How do you know where the user is?"
We reconstruct the original route using pedestrian dead reckoning, then use the magnetic field as a spatial fingerprint. Dynamic Time Warping aligns the live magnetic sequence with the previously recorded route and helps correct accumulated PDR drift.

### "What if the magnetic field changes?"
The system uses sequences rather than single readings, confidence scoring, and graceful fallback. Performance is benchmarked in real environments.

### "Can you identify the exact parking slot?"
We don't promise centimeter-level slot localization. Our goal is to reliably return the user to the recorded parking area/route segment, with confidence-aware guidance.

### "What if the user walks a different route back?"
Detect low-confidence alignment and fall back to the stored route instead of giving confidently wrong navigation.

---

## 19. Vision Beyond the Hackathon

- Repeated route refinement
- Crowdsourced sensor traces
- Shared indoor route maps
- Generalized indoor memory (airports, hospitals, malls, campuses, train stations)
- Accessibility

**A phone can build a useful memory of places simply by experiencing the movement through them.**

---

## 20. One-Line Pitch

**Every parking app remembers a pin. GPS fails underground. We remember the walk itself — using the phone's motion and magnetic fingerprints to reconstruct, recognize, and replay your route back to your car, with zero infrastructure and zero camera interaction.**
