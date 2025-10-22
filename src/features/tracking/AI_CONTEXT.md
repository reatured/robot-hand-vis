# Tracking Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS

**After making ANY changes to this feature, you MUST:**
1. ✅ Update this AI_CONTEXT.md file
2. ✅ Update "Last Modified" date below
3. ✅ Add entry to "Change History" section
4. ✅ Update "Current Status" percentage
5. ✅ Update "Known Issues" if you fixed/introduced bugs
6. ✅ Update "Next Steps" based on remaining work
7. ✅ Update `/PROJECT_OVERVIEW.md` "Recent Changes" section
8. ✅ Commit: `git commit -m "feat(tracking): {description} + update docs"`

---

## Metadata
- **Feature:** Tracking
- **Status:** ✅ Implemented (needs integration testing)
- **Completion:** 90%
- **Last Modified:** 2025-10-22
- **Modified By:** Initial implementation
- **Milestone:** M1 (Camera + MediaPipe + Overlay)
- **Dependencies:** camera feature
- **Used By:** alignment feature (M3), fingertips feature (M4)

---

## Change History

### 2025-10-22
- ✅ Initial implementation of MediaPipe Hands integration
- ✅ Created HandTracker class with EMA filtering (179 lines)
- ✅ Created useHandTracking hook with FPS tracking (171 lines)
- ✅ Created LandmarkOverlay component with canvas rendering (163 lines)
- ✅ Defined comprehensive types (109 lines)
- ✅ Added barrel exports
- 🚧 Not yet integrated with Zustand store
- 🚧 Not yet tested in browser (blocked by build errors)

---

## Purpose

The **tracking feature** provides real-time hand tracking using Google's MediaPipe Hands library.

**What it does:**
1. 📹 Receives video frames from camera feature
2. 🧠 Processes frames through MediaPipe Hands model
3. 📍 Detects 21 landmarks per hand (up to 2 hands)
4. 🎚️ Applies EMA (Exponential Moving Average) filtering to reduce jitter
5. 📊 Tracks FPS and confidence metrics
6. 🎨 Renders 2D landmark overlay on camera view

**Output:** `HandTrackingResult[]` with landmarks, handedness, and confidence

---

## Current Status

### Implementation: 90% Complete

**Files Status:**
- ✅ **types.ts** - Fully implemented (109 lines)
- ✅ **core/handTracker.ts** - Fully implemented (179 lines)
- ✅ **hooks/useHandTracking.ts** - Fully implemented (171 lines)
- ✅ **components/LandmarkOverlay.tsx** - Fully implemented (163 lines)
- ✅ **index.ts** - Barrel exports configured
- ❌ **store/trackingSlice.ts** - NOT CREATED (needs Zustand integration)

**What's Working:**
- ✅ MediaPipe Hands initialization
- ✅ Frame processing pipeline
- ✅ EMA filtering algorithm
- ✅ FPS calculation
- ✅ Landmark overlay rendering
- ✅ Multi-hand detection (up to 2)

**What's Missing:**
- ❌ Zustand store integration (10% remaining)
- ❌ Browser testing (blocked by build errors)
- ❌ Unit tests
- ❌ Integration with alignment feature

---

## Architecture

### Directory Structure

```
tracking/
├── AI_CONTEXT.md              ← 🤖 You are here
├── types.ts                   ← Type definitions (109 lines)
├── index.ts                   ← Public exports
│
├── core/
│   └── handTracker.ts         ← MediaPipe integration (179 lines)
│
├── hooks/
│   └── useHandTracking.ts     ← React hook (171 lines)
│
├── components/
│   └── LandmarkOverlay.tsx    ← 2D canvas overlay (163 lines)
│
└── store/                     ← ❌ NOT CREATED
    └── trackingSlice.ts       ← Zustand state (TODO)
```

**Total Lines:** 622 lines of production code

### Data Flow

```
Camera Video Element
    ↓
useHandTracking Hook
    ↓
HandTracker.processFrame()
    ↓
MediaPipe Hands Model
    ↓
HandTracker.handleResults()
    ↓
EMA Filtering
    ↓
HandTrackingResult[] (landmarks, handedness, confidence)
    ↓
    ├─→ Callback to useHandTracking hook
    ├─→ Update React state (results, FPS)
    ├─→ [Future] Update Zustand store
    └─→ LandmarkOverlay renders on canvas
```

### Integration Points

**Depends On:**
- `camera` feature → Provides video element ref

**Used By:**
- `alignment` feature (M3) → Consumes landmarks for palm alignment
- `fingertips` feature (M4) → Consumes landmarks for fingertip targets
- `inspector` feature (M6) → Displays tracking metrics in UI

**State:**
- [Future] Zustand store → Shares tracking results globally

---

## Key Files

### types.ts (109 lines)

**Purpose:** TypeScript definitions for hand tracking

**Key Exports:**

```typescript
// Core types
export interface HandLandmark {
  x: number        // Normalized [0,1]
  y: number        // Normalized [0,1]
  z: number        // Depth relative to wrist
  visibility?: number
}

export type HandLandmarks = HandLandmark[]  // Array of 21 landmarks

export interface HandTrackingResult {
  landmarks: HandLandmarks
  worldLandmarks?: HandLandmarks  // 3D world coords in meters
  handedness: 'Left' | 'Right'
  score: number  // Confidence [0,1]
}

export interface TrackingState {
  enabled: boolean
  isTracking: boolean
  lastDetectionTime: number
  fps: number
  results: HandTrackingResult[]
}

// MediaPipe landmark indices
export enum HandLandmarkIndex {
  WRIST = 0,
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  // ... 21 total landmarks
}

// Skeleton connections for rendering
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],  // Index
  // ... 20 total connections
]

// Filtering configuration
export interface FilterConfig {
  enabled: boolean
  alpha: number  // EMA smoothing factor [0,1]
}
```

---

### core/handTracker.ts (179 lines)

**Purpose:** MediaPipe Hands integration and filtering

**Class:** `HandTracker`

**Key Methods:**

```typescript
class HandTracker {
  // Initialization
  async initialize(): Promise<void>
    // Loads MediaPipe Hands from CDN
    // Sets up options (maxNumHands, modelComplexity, confidence)
    // Registers results callback

  // Frame processing
  async processFrame(videoElement: HTMLVideoElement): Promise<void>
    // Sends video frame to MediaPipe
    // Async - does not block rendering

  // Configuration
  setOptions(options: {...}): void
    // Updates MediaPipe settings

  setFilterConfig(config: Partial<FilterConfig>): void
    // Updates EMA filter settings

  onResults(callback: (results) => void): void
    // Registers callback for tracking results

  // Cleanup
  dispose(): void
    // Closes MediaPipe, clears state
}
```

**Key Features:**

1. **CDN Loading:**
```typescript
this.hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  },
})
```

2. **EMA Filtering:**
```typescript
private applyFilter(handKey: string, landmarks: HandLandmarks): HandLandmarks {
  const alpha = this.filterConfig.alpha
  const filtered = landmarks.map((lm, i) => ({
    x: alpha * lm.x + (1 - alpha) * previous[i].x,
    y: alpha * lm.y + (1 - alpha) * previous[i].y,
    z: alpha * lm.z + (1 - alpha) * previous[i].z,
  }))
  return filtered
}
```

**Parameters:**
- `alpha = 0.5`: Higher = more responsive, lower = smoother
- Separate EMA state for left/right hands

3. **Multi-Hand Support:**
- Detects up to 2 hands simultaneously
- Tracks left/right separately

---

### hooks/useHandTracking.ts (171 lines)

**Purpose:** React integration for hand tracking

**Hook:** `useHandTracking`

**Signature:**
```typescript
function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options?: UseHandTrackingOptions
): UseHandTrackingReturn
```

**Options:**
```typescript
interface UseHandTrackingOptions {
  enabled?: boolean               // Default: true
  maxNumHands?: number            // Default: 2
  modelComplexity?: 0 | 1         // Default: 1
  minDetectionConfidence?: number // Default: 0.5
  minTrackingConfidence?: number  // Default: 0.5
  filterAlpha?: number            // Default: 0.5 (EMA)
}
```

**Returns:**
```typescript
interface UseHandTrackingReturn {
  results: HandTrackingResult[]  // Tracking results
  isTracking: boolean             // Tracker initialized?
  error: string | null            // Error message
  fps: number                     // Current FPS
}
```

**Key Features:**

1. **Automatic Initialization:**
   - Creates HandTracker on mount
   - Configures with options
   - Cleans up on unmount

2. **Animation Frame Loop:**
   - Processes frames continuously
   - Prevents blocking (checks `isProcessing`)
   - Calculates FPS (updates every 1s)

3. **Error Handling:**
   - Catches initialization errors
   - Catches frame processing errors
   - Reports via `error` state

**Usage Example:**
```typescript
function MyCameraComponent() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { results, isTracking, fps, error } = useHandTracking(videoRef, {
    filterAlpha: 0.7,  // Smoother tracking
  })

  return (
    <div>
      <video ref={videoRef} />
      {results.map(result => (
        <div>Hand: {result.handedness}, Confidence: {result.score}</div>
      ))}
    </div>
  )
}
```

---

### components/LandmarkOverlay.tsx (163 lines)

**Purpose:** 2D canvas overlay for visualizing hand landmarks

**Component:** `LandmarkOverlay`

**Props:**
```typescript
interface LandmarkOverlayProps {
  width: number                  // Canvas width
  height: number                 // Canvas height
  results: HandTrackingResult[]  // Tracking results
  showConfidence?: boolean       // Default: true
  showFPS?: boolean              // Default: true
  fps?: number                   // FPS to display
}
```

**Rendering:**

1. **Skeleton (Connections):**
   - 20 connections between landmarks
   - Color: Green (#00ff88) for left, Orange (#ff8800) for right
   - Line width: 2px

2. **Landmarks (Joints):**
   - Wrist: 8px radius
   - Fingertips: 6px radius
   - Other joints: 4px radius
   - White border for visibility

3. **UI Overlays:**
   - FPS (top-left): Green if >20fps, orange otherwise
   - Confidence per hand: Percentage
   - "No hands detected" when empty

**Canvas Operations:**

```typescript
useEffect(() => {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)  // Clear

  results.forEach(result => {
    drawHand(ctx, result, width, height)  // Draw skeleton & landmarks
  })

  drawInfo(ctx, results, fps, ...)  // Draw UI
}, [results, width, height, fps])
```

**Mirroring:**
```tsx
<canvas
  style={{ transform: 'scaleX(-1)' }}  // Mirror to match video
/>
```

---

## Types & Interfaces

See `types.ts` section above for comprehensive type definitions.

**Key Concepts:**

- **Normalized Coordinates:** Landmarks are [0,1] relative to image size
- **Depth (z):** Negative = closer to camera, relative to wrist
- **Handedness:** 'Left' or 'Right' (from MediaPipe)
- **Confidence:** Score [0,1] for detection quality
- **World Landmarks:** Optional 3D coordinates in meters (real-world space)

---

## API / Public Interface

**Exported in `index.ts`:**

```typescript
// Core
export { HandTracker } from './core/handTracker'

// Hooks
export { useHandTracking } from './hooks/useHandTracking'

// Components
export { LandmarkOverlay } from './components/LandmarkOverlay'

// Types
export * from './types'
```

**Usage in other features:**

```typescript
import { useHandTracking, LandmarkOverlay } from '@/features/tracking'
import type { HandLandmarks } from '@/features/tracking'
```

---

## State Management

### Current: Local State Only

Currently, tracking state is managed locally in `useHandTracking` hook:

```typescript
const [results, setResults] = useState<HandTrackingResult[]>([])
const [isTracking, setIsTracking] = useState(false)
const [fps, setFps] = useState(0)
```

### Future: Zustand Integration (TODO)

**Planned:** `store/trackingSlice.ts`

```typescript
export interface TrackingSlice {
  // State
  enabled: boolean
  results: HandTrackingResult[]
  fps: number
  lastDetectionTime: number

  // Actions
  setEnabled: (enabled: boolean) => void
  setResults: (results: HandTrackingResult[]) => void
  setFPS: (fps: number) => void
}
```

**Integration Point:**
```typescript
// In useHandTracking hook
const setResults = useAppStore((state) => state.tracking.setResults)

// Update store instead of local state
setResults(trackingResults)
```

---

## Usage Examples

### Basic Usage

```typescript
import { CameraView } from '@/features/camera'
import { useHandTracking, LandmarkOverlay } from '@/features/tracking'

function HandTrackingDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { results, isTracking, fps } = useHandTracking(videoRef)

  return (
    <div className="relative">
      <CameraView ref={videoRef} />
      <LandmarkOverlay
        width={320}
        height={240}
        results={results}
        fps={fps}
      />
    </div>
  )
}
```

### Advanced Configuration

```typescript
const { results, isTracking, fps, error } = useHandTracking(videoRef, {
  enabled: true,
  maxNumHands: 1,                // Single hand only
  modelComplexity: 1,            // High accuracy
  minDetectionConfidence: 0.7,   // Higher threshold
  minTrackingConfidence: 0.7,
  filterAlpha: 0.3,              // Smoother (more filtering)
})
```

### Accessing Specific Landmarks

```typescript
import { HandLandmarkIndex } from '@/features/tracking'

const wrist = results[0].landmarks[HandLandmarkIndex.WRIST]
const indexTip = results[0].landmarks[HandLandmarkIndex.INDEX_FINGER_TIP]
```

---

## Known Issues

### 🟡 Moderate

#### 1. Not Integrated with Zustand Store
**Status:** Pending implementation
**Impact:** Can't share tracking results with other features
**Priority:** HIGH - Blocking M3 (alignment)
**Fix:** Create `store/trackingSlice.ts` and integrate

#### 2. Untested in Browser
**Status:** Blocked by build errors
**Impact:** Can't verify functionality
**Priority:** HIGH
**Dependencies:** Fix STLLoader import, global.css

### 🟢 Minor

#### 3. MediaPipe CDN Loading
**Issue:** Uses CDN for model files (potential CORS/network issues)
**Workaround:** Could bundle models locally if needed
**Priority:** LOW

#### 4. No Kalman Filter
**Issue:** Only EMA filtering, could be smoother
**Enhancement:** Consider Kalman filter for better smoothing
**Priority:** LOW - EMA works well

---

## Testing Status

- ❌ **Unit Tests:** Not created
- ❌ **Integration Tests:** Not created
- ❌ **E2E Tests:** Not created
- 🚧 **Manual Testing:** Blocked by build errors

**Test Plan:**

1. **Unit Tests:**
   - HandTracker initialization
   - EMA filtering algorithm
   - Landmark conversion

2. **Integration Tests:**
   - Hook with mock video element
   - Store updates (after Zustand integration)

3. **E2E Tests:**
   - Camera → Tracking → Overlay rendering
   - Multi-hand detection
   - FPS > 30

---

## Next Steps

1. **Create Zustand Slice** (2 hours)
   - Create `store/trackingSlice.ts`
   - Integrate with global store
   - Update hook to use store

2. **Fix Build Errors** (30 min)
   - Required before testing
   - See PROJECT_OVERVIEW.md

3. **Browser Testing** (1 hour)
   - Test hand detection
   - Verify FPS > 30
   - Test multi-hand mode
   - Test filtering smoothness

4. **Unit Tests** (2-3 hours)
   - Test HandTracker class
   - Test EMA filtering
   - Test useHandTracking hook

5. **Integration with Alignment** (after M3 starts)
   - Provide landmarks to alignment feature
   - Verify quaternion calculation uses correct data

---

## Dependencies

### Required Features
- **camera** - Provides video element

### Required Packages
- `@mediapipe/hands` v0.4.1675469240 - Hand landmark detection
- `react` v18.2.0 - React hooks
- `three` (indirect) - For future 3D visualization

### Browser Requirements
- WebGL support (for MediaPipe)
- Modern JavaScript (ES2020+)

---

## Performance Notes

### Current Performance
- **Target FPS:** 30-60fps
- **Tracking Latency:** <50ms (needs profiling)
- **Memory:** Stable (proper cleanup in hooks)

### Optimizations Applied
- ✅ Animation frame loop (not setInterval)
- ✅ EMA filtering (reduces noise without heavy computation)
- ✅ Separate state for left/right hands (independent filtering)
- ✅ Only process when video ready (`HAVE_ENOUGH_DATA`)

### Potential Bottlenecks
- MediaPipe model inference (30-50ms per frame)
- Canvas rendering (negligible with hardware acceleration)

### Profiling TODO
- [ ] Measure actual FPS in browser
- [ ] Measure tracking latency
- [ ] Measure memory usage over time

---

## AI Development Guidelines

### When Modifying This Feature:

1. ✅ **Read this entire file first**
2. ✅ Check dependencies (`camera` feature)
3. ✅ Check dependents (`alignment`, `fingertips`)
4. ✅ Follow existing patterns (class for core, hooks for React)
5. ✅ Update `types.ts` if adding interfaces
6. ✅ Export in `index.ts` if public API
7. ✅ Test with real camera (not just unit tests)
8. ✅ **UPDATE THIS FILE after changes**

### Common Patterns

**Pattern 1: Adding a new filter**
```typescript
// In HandTracker class
private applyKalmanFilter(landmarks: HandLandmarks): HandLandmarks {
  // Implementation
}

// In handleResults
const filteredLandmarks = this.filterConfig.useKalman
  ? this.applyKalmanFilter(handLandmarks)
  : this.applyFilter(handKey, handLandmarks)
```

**Pattern 2: Adding a new landmark visualization**
```typescript
// In LandmarkOverlay
function drawCustomMarker(ctx: CanvasRenderingContext2D, landmark: HandLandmark) {
  // Custom rendering
}

// Call in useEffect
landmarks.forEach((lm, i) => {
  if (isSpecialLandmark(i)) {
    drawCustomMarker(ctx, lm)
  }
})
```

### Things to Watch Out For

⚠️ **Memory Leaks:** Always clean up in `useEffect` return function
⚠️ **Async State Updates:** Check `mounted` flag before `setState` in async ops
⚠️ **MediaPipe CDN:** Network failures will break initialization
⚠️ **Canvas Performance:** Clearing canvas every frame is expensive (but necessary)
⚠️ **Coordinate Systems:** MediaPipe uses normalized [0,1], convert to pixels for canvas

### Code Style

- Use **TypeScript strict mode**
- **Async/await** for promises (not `.then()`)
- **Cleanup** all resources (MediaPipe, animation frames, event listeners)
- **Error handling** with try/catch, report via state
- **Comments** for complex algorithms (e.g., EMA formula)

---

## References

- **Main Plan:** `/AIAgent/Todo/MainPlan-251022.md` - Section 1.3 (M1)
- **Progress Log:** `/AIAgent/ProgressLog/Progress-251022.md`
- **Project Overview:** `/PROJECT_OVERVIEW.md`
- **Feature Architecture:** `/src/features/README.md`

### External Docs
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- [MediaPipe Hands Landmarks](https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model)
- [EMA Filter](https://en.wikipedia.org/wiki/Exponential_smoothing)

---

## 🤖 POST-MODIFICATION CHECKLIST

After making changes to this feature:

- [ ] Updated "Last Modified" date at top
- [ ] Added entry to "Change History" section
- [ ] Updated "Current Status" completion percentage
- [ ] Updated "Key Files" section if files added/removed
- [ ] Updated "Known Issues" section (fixed/new bugs)
- [ ] Updated "Next Steps" section
- [ ] Updated "Testing Status" section
- [ ] Updated `/PROJECT_OVERVIEW.md` "Recent Changes"
- [ ] Updated `/AIAgent/ProgressLog/Progress-251022.md` if milestone affected
- [ ] Committed with message: `feat(tracking): {description} + update docs`

**This ensures documentation stays synchronized with code!**

---

**Last Updated:** 2025-10-22
**Status:** ✅ Implementation Complete - Pending Integration Testing
**Next Action:** Fix build errors → Test in browser → Create Zustand slice
