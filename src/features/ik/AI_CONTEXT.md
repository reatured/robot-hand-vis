# IK Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(ik): {desc} + update docs`

---

## Metadata
- **Feature:** IK
- **Status:** ❌ Not Started
- **Completion:** 0%
- **Last Modified:** 2025-10-22
- **Milestone:** M5
- **Dependencies:** fingertips (M4), urdf (M2)
- **Used By:** urdf (applies joint angles)

---

## Purpose
Uses CCDIKSolver (Cyclic Coordinate Descent Inverse Kinematics) to drive robot joints toward fingertip targets.

**Input:** 5 fingertip targets (from M4)
**Output:** Joint angles for robot hand

---

## Planned Architecture

```
ik/
├── AI_CONTEXT.md
├── types.ts
├── core/
│   └── ccdik.ts              ← IK solver setup
├── hooks/
│   └── useIKSolver.ts        ← React integration
└── store/
    └── ikSlice.ts            ← IK state
```

---

## Requirements (From MainPlan M5)

### CCDIKSolver Setup

**Goal:** Configure CCDIKSolver for 5-finger robot hand

**CCDIKSolver:** Built into Three.js examples
```typescript
import { CCDIKSolver } from 'three/examples/jsm/animation/CCDIKSolver'
```

### IK Chain Structure

```typescript
interface IKChain {
  fingerName: string
  effector: number        // Tip bone index
  target: Object3D        // Target position object
  links: {
    index: number         // Bone index
    limitation?: {
      min?: Vector3       // Joint angle limits (from URDF)
      max?: Vector3
    }
  }[]
}
```

**5 Independent Chains:**
1. Thumb chain (wrist → CMC → MCP → IP → tip)
2. Index chain (wrist → MCP → PIP → DIP → tip)
3. Middle chain
4. Ring chain
5. Pinky chain

---

## Implementation Plan

### Phase 1: Build IK Chains (4 hours)

```typescript
// core/ccdik.ts
function buildIKChains(
  robotModel: RobotModel,
  fingerTargets: FingerTarget[]
): IKChain[] {
  const chains: IKChain[] = []

  fingerTargets.forEach(target => {
    const chain = extractChainFromURDF(robotModel, target.fingerName)
    const links = chain.joints.map(joint => ({
      index: joint.index,
      limitation: {
        min: new Vector3(...joint.limits.min),
        max: new Vector3(...joint.limits.max),
      }
    }))

    chains.push({
      fingerName: target.fingerName,
      effector: chain.tipBoneIndex,
      target: createTargetObject(target.position),
      links,
    })
  })

  return chains
}
```

### Phase 2: Initialize CCDIKSolver (2 hours)

```typescript
function initializeIKSolver(
  skeleton: THREE.Skeleton,
  chains: IKChain[]
): CCDIKSolver {
  const ikData = {
    target: chains[0].target,  // Will be updated per chain
    effector: chains[0].effector,
    links: chains[0].links,
    iteration: 10,
    minAngle: 0.0,
    maxAngle: 1.0,
  }

  const solver = new CCDIKSolver(skeleton, [ikData])
  return solver
}
```

### Phase 3: Multi-Finger IK (3 hours)

**Problem:** CCDIKSolver handles one target at a time

**Solution:** Iteratively solve each finger

```typescript
function solveMultiFingerIK(
  solver: CCDIKSolver,
  chains: IKChain[],
  iterations: number
): void {
  for (let i = 0; i < iterations; i++) {
    chains.forEach(chain => {
      // Update solver for this finger
      solver.iks[0].target = chain.target
      solver.iks[0].effector = chain.effector
      solver.iks[0].links = chain.links

      // Solve
      solver.update()
    })
  }
}
```

### Phase 4: Frame Loop Integration (2 hours)

```typescript
// hooks/useIKSolver.ts
export function useIKSolver(robotRef: Ref<RobotModel>) {
  const ikEnabled = useAppStore(state => state.ik.enabled)
  const targets = useAppStore(state => state.fingertips.targets)
  const iterations = useAppStore(state => state.ik.iterations)

  const solverRef = useRef<CCDIKSolver | null>(null)

  useFrame(() => {
    if (!ikEnabled || !solverRef.current) return

    solveMultiFingerIK(solverRef.current, chains, iterations)
  })
}
```

---

## Types to Define

```typescript
// types.ts
export interface IKState {
  enabled: boolean
  iterations: number        // 1-32
  damping: number          // 0-1
  perFingerEnabled: {
    thumb: boolean
    index: boolean
    middle: boolean
    ring: boolean
    pinky: boolean
  }
}

export interface IKChain {
  fingerName: string
  effector: number
  target: Object3D
  links: IKLink[]
}

export interface IKLink {
  index: number
  limitation?: {
    min?: Vector3
    max?: Vector3
  }
}

export interface IKConstraints {
  iterations: number
  damping: number
  minAngle: number
  maxAngle: number
}
```

---

## Joint Constraints

### Extract from URDF

```typescript
function extractJointLimits(joint: URDFJoint): {
  min: Vector3
  max: Vector3
} {
  // URDF provides limits per joint
  return {
    min: new Vector3(joint.limit.lower, joint.limit.lower, joint.limit.lower),
    max: new Vector3(joint.limit.upper, joint.limit.upper, joint.limit.upper),
  }
}
```

### Apply During Solving

CCDIKSolver automatically clamps angles to `limitation` bounds

---

## Convergence & Stability

### Adaptive Iterations

```typescript
function computeAdaptiveIterations(error: number): number {
  if (error < 0.001) return 5   // Close to target
  if (error < 0.01) return 10   // Medium distance
  return 20                      // Far from target
}
```

### Damping

Reduces oscillation:
```typescript
const dampingFactor = 0.5  // 0 = no damping, 1 = full damping
joint.angle = previousAngle + (newAngle - previousAngle) * (1 - dampingFactor)
```

### Unreachable Targets

```typescript
function projectToReachableSpace(
  target: Vector3,
  chainLength: number
): Vector3 {
  if (target.length() > chainLength) {
    // Clamp to maximum reach
    return target.normalize().multiplyScalar(chainLength * 0.95)
  }
  return target
}
```

---

## Testing Plan

### Single Finger Test (M5.2)
1. Disable all fingers except index
2. Move index fingertip target
3. Verify joints update correctly
4. Check joint limits respected
5. Measure IK error

### Multi-Finger Test (M5.3)
1. Enable all 5 fingers
2. Test various hand poses
3. Verify no conflicts between chains
4. Check performance (FPS > 30)

### Edge Cases
- Unreachable targets (too far)
- Gimbal lock situations
- Extreme joint angles
- Fast target movements

### Success Criteria
- IK converges in <20 iterations
- Error <1cm per fingertip
- FPS maintains >30
- No joint limit violations

---

## Performance Optimization

### Current Bottleneck
IK solving is most expensive operation (~10-20ms per frame)

### Optimizations

1. **Adaptive Iterations:**
   - Reduce iterations when close to target
   - Increase when far

2. **Per-Finger Toggle:**
   - Disable unused fingers
   - Skip solving if target unchanged

3. **Update Rate:**
   - Solve IK at 30Hz instead of 60Hz
   - Interpolate between solutions

4. **Early Termination:**
   - Stop if error below threshold

---

## Known Challenges

### 1. Chain Extraction from URDF
- Must traverse URDF joint tree correctly
- Find path: wrist → finger tip
- Validate chain continuity

### 2. Target Conflicts
- Multiple fingers may share base joints
- Solving one affects others
- Need iterative refinement

### 3. Joint Limits
- URDF limits must be applied correctly
- Solver may violate limits if not set properly

**Mitigation:**
- Extract limits carefully from URDF
- Test each chain independently first
- Add debug visualization for limits

---

## Dependencies

### Required Features
- `fingertips` (M4) - Provides targets
- `urdf` (M2) - Provides robot model, joints, skeleton

### Required Packages
- `three/examples/jsm/animation/CCDIKSolver` - IK solver
- Already available in Three.js ✅

---

## AI Guidelines

- Start with single finger (index) before multi-finger
- Visualize joint rotations during development
- Log IK error each frame (convergence metric)
- Test with static targets before moving targets
- Profile performance (IK is expensive)

---

## References

- MainPlan: Section 4 (Phase 4)
- CCDIKSolver docs: Three.js examples
- CCD algorithm: https://en.wikipedia.org/wiki/Inverse_kinematics#Cyclic_Coordinate_Descent
- URDF joints: http://wiki.ros.org/urdf/XML/joint

---

**Status:** ❌ Not Started
**Estimated Time:** 11-15 hours
**Depends On:** M4 (fingertips) complete
**Next Action:** After fingertips → Build chains → Test single finger → Multi-finger
