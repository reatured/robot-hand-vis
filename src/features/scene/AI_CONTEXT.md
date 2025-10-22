# Scene Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(scene): {desc} + update docs`

---

## Metadata
- **Feature:** Scene
- **Status:** ✅ Complete
- **Completion:** 100%
- **Last Modified:** 2025-10-22
- **Milestone:** Core
- **Dependencies:** None
- **Used By:** urdf, debug, all 3D components

---

## Purpose
Sets up the 3D scene using React Three Fiber (R3F).

**Outputs:** Canvas with lighting, camera, controls, grid

---

## Files

### components/SceneCanvas.tsx (35 lines)
R3F Canvas wrapper with:
- Camera setup (position, FOV, near/far)
- AgX tone mapping
- Fullscreen layout
- Preload for assets

### components/RobotScene.tsx (49 lines)
Scene content:
- Lighting (ambient + 2× directional)
- Grid (20×20 units, @react-three/drei)
- OrbitControls
- Test cube placeholder

---

## Key Setup

### Camera
```typescript
camera={{
  position: [3, 3, 5],
  fov: 50,
  near: 0.1,
  far: 1000,
}}
```

### Lighting
```typescript
<ambientLight intensity={0.5} />
<directionalLight
  position={[10, 10, 5]}
  intensity={1}
  castShadow
/>
<directionalLight
  position={[-10, -10, -5]}
  intensity={0.3}  // Fill light
/>
```

### Grid
```typescript
<Grid
  args={[20, 20]}
  cellSize={0.5}
  sectionSize={2}
  cellColor="#6b7280"
  sectionColor="#9ca3af"
/>
```

### Controls
```typescript
<OrbitControls
  maxPolarAngle={Math.PI / 2}  // Prevent underground view
  enableDamping
  dampingFactor={0.05}
  target={[0, 1, 0]}
/>
```

---

## Known Issues
None - Feature is production ready

---

## Next Steps
1. Add environment map for better reflections
2. Add post-processing effects (optional)
3. Add custom background (optional)

---

## AI Guidelines
- Don't change camera position without testing
- Grid provides scale reference (each cell = 0.5 units)
- Target [0, 1, 0] keeps focus at hand height
- Tone mapping affects overall brightness

---

**Status:** ✅ Production Ready
