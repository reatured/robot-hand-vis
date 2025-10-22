# Debug Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(debug): {desc} + update docs`

---

## Metadata
- **Feature:** Debug
- **Status:** 🚧 Partial
- **Completion:** 20%
- **Last Modified:** 2025-10-22
- **Milestone:** M6
- **Dependencies:** urdf, tracking
- **Used By:** inspector

---

## Purpose
Provides debug visualization for development and debugging.

**Visualizations:**
1. Joint axes (from URDF)
2. Human hand overlay (3D landmarks)
3. Fingertip targets (spheres)
4. Joint angle displays

---

## Files

### ✅ Implemented
- `components/DebugAxes.tsx` - Joint axis visualization
- `store/debugSlice.ts` - Debug state
- `types.ts` - Type definitions

### ❌ Not Implemented
- `components/HumanHandOverlay.tsx` - 3D hand visualization
- `components/TipTargets.tsx` - Fingertip target spheres
- `components/JointInfo.tsx` - Joint angle labels

---

## Requirements (From MainPlan M6)

### 1. Joint Axis Visualization ✅
- Parse joint axis from URDF
- Render ArrowHelper for each joint
  - Direction: joint axis
  - Length: 5cm
  - Color: By joint type
- Toggle visibility from Inspector

### 2. Human Hand Overlay ❌
- Convert MediaPipe landmarks to 3D
- Render as sphere markers
- Connect with lines (skeleton)
- Toggle visibility

### 3. Fingertip Targets ❌
- Render 5 target positions as spheres
- Show connection lines (robot tip → target)
- Color-code by finger
- Toggle visibility

### 4. Joint Selection & Info ❌
- Click to select joint
- Highlight selected joint axis
- Show info panel (name, type, angle, limits)

---

## Debug State (Zustand)

```typescript
interface DebugState {
  showAxes: boolean
  showHumanOverlay: boolean
  showTipTargets: boolean
  showJointAngles: boolean
  selectedJoint: string | null
}
```

---

## Known Issues
- Only DebugAxes partially implemented
- No joint selection yet
- No human overlay yet

---

## Next Steps

1. **Complete DebugAxes** (2 hours)
   - Parse all joints from URDF
   - Render all axes
   - Color-code by type

2. **HumanHandOverlay** (3 hours)
   - Convert landmarks to 3D
   - Render sphere + line skeleton
   - Wire to tracking state

3. **TipTargets** (2 hours)
   - Render 5 spheres
   - Position from fingertip mapping
   - Wire to fingertips state (after M4)

4. **Joint Selection** (2 hours)
   - Raycasting for click detection
   - Highlight selected joint
   - Info panel

---

## AI Guidelines
- Use ArrowHelper for axes (Three.js primitive)
- Use InstancedMesh for many landmarks (performance)
- All visualizations should respect debug toggles
- Use consistent colors for clarity

---

**Status:** 🚧 Basic structure exists
**Next Action:** Complete DebugAxes → Add HumanHandOverlay
