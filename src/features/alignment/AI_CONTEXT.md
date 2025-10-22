# Alignment Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(alignment): {desc} + update docs`

---

## Metadata
- **Feature:** Alignment
- **Status:** ❌ Not Started
- **Completion:** 0%
- **Last Modified:** 2025-10-22
- **Milestone:** M3
- **Dependencies:** tracking (M1), urdf (M2)
- **Used By:** fingertips (M4), debug

---

## Purpose
Aligns robot wrist orientation to match human hand orientation using palm plane mathematics.

**Algorithm:** Compute quaternion from palm plane normal vectors

---

## Planned Architecture

```
alignment/
├── AI_CONTEXT.md              ← You are here
├── types.ts                   ← Alignment types
├── core/
│   └── palmAlignment.ts       ← Main algorithm
├── components/
│   └── AlignmentGizmo.tsx     ← Visual debug helper
└── store/
    └── alignmentSlice.ts      ← Zustand state
```

---

## Requirements (From MainPlan M3)

### Palm Plane Mathematics

**Goal:** Compute rotation quaternion to align robot wrist to human hand

**Steps:**

1. **Calculate Human Palm Plane:**
   - Use 3 points: Wrist, Index Root, Pinky Root
   - Compute vectors: v1 = Index - Wrist, v2 = Pinky - Wrist
   - Normal = cross(v1, v2)
   - Build basis matrix M_h = [x_h, y_h, z_h]

2. **Calculate Robot Palm Plane:**
   - Extract from URDF joint structure
   - Build basis matrix M_r = [x_r, y_r, z_r]

3. **Compute Alignment Quaternion:**
   - R_align = M_r * M_h^T
   - Convert rotation matrix to quaternion

4. **Apply to Robot Wrist:**
   - robot.wrist.quaternion = R_align * strength
   - Strength parameter (0..1) for partial following

### Features to Implement

1. **computePalmAlignment():**
```typescript
function computePalmAlignment(
  humanLandmarks: HandLandmarks,
  robotModel: RobotModel
): Quaternion {
  // Implementation
}
```

2. **Mirror/Selfie Mode:**
   - Toggle to flip left/right hands
   - Account for camera mirroring

3. **Roll Offset Parameter:**
   - User-adjustable rotation offset
   - Compensate for hand rotation

4. **Quaternion SLERP:**
   - Smooth transitions between orientations
   - Prevent sudden jumps

---

## Types to Define

```typescript
// types.ts
export interface PalmPlane {
  origin: Vector3
  normal: Vector3
  basis: Matrix3  // [x, y, z] axes
}

export interface AlignmentState {
  enabled: boolean
  wristFollowStrength: number  // 0..1
  mirrorMode: boolean
  rollOffset: number  // radians
  robotToHumanQuat: Quaternion | null
}

export interface AlignmentConfig {
  updateRate: number  // Hz
  smoothingFactor: number  // for SLERP
}
```

---

## Implementation Plan

### Phase 1: Core Algorithm (4 hours)

1. **Create palmAlignment.ts:**
```typescript
// Extract palm points
function extractPalmPoints(landmarks: HandLandmarks): {
  wrist: Vector3
  indexRoot: Vector3
  pinkyRoot: Vector3
}

// Compute palm plane
function computePalmPlane(points: {...}): PalmPlane

// Compute alignment quaternion
export function computePalmAlignment(
  humanLandmarks: HandLandmarks,
  robotPalmPlane: PalmPlane
): Quaternion
```

2. **Handle Edge Cases:**
   - Insufficient landmarks
   - Degenerate triangles
   - Gimbal lock

### Phase 2: Integration (2 hours)

3. **Create alignmentSlice.ts:**
```typescript
interface AlignmentSlice {
  enabled: boolean
  wristFollowStrength: number
  mirrorMode: boolean
  rollOffset: number
  currentQuat: Quaternion | null

  setEnabled: (enabled: boolean) => void
  setStrength: (strength: number) => void
  setMirrorMode: (mirror: boolean) => void
  setRollOffset: (offset: number) => void
  updateQuaternion: (quat: Quaternion) => void
}
```

4. **Wire to URDF:**
```typescript
// In RobotHand component
const alignmentQuat = useAppStore(state => state.alignment.currentQuat)
const strength = useAppStore(state => state.alignment.wristFollowStrength)

useFrame(() => {
  if (alignmentQuat && robot) {
    robot.wrist.quaternion.slerp(alignmentQuat, strength)
  }
})
```

### Phase 3: Visualization (2 hours)

5. **Create AlignmentGizmo.tsx:**
   - Show human palm plane (green)
   - Show robot palm plane (blue)
   - Show alignment arrow
   - Toggle from Debug tab

---

## Testing Plan

1. **Unit Tests:**
   - Palm plane calculation
   - Quaternion conversion
   - SLERP interpolation

2. **Manual Tests:**
   - Static poses (flat hand, vertical hand, tilted)
   - Continuous movement
   - Mirror mode
   - Roll offset adjustment

3. **Success Criteria:**
   - Robot wrist matches hand orientation
   - Smooth transitions (no jitter)
   - <5° error in alignment

---

## Known Math Challenges

### Cross Product for Normal
```typescript
const normal = new Vector3().crossVectors(v1, v2).normalize()
```
- Ensure vectors not parallel
- Check for zero-length normals

### Matrix to Quaternion
```typescript
const quat = new Quaternion().setFromRotationMatrix(matrix)
```
- Three.js handles conversion
- Verify handedness (right-hand rule)

### SLERP Smoothing
```typescript
currentQuat.slerp(targetQuat, alpha)
```
- Alpha based on delta time
- Prevent overshooting

---

## Dependencies

### Required Packages
- `three` - Vector3, Matrix3, Quaternion classes
- Already installed ✅

### Required Features
- `tracking` - Provides hand landmarks
- `urdf` - Provides robot model and joints

---

## AI Guidelines

- Use Three.js math classes (Vector3, Quaternion)
- Test with static poses before continuous movement
- Add extensive logging during development
- Visualize intermediate steps (palm planes, axes)
- Handle degenerate cases gracefully

---

## References

- MainPlan: Section 2 (Phase 2)
- Three.js Quaternion docs
- Cross product: https://en.wikipedia.org/wiki/Cross_product
- Rotation matrices: https://en.wikipedia.org/wiki/Rotation_matrix

---

**Status:** ❌ Not Started
**Estimated Time:** 8-10 hours
**Depends On:** M1 (tracking) + M2 (urdf) complete
**Next Action:** Fix build errors → Test M1/M2 → Implement this
