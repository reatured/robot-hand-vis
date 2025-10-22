# URDF Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(urdf): {desc} + update docs`

---

## Metadata
- **Feature:** URDF
- **Status:** 🟡 Implemented (has critical bug)
- **Completion:** 85%
- **Last Modified:** 2025-10-22
- **Milestone:** M2
- **Dependencies:** scene, assets
- **Used By:** ik (M5), inspector (M6)

---

## Purpose
Loads robot hand models from URDF files using urdf-loader.

**Outputs:** THREE.Group with robot model

---

## Files

### core/loader.ts (153 lines)
- **loadURDF()** - Loads URDF file + meshes
- **resolveMeshPath()** - Resolves mesh paths
- **getAvailableModels()** - Model registry

### components/RobotHand.tsx (138 lines)
- React component for robot hand
- Async loading with states (loading, error, success)
- Integration with R3F useFrame

---

## 🔴 CRITICAL BUG - STLLoader Import

**File:** `core/loader.ts:10`
**Error:** `STLLoader is not exported from 'three'`

**Current (WRONG):**
```typescript
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
```

**Fix Required:**
```typescript
import { STLLoader } from 'three-stdlib'
```

**Impact:** Models cannot load → Blocking M2 testing
**Priority:** HIGH - Fix immediately

---

## Key Features

### 1. URDF Loading
```typescript
const robot = await loadURDF('/assets/robots/hands/model.urdf', {
  scale: 5,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
})
```

### 2. Mesh Path Resolution
Handles:
- `package://` prefixes
- Relative paths
- Absolute paths

### 3. Model Registry
6 models supported:
- linker-l10-right/left
- linker-l20-right/left
- shadow-hand-right/left

⚠️ **Note:** Linker models may not exist in public/assets

---

## RobotHand Component

**Props:**
```typescript
interface RobotHandProps {
  modelId?: string              // Default: 'linker-l10-right'
  scale?: number                // Default: 5
  position?: [number, number, number]
  rotation?: [number, number, number]
}
```

**States:**
- Loading → Yellow wireframe cube
- Error → Red solid cube
- Success → Actual model

---

## Known Issues

### 🔴 Critical
1. **STLLoader Import Error** - See above (BLOCKING)

### ⚠️ Moderate
2. **Missing Assets** - Linker L10/L20 URDFs may not exist
3. **No Joint Access** - Can't get joint information yet (needed for IK)

---

## Next Steps

1. **Fix STLLoader import** (5 min) - URGENT
2. **Verify assets exist** (15 min)
3. **Add joint extraction** (2 hours)
   - Parse URDF joint tree
   - Expose joint hierarchy
   - Needed for IK solver (M5)
4. **Test model loading** (30 min)

---

## AI Guidelines

- Fix STLLoader import before ANY other changes
- Check mesh file paths match URDF references
- URDF uses meters → scale up for visibility (5-10x)
- Test with multiple models to verify paths work

---

**Status:** 🔴 Blocked by STLLoader Import Error
**Next Action:** Fix import → Test → Add joint extraction
