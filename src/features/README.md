# Features Architecture Guide

## 🤖 AI DEVELOPER: Feature System Overview

This document explains the feature-based architecture used in this project. **Read this before working on any feature.**

---

## Feature-Based Architecture

### Why Feature-Based?

✅ **Isolation** - Features are self-contained modules
✅ **Scalability** - Easy to add new features without conflicts
✅ **Maintainability** - Clear boundaries and responsibilities
✅ **Testability** - Each feature can be tested independently
✅ **Collaboration** - Multiple developers can work in parallel

### Feature Structure

Every feature follows this standard structure:

```
src/features/{feature-name}/
├── AI_CONTEXT.md          ← 🤖 AI development guide - READ THIS FIRST
├── types.ts               ← TypeScript interfaces and types
├── index.ts               ← Public API (barrel export)
│
├── components/            ← React components (UI)
│   └── Component.tsx
│
├── core/                  ← Business logic (pure functions)
│   └── logic.ts
│
├── hooks/                 ← React hooks (state logic)
│   └── useHook.ts
│
└── store/                 ← Zustand state slices
    └── slice.ts
```

**Not all features need all directories. Create what you need.**

---

## All Features Overview

| Feature | Status | % | Purpose | Milestone |
|---------|--------|---|---------|-----------|
| **tracking** | ✅ Complete | 90% | MediaPipe hand tracking | M1 |
| **camera** | ✅ Complete | 100% | Webcam video capture | M1 |
| **urdf** | ✅ Complete | 85% | Robot model loading | M2 |
| **scene** | ✅ Complete | 100% | 3D scene setup | Core |
| **inspector** | 🚧 Partial | 15% | UI control panel | M6 |
| **debug** | 🚧 Partial | 20% | Debug visualization | M6 |
| **alignment** | ❌ Planned | 0% | Palm plane alignment | M3 |
| **fingertips** | ❌ Planned | 0% | Fingertip target mapping | M4 |
| **ik** | ❌ Planned | 0% | IK solver integration | M5 |
| **assets** | 🚧 Partial | 10% | Asset management | M7 |

---

## Feature Dependencies

```
┌─────────────────────────────────────────────┐
│                 App Layer                    │
│            (app/page.tsx)                    │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│            Barrel Exports                    │
│        (src/components/index.ts)             │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│                Features                      │
└─────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌────────┐    ┌────────┐    ┌────────┐
    │ camera │    │ scene  │    │ assets │
    └────────┘    └────────┘    └────────┘
         ↓              ↓
    ┌────────┐    ┌────────┐
    │tracking│    │  urdf  │
    └────────┘    └────────┘
         ↓              ↓
    ┌─────────────────────────┐
    │     alignment           │  (depends on tracking)
    └─────────────────────────┘
                ↓
    ┌─────────────────────────┐
    │     fingertips          │  (depends on alignment)
    └─────────────────────────┘
                ↓
    ┌─────────────────────────┐
    │         ik              │  (depends on fingertips)
    └─────────────────────────┘
                ↓
    ┌─────────────────────────┐
    │        urdf             │  (receives IK joint angles)
    └─────────────────────────┘

Supporting Features (no dependencies):
- inspector (UI controls)
- debug (visualization helpers)
```

### Dependency Rules

1. **tracking** depends on: camera
2. **alignment** depends on: tracking
3. **fingertips** depends on: alignment
4. **ik** depends on: fingertips, urdf
5. **urdf** depends on: scene, assets
6. **inspector** depends on: all features (for UI controls)
7. **debug** depends on: all features (for visualization)

**Rule:** Features cannot have circular dependencies!

---

## State Management (Zustand)

### Global Store

**Location:** `src/store/useAppStore.ts` ❌ NOT YET IMPLEMENTED

```typescript
// Example structure (TO BE IMPLEMENTED)
interface AppStore {
  // Each feature has its own slice
  tracking: TrackingState
  alignment: AlignmentState
  ik: IKState
  // ... etc
}
```

### Feature Slices

Each feature can have its own Zustand slice:

```
src/features/{feature}/store/{feature}Slice.ts
```

**Example:** `src/features/debug/store/debugSlice.ts`

### State Flow

```
User Action (camera, hand movement)
    ↓
Feature Hook (useHandTracking)
    ↓
Update Zustand Store
    ↓
Other Features React (via selectors)
    ↓
UI Updates
```

---

## Import/Export Conventions

### Barrel Exports

Each feature exports its public API via `index.ts`:

```typescript
// src/features/tracking/index.ts
export { HandTracker } from './core/handTracker'
export { useHandTracking } from './hooks/useHandTracking'
export { LandmarkOverlay } from './components/LandmarkOverlay'
export * from './types'
```

### Global Barrel Export

All public components are re-exported in `src/components/index.ts`:

```typescript
// src/components/index.ts
export { Camera } from '@/features/camera'
export { Scene } from '@/features/scene'
export { RobotHand } from '@/features/urdf'
```

### Import Patterns

**✅ Good - Use barrel exports:**
```typescript
import { Camera, Scene } from '@/components'
import { useHandTracking } from '@/features/tracking'
```

**❌ Bad - Direct file imports:**
```typescript
import { Camera } from '@/features/camera/components/CameraView'
```

**Exception:** Within a feature, direct imports are OK:
```typescript
// Inside src/features/tracking/hooks/useHandTracking.ts
import { HandTracker } from '../core/handTracker' // OK
```

---

## TypeScript Patterns

### Types Location

All types go in `types.ts`:

```typescript
// src/features/tracking/types.ts
export interface HandLandmark {
  x: number
  y: number
  z: number
}

export type HandLandmarks = HandLandmark[]
```

### Type Sharing

Features can import types from other features:

```typescript
// src/features/alignment/core/palmAlignment.ts
import type { HandLandmarks } from '@/features/tracking'
```

### Type Organization

```typescript
// types.ts structure
export interface {Name} { }        // Main interfaces
export type {Name} = ...           // Type aliases
export enum {Name} { }             // Enums
export const CONSTANT = ...        // Constants
```

---

## Component Patterns

### Component Structure

```typescript
// src/features/camera/components/CameraView.tsx

'use client' // If using Next.js app directory

import { useEffect, useRef, useState } from 'react'

interface CameraViewProps {
  width?: number
  height?: number
  className?: string
}

export function CameraView({
  width = 320,
  height = 240,
  className = '',
}: CameraViewProps) {
  // State
  const [error, setError] = useState<string | null>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)

  // Effects
  useEffect(() => {
    // Setup & cleanup
  }, [])

  // Render
  return <div>...</div>
}
```

### Naming Conventions

- **Components:** PascalCase (e.g., `CameraView`, `RobotHand`)
- **Hooks:** `use` prefix, camelCase (e.g., `useHandTracking`)
- **Utilities:** camelCase (e.g., `loadURDF`)
- **Types:** PascalCase (e.g., `HandLandmark`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `HAND_CONNECTIONS`)

---

## Hook Patterns

### Custom Hooks

```typescript
// src/features/tracking/hooks/useHandTracking.ts

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  options?: UseHandTrackingOptions
) {
  // State
  const [results, setResults] = useState<HandTrackingResult[]>([])
  const [isTracking, setIsTracking] = useState(false)

  // Refs (for non-reactive values)
  const trackerRef = useRef<HandTracker | null>(null)

  // Effects
  useEffect(() => {
    // Initialize
    return () => {
      // Cleanup
    }
  }, [])

  // Return API
  return {
    results,
    isTracking,
    error,
    fps,
  }
}
```

### Hook Rules

1. **Always** clean up resources in return function
2. **Always** check for unmounted state in async operations
3. **Always** use refs for values that don't trigger re-renders
4. **Always** memoize callbacks with `useCallback` if passed to children

---

## Core Logic Patterns

### Pure Functions

Keep business logic in `core/` as pure functions:

```typescript
// src/features/alignment/core/palmAlignment.ts

export function computePalmAlignment(
  humanLandmarks: HandLandmarks,
  robotModel: RobotModel
): Quaternion {
  // Pure function - no side effects
  // Given inputs → deterministic output
  return alignment
}
```

### Class-Based Logic

For stateful logic that doesn't need React:

```typescript
// src/features/tracking/core/handTracker.ts

export class HandTracker {
  private hands: Hands | null = null

  async initialize(): Promise<void> {
    // Setup
  }

  dispose(): void {
    // Cleanup
  }
}
```

---

## Store Patterns (Zustand)

### Slice Pattern

```typescript
// src/features/debug/store/debugSlice.ts

export interface DebugState {
  showAxes: boolean
  showTipTargets: boolean
  selectedJoint: string | null
}

export interface DebugActions {
  setShowAxes: (show: boolean) => void
  setSelectedJoint: (joint: string | null) => void
}

export type DebugSlice = DebugState & DebugActions

export const createDebugSlice = (set: SetState): DebugSlice => ({
  // State
  showAxes: false,
  showTipTargets: false,
  selectedJoint: null,

  // Actions
  setShowAxes: (show) => set({ showAxes: show }),
  setSelectedJoint: (joint) => set({ selectedJoint: joint }),
})
```

### Using Store

```typescript
import { useAppStore } from '@/store/useAppStore'

function MyComponent() {
  const showAxes = useAppStore((state) => state.showAxes)
  const setShowAxes = useAppStore((state) => state.setShowAxes)

  return <button onClick={() => setShowAxes(!showAxes)}>Toggle Axes</button>
}
```

---

## Adding a New Feature

### Step-by-Step Guide

1. **Create directory structure:**
```bash
mkdir -p src/features/my-feature/{components,core,hooks,store}
```

2. **Create AI_CONTEXT.md:**
```bash
touch src/features/my-feature/AI_CONTEXT.md
```
Use template from existing features.

3. **Create types.ts:**
```typescript
// src/features/my-feature/types.ts
export interface MyFeatureConfig {
  enabled: boolean
}
```

4. **Create index.ts (barrel export):**
```typescript
// src/features/my-feature/index.ts
export * from './types'
export { MyComponent } from './components/MyComponent'
```

5. **Update this README.md:**
- Add to "All Features Overview" table
- Add to dependency diagram
- Update feature count

6. **Update PROJECT_OVERVIEW.md:**
- Add to project structure
- Add to "Recent Changes"

7. **Add to global barrel (if public):**
```typescript
// src/components/index.ts
export { MyComponent } from '@/features/my-feature'
```

---

## Modifying an Existing Feature

### Before You Start

1. ✅ Read `AI_CONTEXT.md` in the feature directory
2. ✅ Check feature dependencies (don't break other features!)
3. ✅ Review existing patterns in the feature
4. ✅ Check for TODO comments or known issues

### While Developing

1. ✅ Follow existing file structure
2. ✅ Add types to `types.ts`
3. ✅ Export new items in `index.ts`
4. ✅ Follow naming conventions
5. ✅ Add comments for complex logic

### After Making Changes

1. ✅ Update `AI_CONTEXT.md`:
   - Update "Last Modified" date
   - Add to "Change History"
   - Update "Current Status" %
   - Update "Known Issues" if you fixed/added bugs
   - Update "Next Steps"

2. ✅ Update `PROJECT_OVERVIEW.md`:
   - Add to "Recent Changes"
   - Update milestone % if needed

3. ✅ Update `/AIAgent/ProgressLog/Progress-251022.md`:
   - If milestone progress changed

4. ✅ Test your changes

5. ✅ Commit with clear message:
```bash
git commit -m "feat(feature-name): description + update docs"
```

---

## Testing Features

### Unit Tests
```typescript
// src/features/tracking/core/__tests__/handTracker.test.ts
describe('HandTracker', () => {
  it('initializes successfully', async () => {
    const tracker = new HandTracker()
    await tracker.initialize()
    expect(tracker.isInitialized).toBe(true)
  })
})
```

### Integration Tests
```typescript
// src/features/tracking/__tests__/integration.test.ts
describe('Tracking Integration', () => {
  it('processes video frames', async () => {
    // Test feature integration
  })
})
```

---

## Common Pitfalls

### ❌ Don't Do This

```typescript
// ❌ Circular dependencies
// features/a imports features/b
// features/b imports features/a

// ❌ Direct file imports (bypass barrel exports)
import { Camera } from '@/features/camera/components/CameraView'

// ❌ Mixing concerns (UI logic in core/)
// core/logic.ts has React hooks → WRONG

// ❌ Not cleaning up resources
useEffect(() => {
  const tracker = new HandTracker()
  // Missing cleanup!
}, [])

// ❌ Forgetting to update documentation
// Made changes but didn't update AI_CONTEXT.md
```

### ✅ Do This

```typescript
// ✅ Use barrel exports
import { Camera } from '@/components'

// ✅ Clean separation of concerns
// core/ = pure logic, hooks/ = React integration

// ✅ Always clean up
useEffect(() => {
  const tracker = new HandTracker()
  return () => tracker.dispose() // ✅
}, [])

// ✅ Update documentation after changes
// AI_CONTEXT.md, PROJECT_OVERVIEW.md updated
```

---

## Performance Optimization

### Feature-Level Optimization

1. **Lazy Loading:**
```typescript
// app/page.tsx
const Scene = dynamic(() => import('@/components').then(m => m.Scene), {
  ssr: false // Disable SSR for 3D components
})
```

2. **Memoization:**
```typescript
const Component = memo(MyComponent)
const callback = useCallback(() => {}, [])
const value = useMemo(() => compute(), [])
```

3. **Selective Re-renders:**
```typescript
// Only subscribe to what you need
const showAxes = useAppStore((state) => state.debug.showAxes)
// NOT: const store = useAppStore() // ❌ Re-renders on ANY change
```

---

## File Size Guidelines

- **Component:** <200 lines (split if larger)
- **Hook:** <300 lines
- **Core logic:** <500 lines (split into multiple files)
- **Types:** No limit (but organize logically)

If a file is too large, split it:

```
// Before
core/logic.ts (800 lines)

// After
core/
├── palmAlignment.ts
├── fingerMapping.ts
└── index.ts (re-exports)
```

---

## Questions & Troubleshooting

### How do I know which feature to modify?

1. Identify the functionality (e.g., hand tracking)
2. Find the feature (e.g., `tracking/`)
3. Read `AI_CONTEXT.md` in that feature
4. Modify the feature

### How do features communicate?

Via **Zustand store** (global state management):

```
Feature A → Update Store → Feature B reads from Store
```

### What if I need to share code between features?

Create a shared utility in `src/shared/`:

```typescript
// src/shared/utils/math.ts
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

// Use in any feature
import { clamp } from '@/shared/utils/math'
```

### How do I debug a feature?

1. Check `AI_CONTEXT.md` → "Known Issues"
2. Add console.logs
3. Use browser DevTools
4. Check store state
5. Check dependencies (is another feature broken?)

---

## 🤖 AI Developer Checklist

Before starting work:
- [ ] Read PROJECT_OVERVIEW.md
- [ ] Read src/features/README.md (this file)
- [ ] Read relevant feature AI_CONTEXT.md
- [ ] Check feature dependencies
- [ ] Review existing code patterns

While working:
- [ ] Follow file structure conventions
- [ ] Follow naming conventions
- [ ] Add types to types.ts
- [ ] Export in index.ts
- [ ] Add comments for complex logic
- [ ] Clean up resources in useEffect

After finishing:
- [ ] Update AI_CONTEXT.md (Last Modified, Change History, Status)
- [ ] Update PROJECT_OVERVIEW.md (Recent Changes)
- [ ] Update Progress Log (if milestone affected)
- [ ] Test changes
- [ ] Commit with clear message

---

**Last Updated:** 2025-10-22
**Features Count:** 10 features
**Active Features:** 4 (tracking, camera, urdf, scene)
**In Progress:** 2 (inspector, debug)
**Planned:** 4 (alignment, fingertips, ik, assets)
