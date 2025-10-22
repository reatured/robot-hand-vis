# Inspector Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(inspector): {desc} + update docs`

---

## Metadata
- **Feature:** Inspector
- **Status:** 🚧 Partial
- **Completion:** 15%
- **Last Modified:** 2025-10-22
- **Milestone:** M6
- **Dependencies:** All features (for UI controls)
- **Used By:** None (top-level UI)

---

## Purpose
Provides UI control panel for adjusting settings and monitoring state.

**Planned Tabs:**
1. Model Tab - Select robot model
2. Tracking Tab - Tracking settings
3. Alignment Tab - Palm alignment controls
4. IK Tab - IK solver settings
5. Debug Tab - Debug visualization toggles
6. Joints Tab - Joint info and manual control

---

## Files

### ✅ Implemented
- `components/Inspector.tsx` - Main container (exists)
- `components/JointsTab.tsx` - Joint controls (exists)
- `styles.css` - Styling

### ❌ Not Implemented
- `components/ModelTab.tsx`
- `components/TrackingTab.tsx`
- `components/AlignmentTab.tsx`
- `components/IKTab.tsx`
- `components/DebugTab.tsx`

---

## Planned Architecture

```
inspector/
├── components/
│   ├── Inspector.tsx          ✅ Container with tabs
│   ├── ModelTab.tsx           ❌ Model selection
│   ├── TrackingTab.tsx        ❌ Tracking controls
│   ├── AlignmentTab.tsx       ❌ Alignment controls
│   ├── IKTab.tsx              ❌ IK controls
│   ├── DebugTab.tsx           ❌ Debug toggles
│   └── JointsTab.tsx          ✅ Joint viewer
└── styles.css                 ✅ UI styles
```

---

## Requirements (From MainPlan M6)

### Model Tab
- Dropdown: Select robot model
- Thumbnail: Preview image
- Button: Load model
- Slider: Scale factor

### Tracking Tab
- Toggle: Enable/disable tracking
- Dropdown: Camera selection (if multiple)
- Display: FPS indicator
- Display: Confidence meter

### Alignment Tab
- Toggle: Enable palm alignment
- Slider: Wrist follow strength (0-1)
- Toggle: Mirror/selfie mode
- Slider: Roll offset

### IK Tab
- Toggle: Enable IK
- Slider: Iterations (1-32)
- Slider: Damping (0-1)
- Checkboxes: Per-finger enable/disable

### Debug Tab
- Toggle: Show human overlay
- Toggle: Show axis lines
- Toggle: Show tip targets
- Toggle: Show joint angles

### Joints Tab (Partial ✅)
- Tree view: All joints
- Display: Current angle
- Slider: Manual control
- Display: Joint limits

---

## State Integration

All tabs will use Zustand store:

```typescript
// Example: IK Tab
const ikEnabled = useAppStore(state => state.ik.enabled)
const setIKEnabled = useAppStore(state => state.setIKEnabled)

<Toggle
  label="Enable IK"
  value={ikEnabled}
  onChange={setIKEnabled}
/>
```

---

## UI Component Library Needed

Create in `src/shared/components/`:
- Button
- Toggle
- Slider
- Dropdown
- Panel
- Tabs

---

## Known Issues
- Most tabs not implemented yet
- No UI component library
- Styling incomplete

---

## Next Steps

1. **Create UI Components** (4-6 hours)
   - Button, Toggle, Slider, Dropdown, Panel, Tabs
   - Reusable across all tabs

2. **Implement Missing Tabs** (6-8 hours)
   - ModelTab
   - TrackingTab
   - AlignmentTab
   - IKTab
   - DebugTab

3. **Wire to Zustand Store** (2 hours)
   - Connect all controls to store actions
   - Subscribe to store state

4. **Polish Layout** (2 hours)
   - Responsive design
   - Sticky positioning
   - Clean styling

---

## AI Guidelines

- Implement UI components first (reusable)
- Each tab should be independent component
- Use Zustand for state (no local state for global settings)
- Follow consistent styling with Tailwind
- Test each tab independently

---

**Status:** 🚧 Structure exists, tabs need implementation
**Next Action:** Create UI component library → Implement tabs
