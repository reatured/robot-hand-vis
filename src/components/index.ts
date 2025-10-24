/**
 * Barrel Export - Public API for Feature Components
 *
 * This file provides clean, short imports for all major feature components.
 *
 * Usage:
 *   import { Camera, Scene, RobotHand } from '@/components'
 *
 * Direct imports are still available when you need more control:
 *   import { CameraView } from '@/features/camera/components/CameraView'
 */

// ============================================================================
// Camera Feature (M1)
// ============================================================================
export { CameraView as Camera } from '@/features/camera/components/CameraView'

// ============================================================================
// Scene Feature (Core)
// ============================================================================
export { SceneCanvas as Scene } from '@/features/scene/components/SceneCanvas'
export { RobotScene } from '@/features/scene/components/RobotScene'

// ============================================================================
// URDF Feature (M2)
// ============================================================================
export { RobotHandInterface as RobotHand } from '@/features/urdf/components/RobotHandInterface'

// ============================================================================
// Tracking Feature (M1)
// ============================================================================
export { LandmarkOverlay } from '@/features/tracking/components/LandmarkOverlay'

// ============================================================================
// Alignment Feature (M3)
// ============================================================================
// Will be available when implemented:
// export { AlignmentGizmo } from '@/features/alignment/components/AlignmentGizmo'
// export { PalmPlaneVisualizer } from '@/features/alignment/components/PalmPlaneVisualizer'

// ============================================================================
// Fingertips Feature (M4)
// ============================================================================
// Will be available when implemented:
// export { TipTargets } from '@/features/fingertips/components/TipTargets'

// ============================================================================
// Debug Feature (M6)
// ============================================================================
// Will be available when implemented:
// export { DebugAxes } from '@/features/debug/components/DebugAxes'
// export { JointInfo } from '@/features/debug/components/JointInfo'
// export { HumanHandOverlay } from '@/features/debug/components/HumanHandOverlay'

// ============================================================================
// Inspector Feature (M6)
// ============================================================================
export { Inspector } from '@/features/inspector/components/Inspector'
// Will be available when implemented:
// export { JointsTab } from '@/features/inspector/components/JointsTab'
// export { ModelTab } from '@/features/inspector/components/ModelTab'
// export { TrackingTab } from '@/features/inspector/components/TrackingTab'
// export { AlignmentTab } from '@/features/inspector/components/AlignmentTab'
// export { IKTab } from '@/features/inspector/components/IKTab'
// export { DebugTab } from '@/features/inspector/components/DebugTab'

// ============================================================================
// Shared UI Components
// ============================================================================
export { Panel } from '@/shared/components/Panel'
export { Dropdown } from '@/shared/components/Dropdown'
export { Toggle } from '@/shared/components/Toggle'
// Will be available when implemented:
// export { Button } from '@/shared/components/Button'
// export { Slider } from '@/shared/components/Slider'
// export { Tabs } from '@/shared/components/Tabs'
