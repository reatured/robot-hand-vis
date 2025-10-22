# Robot Hand Visualization - Project Overview

## 🤖 AI DEVELOPER: READ THIS FIRST

**This file provides complete project context. Always read this before starting work on any feature.**

### After Modifying This Project, AI Must:
1. ✅ Update this file's "Last Updated" date below
2. ✅ Update "Current Status" section with new completion %
3. ✅ Update relevant feature `AI_CONTEXT.md` files
4. ✅ Update `/AIAgent/ProgressLog/Progress-251022.md` if milestones affected
5. ✅ Add entry to "Recent Changes" section below
6. ✅ Commit with message format: `feat(scope): description + update docs`

---

## Metadata
- **Project:** Robot Hand Visualization (AR Hand-Controlled Robot)
- **Version:** 2.0.0
- **Last Updated:** 2025-10-22
- **Current Status:** 35% Complete (Phase 1 in progress)
- **Active Milestone:** M1 (Camera + MediaPipe) - 90% | M2 (URDF Loading) - 85%

---

## Recent Changes
### 2025-10-22
- ✅ Created comprehensive AI documentation system
- ✅ Added PROJECT_OVERVIEW.md and AI_CONTEXT.md files
- ✅ Documented all 11 features with context and guidelines
- 🚧 Build errors: STLLoader import, global.css (needs fixing)
- 🚧 State management: Zustand store not yet implemented (critical blocker)

### 2025-10-22 (Earlier)
- ✅ Implemented feature-based architecture (11 features)
- ✅ Completed tracking system (MediaPipe Hands integration, 90%)
- ✅ Completed URDF loading system (85%, pending STLLoader fix)
- ✅ Completed 3D scene setup (100%)
- ✅ Created barrel export system for clean imports
- ✅ 22 TypeScript files, ~1,500 lines of production code

---

## Project Purpose

Build an **AR hand-gesture-controlled robot hand visualization** that:

1. 📹 **Captures webcam video** of user's hand
2. 👋 **Tracks hand landmarks** using MediaPipe Hands (21 points per hand)
3. 🤖 **Loads 3D robot hand models** from URDF files
4. 🔄 **Aligns robot wrist** to human hand orientation (palm plane matching)
5. 🎯 **Maps human fingertips** to robot fingertip targets
6. 🦾 **Drives robot joints** using IK solver (CCDIKSolver) to match human pose
7. 🎨 **Visualizes everything** in real-time 3D (React Three Fiber)

**End Result:** User moves their hand → Robot hand mirrors movements in 3D

---

## Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Next.js** | 14.0.4 | React framework with SSR |
| **TypeScript** | 5.9.3 | Type safety |
| **Zustand** | 5.0.8 | State management (pending implementation) |

### 3D Graphics
| Technology | Version | Purpose |
|------------|---------|---------|
| **Three.js** | 0.160.0 | WebGL 3D library |
| **@react-three/fiber** | 8.15.12 | React renderer for Three.js |
| **@react-three/drei** | 9.92.7 | Three.js helpers (OrbitControls, Grid) |
| **three-stdlib** | 2.28.9 | Three.js utilities (STLLoader, etc.) |

### Hand Tracking
| Technology | Version | Purpose |
|------------|---------|---------|
| **@mediapipe/hands** | 0.4.1675469240 | Hand landmark detection |
| **@mediapipe/tasks-vision** | 0.10.22 | Vision tasks API |

### Robot Models
| Technology | Version | Purpose |
|------------|---------|---------|
| **urdf-loader** | 0.12.6 | Load robot URDF files |
| **CCDIKSolver** | (Three.js) | Inverse kinematics (planned) |

### Development Tools
- **TailwindCSS** 3.4.0 - Styling
- **ESLint** 8.56.0 - Linting
- **Prettier** 3.1.1 - Code formatting

---

## Architecture Overview

### Feature-Based Architecture

```
src/features/
├── tracking/        ✅ MediaPipe hand tracking (90% - M1)
├── camera/          ✅ Webcam video capture (100% - M1)
├── urdf/            ✅ Robot model loading (85% - M2)
├── scene/           ✅ 3D scene setup (100% - Core)
├── inspector/       🚧 UI control panel (15% - M6)
├── debug/           🚧 Debug visualization (20% - M6)
├── alignment/       ❌ Palm alignment (0% - M3)
├── fingertips/      ❌ Fingertip mapping (0% - M4)
├── ik/              ❌ IK solver (0% - M5)
└── assets/          ❌ Asset management (10% - M7)
```

Each feature is self-contained with:
- `types.ts` - TypeScript interfaces
- `components/` - React components
- `core/` - Business logic
- `hooks/` - React hooks
- `store/` - Zustand state slices
- `AI_CONTEXT.md` - **AI development guide (YOU SHOULD READ THIS)**
- `index.ts` - Public exports

### Data Flow

```
Camera Video Feed
    ↓
MediaPipe Hands (tracking/)
    ↓
Hand Landmarks [21 points × 2 hands]
    ↓
Zustand Store (store/) ← [NOT YET IMPLEMENTED]
    ↓
    ├─→ Palm Alignment (alignment/) → Wrist Quaternion
    ├─→ Fingertip Mapping (fingertips/) → 5 Target Poses
    └─→ IK Solver (ik/) → Joint Angles
         ↓
    URDF Robot Model (urdf/)
         ↓
    3D Scene Rendering (scene/)
         ↓
    User sees robot hand mirroring their hand
```

---

## Project Structure

```
robot-hand-vis/
├── PROJECT_OVERVIEW.md           ← 🤖 YOU ARE HERE - AI start here
├── package.json                  ← Dependencies
├── tsconfig.json                 ← TypeScript config
├── next.config.js                ← Next.js config
├── tailwind.config.js            ← Tailwind config
│
├── AIAgent/                      ← AI planning documents
│   ├── Todo/
│   │   └── MainPlan-251022.md   ← Master implementation plan (8 phases)
│   └── ProgressLog/
│       └── Progress-251022.md   ← Detailed progress tracking
│
├── app/                          ← Next.js app directory
│   ├── layout.jsx               ← App layout (⚠️ has global.css import error)
│   ├── page.jsx                 ← ⚠️ Duplicate - should be deleted
│   └── page.tsx                 ← Main page ✅
│
├── public/
│   └── assets/
│       └── robots/
│           └── hands/           ← URDF robot models (8 hands available)
│
└── src/
    ├── components/
    │   └── index.ts             ← Barrel exports (public API)
    │
    ├── features/                ← Feature modules (11 features)
    │   ├── README.md            ← Feature architecture guide
    │   │
    │   ├── tracking/            ← ✅ Hand tracking (90% complete)
    │   │   ├── AI_CONTEXT.md   ← 🤖 Read before modifying!
    │   │   ├── types.ts
    │   │   ├── core/
    │   │   │   └── handTracker.ts        (179 lines)
    │   │   ├── hooks/
    │   │   │   └── useHandTracking.ts    (171 lines)
    │   │   ├── components/
    │   │   │   └── LandmarkOverlay.tsx   (163 lines)
    │   │   └── index.ts
    │   │
    │   ├── camera/              ← ✅ Camera capture (100% complete)
    │   │   ├── AI_CONTEXT.md
    │   │   ├── types.ts
    │   │   ├── components/
    │   │   │   └── CameraView.tsx        (97 lines)
    │   │   └── index.ts
    │   │
    │   ├── urdf/                ← ✅ Robot loading (85% complete)
    │   │   ├── AI_CONTEXT.md
    │   │   ├── types.ts
    │   │   ├── core/
    │   │   │   └── loader.ts             (153 lines) ⚠️ STLLoader import error
    │   │   ├── components/
    │   │   │   └── RobotHand.tsx         (138 lines)
    │   │   └── index.ts
    │   │
    │   ├── scene/               ← ✅ 3D scene (100% complete)
    │   │   ├── AI_CONTEXT.md
    │   │   └── components/
    │   │       ├── SceneCanvas.tsx       (35 lines)
    │   │       └── RobotScene.tsx        (49 lines)
    │   │
    │   ├── inspector/           ← 🚧 UI panels (15% complete)
    │   │   ├── AI_CONTEXT.md
    │   │   ├── components/
    │   │   │   ├── Inspector.tsx
    │   │   │   └── JointsTab.tsx
    │   │   └── styles.css
    │   │
    │   ├── debug/               ← 🚧 Debug viz (20% complete)
    │   │   ├── AI_CONTEXT.md
    │   │   ├── types.ts
    │   │   ├── components/
    │   │   │   └── DebugAxes.tsx
    │   │   └── store/
    │   │       └── debugSlice.ts
    │   │
    │   ├── alignment/           ← ❌ Palm alignment (0% - M3)
    │   │   ├── AI_CONTEXT.md
    │   │   ├── types.ts         ← Empty placeholder
    │   │   ├── components/      ← Empty
    │   │   ├── core/            ← Empty
    │   │   └── store/           ← Empty
    │   │
    │   ├── fingertips/          ← ❌ Fingertip mapping (0% - M4)
    │   │   ├── AI_CONTEXT.md
    │   │   ├── types.ts
    │   │   ├── components/
    │   │   └── core/
    │   │
    │   ├── ik/                  ← ❌ IK solver (0% - M5)
    │   │   ├── AI_CONTEXT.md
    │   │   ├── types.ts
    │   │   ├── core/
    │   │   ├── hooks/
    │   │   └── store/
    │   │
    │   └── assets/              ← ❌ Asset management (10% - M7)
    │       ├── AI_CONTEXT.md
    │       ├── types.ts
    │       ├── core/
    │       └── hooks/
    │
    ├── store/                   ← ❌ CRITICAL: Zustand store NOT CREATED
    │   ├── useAppStore.ts       ← Needs implementation
    │   ├── types.ts             ← Needs implementation
    │   └── selectors.ts         ← Needs implementation
    │
    ├── shared/                  ← Shared utilities (not created)
    │   ├── components/          ← UI components (Button, Slider, etc.)
    │   ├── hooks/
    │   └── utils/
    │
    └── config/
        └── .gitkeep
```

---

## Current Status: 35% Complete

### Milestone Progress

| Milestone | Status | % | Description | Dependencies |
|-----------|--------|---|-------------|--------------|
| **M1** | 🟢 In Progress | 90% | Camera + MediaPipe + Overlay | - |
| **M2** | 🟡 Blocked | 85% | URDF Loading | Fix STLLoader |
| **M3** | 🔴 Not Started | 0% | Palm Alignment | M1, M2 complete |
| **M4** | 🔴 Not Started | 0% | Fingertip Targets | M3 complete |
| **M5** | 🔴 Not Started | 0% | IK Integration | M4 complete |
| **M6** | 🟡 Structure Only | 10% | Debug + Inspector UI | M5 complete |
| **M7** | 🟡 Assets Exist | 10% | Asset Management | - |
| **M8** | 🟡 Partial | 15% | Stability & Polish | M1-M7 complete |

### What's Working
✅ Camera feed displays with live video
✅ MediaPipe tracking implementation complete (needs testing)
✅ Landmark overlay component complete (needs testing)
✅ URDF loader implemented (6 robot models supported)
✅ 3D scene renders with lighting and grid
✅ Feature-based architecture established

### What's Blocking
🔴 **CRITICAL:** Zustand store not implemented → Can't wire features together
🔴 **Build Error:** STLLoader import fails (`three/examples/jsm/loaders/STLLoader` → should be `three-stdlib`)
🔴 **Build Error:** Missing global.css
🔴 **Warning:** Duplicate page files (page.jsx + page.tsx)

### What's Next
1. Fix build errors (30 min)
2. Implement Zustand store (2-3 hours)
3. Wire features together (2-3 hours)
4. Test E2E integration (1 hour)
5. Begin M3 - Palm Alignment (4-6 hours)

---

## How to Navigate This Codebase (AI Guide)

### 1. Starting a New Task

**Always follow this sequence:**

```
1. Read this PROJECT_OVERVIEW.md (you are here)
   ↓
2. Read /AIAgent/Todo/MainPlan-251022.md
   (Understand the overall plan and milestones)
   ↓
3. Read /AIAgent/ProgressLog/Progress-251022.md
   (Know what's done, what's blocked, what's next)
   ↓
4. Read /src/features/README.md
   (Understand feature architecture)
   ↓
5. Read AI_CONTEXT.md for relevant feature(s)
   (Feature-specific context and guidelines)
   ↓
6. Read the actual code
   ↓
7. Make changes
   ↓
8. UPDATE ALL DOCUMENTATION (AI_CONTEXT.md, this file, Progress Log)
```

### 2. Understanding a Feature

Each feature has `AI_CONTEXT.md` with:
- **Purpose** - What it does
- **Status** - Implementation progress
- **Architecture** - How it works
- **Key Files** - What each file does
- **Usage Examples** - How to use it
- **Known Issues** - Current bugs
- **AI Guidelines** - Patterns, gotchas, style

**Example:** To modify tracking feature:
```
src/features/tracking/AI_CONTEXT.md → Read this first!
```

### 3. Making Changes

**Before coding:**
- ✅ Read feature's AI_CONTEXT.md
- ✅ Check dependencies (what it depends on)
- ✅ Check dependents (what depends on it)
- ✅ Review existing patterns in the code

**While coding:**
- ✅ Follow TypeScript patterns
- ✅ Add types to types.ts
- ✅ Export in index.ts (barrel exports)
- ✅ Follow existing naming conventions

**After coding:**
- ✅ Update feature's AI_CONTEXT.md (change history, status, files)
- ✅ Update this PROJECT_OVERVIEW.md (recent changes, status)
- ✅ Update Progress Log if milestone affected
- ✅ Test your changes
- ✅ Commit with clear message

### 4. Common Tasks

#### Adding a New Component
```typescript
// 1. Create component in feature/components/
src/features/{feature}/components/MyComponent.tsx

// 2. Export in feature index
src/features/{feature}/index.ts
export { MyComponent } from './components/MyComponent'

// 3. Export in global barrel (if public API)
src/components/index.ts
export { MyComponent } from '@/features/{feature}'

// 4. Update AI_CONTEXT.md in feature folder
```

#### Adding a New Feature
```
1. Create directory structure:
   src/features/my-feature/
   ├── AI_CONTEXT.md
   ├── types.ts
   ├── components/
   ├── core/
   ├── hooks/
   ├── store/
   └── index.ts

2. Update src/features/README.md with new feature
3. Update this PROJECT_OVERVIEW.md
4. Update MainPlan if needed
```

#### Fixing a Bug
```
1. Identify feature (e.g., tracking)
2. Read src/features/tracking/AI_CONTEXT.md
3. Check "Known Issues" section
4. Fix the bug
5. Update AI_CONTEXT.md:
   - Mark issue as fixed in "Known Issues"
   - Add to "Change History"
   - Update "Last Modified"
6. Test the fix
7. Commit
```

---

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

### Dev Server
- Uses Next.js hot reload
- 3D scene rendered client-side only (SSR disabled)
- Camera requires HTTPS or localhost

### Project Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run analyze  # Analyze bundle size
```

### Code Style
- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier (3.1.1)
- **Linting:** ESLint (8.56.0)
- **Naming:**
  - Components: PascalCase (e.g., `CameraView`)
  - Files: PascalCase for components, camelCase for utilities
  - Hooks: `use` prefix (e.g., `useHandTracking`)
  - Types: PascalCase (e.g., `HandLandmark`)

---

## Key Concepts

### 1. Hand Tracking
- **MediaPipe Hands** detects 21 landmarks per hand
- Landmarks are normalized [0,1] coordinates
- 3D depth (z) is relative to wrist
- **EMA filtering** smooths jittery tracking
- **FPS monitoring** tracks performance

### 2. URDF Models
- **URDF** = Unified Robot Description Format (XML)
- Describes robot joints, links, meshes
- **urdf-loader** parses URDF → Three.js Group
- Supports STL, OBJ, DAE mesh formats
- 8 robot hands available in `public/assets/robots/hands/`

### 3. Inverse Kinematics (IK)
- **Goal:** Given target position → calculate joint angles
- **CCDIKSolver:** Cyclic Coordinate Descent algorithm
- Iterative solver with constraints
- 5 independent chains (one per finger)

### 4. Palm Alignment
- **Goal:** Align robot wrist to human hand orientation
- Calculate palm plane from 3 points (wrist, index, pinky)
- Compute normal vectors (cross product)
- Build rotation quaternion
- Apply to robot wrist

### 5. Feature Architecture
- **Self-contained:** Each feature is independent
- **Types:** All types in `types.ts`
- **Exports:** Public API in `index.ts`
- **State:** Zustand slices in `store/`
- **Barrel exports:** Clean imports via `@/components`

---

## Available Robot Models

Located in `public/assets/robots/hands/`:

1. **DClaw Gripper** - 3-finger robotic gripper
2. **Schunk SVH Hand** - 5-finger anthropomorphic
3. **Shadow Hand** - Advanced dexterous hand
4. **Barrett Hand** - Industrial gripper
5. **Allegro Hand** - Research platform
6. **Inspire Hand** - Prosthetic design
7. **Leap Hand** - Low-cost dexterous
8. **Ability Hand** - Prosthetic hand

**Note:** Code references Linker L10/L20 models which may not exist. Verify assets before using.

---

## Known Issues & Blockers

### 🔴 Critical (Blocking Progress)

#### 1. STLLoader Import Error
**File:** `src/features/urdf/core/loader.ts:10`
**Error:** `Attempted import error: 'STLLoader' is not exported from 'three'`
**Fix:**
```typescript
// Current (WRONG):
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

// Should be:
import { STLLoader } from 'three-stdlib'
```
**Impact:** URDF models cannot load → M2 blocked
**Priority:** HIGH - Fix immediately

#### 2. Missing global.css
**File:** `app/layout.jsx:2`
**Error:** `Module not found: Can't resolve '@/global.css'`
**Fix:** Create global.css or update import path
**Impact:** App fails to load
**Priority:** HIGH

#### 3. No State Management
**Missing:** `src/store/useAppStore.ts`
**Impact:**
- Features cannot communicate
- Tracking results cannot flow to 3D scene
- Inspector UI has no data
**Priority:** CRITICAL - Must implement before M3

### ⚠️ Warnings

#### 4. Duplicate Page Files
**Files:** `app/page.jsx` and `app/page.tsx`
**Fix:** Delete `page.jsx`, keep `page.tsx`
**Impact:** Routing confusion
**Priority:** MEDIUM

---

## Testing Strategy

### Current Testing Status
- ❌ No unit tests
- ❌ No integration tests
- ❌ No E2E tests
- ⏸️ Manual testing blocked by build errors

### Planned Testing
- **Unit Tests:** Each feature's core logic
- **Integration Tests:** Feature interactions via store
- **E2E Tests:** Full camera → tracking → IK → rendering flow
- **Manual Testing:** Browser-based with real hands

### Testing Checklist (After Build Errors Fixed)
- [ ] Camera feed displays
- [ ] Hand landmarks detected
- [ ] Overlay renders on video
- [ ] URDF model loads
- [ ] 3D scene renders
- [ ] FPS > 30fps
- [ ] No console errors

---

## Performance Considerations

### Current Optimizations
- ✅ Animation frame loop (not setInterval)
- ✅ EMA filtering reduces noise
- ✅ Dynamic imports (SSR disabled for 3D)
- ✅ Lazy loading for components

### Known Bottlenecks
- ⏸️ MediaPipe processing (needs profiling)
- ⏸️ IK solver iterations (not yet implemented)
- ⏸️ URDF mesh complexity (needs testing)

### Target Performance
- **FPS:** >30fps for smooth animation
- **Tracking Latency:** <50ms
- **IK Convergence:** <20 iterations

---

## Deployment

### Build Command
```bash
npm run build
```

### Production Checklist
- [ ] All build errors fixed
- [ ] TypeScript compiles without errors
- [ ] All features tested
- [ ] Performance optimized
- [ ] Assets optimized
- [ ] Error handling complete
- [ ] Browser compatibility tested

### Browser Support
- ✅ Chrome (tested)
- ✅ Arc (tested)
- ⏸️ Firefox (not tested)
- ⏸️ Safari (not tested)

**Requirements:**
- WebRTC (getUserMedia) support
- WebGL 2.0 support
- Modern JavaScript (ES2020+)

---

## Troubleshooting

### Build Fails
1. Check Node version (>=14 required)
2. Delete `.next` folder
3. Run `npm install` again
4. Check for syntax errors

### Camera Not Working
1. Check HTTPS or localhost
2. Check browser permissions
3. Check MediaPipe CDN loading
4. Check console for errors

### 3D Scene Not Rendering
1. Check WebGL support
2. Check console for Three.js errors
3. Check dynamic imports (SSR disabled)
4. Check browser compatibility

### URDF Model Not Loading
1. Fix STLLoader import first
2. Check URDF file path
3. Check mesh file paths
4. Check console for loader errors

---

## Resources & References

### Documentation
- Main Plan: `/AIAgent/Todo/MainPlan-251022.md`
- Progress Log: `/AIAgent/ProgressLog/Progress-251022.md`
- Feature Guides: `/src/features/{feature}/AI_CONTEXT.md`

### External Docs
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js](https://threejs.org/docs/)
- [urdf-loader](https://github.com/gkjohnson/urdf-loaders)
- [Zustand](https://docs.pmnd.rs/zustand/)

### Related Projects
- [robot-visualization](https://github.com/gkjohnson/robot-visualization) - URDF viewer
- [mediapipe-hands-react](https://github.com/mdn/mediapipe-samples) - MediaPipe examples

---

## Contact & Contributions

### For AI Developers
- Read ALL documentation before coding
- Follow existing patterns
- Update documentation after changes
- Test your changes
- Commit with clear messages

### For Human Developers
- This project uses AI-assisted development
- AI documentation is in AI_CONTEXT.md files
- Progress tracked in `/AIAgent/` folder
- Feature-based architecture for scalability

---

## 🤖 POST-MODIFICATION CHECKLIST FOR AI

After making ANY changes to this project:

- [ ] Updated "Last Updated" date at top
- [ ] Added entry to "Recent Changes" section
- [ ] Updated "Current Status" percentage
- [ ] Updated relevant milestone progress
- [ ] Updated "Known Issues" if bugs fixed/added
- [ ] Updated feature AI_CONTEXT.md files
- [ ] Updated Progress Log if needed
- [ ] Tested changes (if possible)
- [ ] Committed with format: `feat(scope): description + update docs`

**Remember:** Documentation is code. Keep it current!

---

**Last Updated:** 2025-10-22
**Next Review:** After fixing build errors and implementing state management
**Status:** 🟡 Active Development - Phase 1 (35% complete)
