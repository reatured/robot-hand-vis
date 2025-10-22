# Fingertips Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(fingertips): {desc} + update docs`

---

## Metadata
- **Feature:** Fingertips
- **Status:** ❌ Not Started
- **Completion:** 0%
- **Last Modified:** 2025-10-22
- **Milestone:** M4
- **Dependencies:** alignment (M3)
- **Used By:** ik (M5), debug

---

## Purpose
Maps human fingertip poses (position + rotation) to robot fingertip target poses for IK solver.

**Outputs:** 5 target poses (one per finger)

---

## Planned Architecture

```
fingertips/
├── AI_CONTEXT.md
├── types.ts
├── core/
│   └── fingertipMapping.ts    ← Pose estimation
└── components/
    └── TipTargets.tsx         ← Visual debug (spheres)
```

---

## Requirements (From MainPlan M4)

### Fingertip Pose Estimation

**Goal:** Extract 6DOF pose (position + rotation) for each fingertip

**Input:** HandLandmarks from tracking feature
**Output:** 5 FingerTarget objects

```typescript
interface FingerTarget {
  fingerName: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'
  position: Vector3      // World space
  rotation: Quaternion   // Estimated from adjacent joints
  confidence: number     // Tracking confidence
}
```

### Algorithm

1. **Extract Tip Positions:**
   - Thumb: landmark[4]
   - Index: landmark[8]
   - Middle: landmark[12]
   - Ring: landmark[16]
   - Pinky: landmark[20]

2. **Estimate Tip Rotations:**
   - Use vectors between adjacent joints
   - Finger direction: tip - DIP joint
   - Cross with palm normal for full orientation
   - Convert to quaternion

3. **Transform to Robot Frame:**
   - Apply alignment quaternion from M3
   - Apply scale offset (human hand size → robot hand size)
   - Apply per-finger offsets from mapping config

### Coordinate Transformation

```typescript
function transformToRobotFrame(
  humanTipPose: Pose3D,
  alignmentQuat: Quaternion,
  scaleRatio: number
): Pose3D {
  // Apply alignment
  const rotated = humanTipPose.position.applyQuaternion(alignmentQuat)

  // Scale to robot size
  const scaled = rotated.multiplyScalar(scaleRatio)

  // Rotation: combine human rotation with alignment
  const finalRotation = alignmentQuat.multiply(humanTipPose.rotation)

  return { position: scaled, rotation: finalRotation }
}
```

---

## Types to Define

```typescript
// types.ts
export interface FingerTarget {
  fingerName: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'
  position: Vector3
  rotation: Quaternion
  confidence: number
}

export interface FingertipMappingConfig {
  scaleRatio: number  // Human size → robot size
  offsets: {
    thumb: Vector3
    index: Vector3
    middle: Vector3
    ring: Vector3
    pinky: Vector3
  }
}

export interface FingertipState {
  targets: FingerTarget[]
  enabled: boolean
  config: FingertipMappingConfig
}
```

---

## Implementation Plan

### Phase 1: Tip Extraction (2 hours)

```typescript
// core/fingertipMapping.ts
function extractTipPositions(landmarks: HandLandmarks): Vector3[] {
  const indices = [4, 8, 12, 16, 20]  // Tip landmark indices
  return indices.map(i => new Vector3(
    landmarks[i].x,
    landmarks[i].y,
    landmarks[i].z
  ))
}
```

### Phase 2: Rotation Estimation (3 hours)

```typescript
function estimateTipRotation(
  tipLandmark: HandLandmark,
  dipLandmark: HandLandmark,  // Distal interphalangeal
  palmNormal: Vector3
): Quaternion {
  // Finger direction
  const fingerDir = new Vector3().subVectors(
    tipPos, dipPos
  ).normalize()

  // Cross with palm normal for full basis
  const cross = new Vector3().crossVectors(fingerDir, palmNormal)

  // Build rotation matrix
  const matrix = new Matrix4().makeBasis(fingerDir, cross, palmNormal)

  // Convert to quaternion
  return new Quaternion().setFromRotationMatrix(matrix)
}
```

### Phase 3: Target Objects (2 hours)

```typescript
// components/TipTargets.tsx
export function TipTargets() {
  const targets = useAppStore(state => state.fingertips.targets)

  return (
    <group>
      {targets.map((target, i) => (
        <mesh key={i} position={target.position.toArray()}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={FINGER_COLORS[i]} />
        </mesh>
      ))}
    </group>
  )
}
```

---

## Visualization

### Debug Display
- 5 colored spheres at target positions
- Connection lines (robot tip → target)
- Color-code by finger:
  - Thumb: Red
  - Index: Yellow
  - Middle: Green
  - Ring: Blue
  - Pinky: Purple

### Toggle
- Controlled from Debug tab
- `showTipTargets` flag

---

## Testing Plan

1. **Unit Tests:**
   - Tip extraction from landmarks
   - Rotation estimation
   - Coordinate transformation

2. **Manual Tests:**
   - Static poses (verify positions match)
   - Finger curling (verify rotations update)
   - Scale adjustment (human → robot size)

3. **Success Criteria:**
   - Targets within 1cm of human fingertips
   - Rotations align with finger direction
   - Real-time updates (<50ms latency)

---

## Known Challenges

### Rotation Estimation
- Fingertips have no direct rotation in MediaPipe
- Must estimate from adjacent joints
- May be unstable for highly curled fingers

**Mitigation:**
- Use multiple joints (DIP, PIP) for stability
- Fallback to palm normal if degenerate
- Apply temporal smoothing

### Scale Calibration
- Human hands vary in size
- Robot hands vary in size
- Need calibration process

**Solution:**
- Measure human hand span (thumb to pinky spread)
- Measure robot hand span from URDF
- Compute scale ratio automatically

---

## Dependencies

### Required Features
- `alignment` (M3) - Provides alignment quaternion
- `tracking` (M1) - Provides landmarks

### Required Packages
- `three` - Vector3, Quaternion, Matrix4
- Already installed ✅

---

## AI Guidelines

- Test rotation estimation thoroughly (most complex part)
- Visualize targets early (spheres help debug)
- Apply same filtering as tracking (smoothness)
- Handle missing/occluded fingers gracefully
- Log scale ratios for debugging

---

## References

- MainPlan: Section 3 (Phase 3)
- MediaPipe hand landmarks: https://google.github.io/mediapipe/solutions/hands.html
- Quaternion from basis: Three.js docs

---

**Status:** ❌ Not Started
**Estimated Time:** 7-9 hours
**Depends On:** M3 (alignment) complete
**Next Action:** After alignment works → Implement extraction → Test targets
