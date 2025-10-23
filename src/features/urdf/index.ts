/**
 * URDF Feature - Public API
 *
 * This module provides:
 * 1. Pre-processed robot hand metadata (no runtime URDF parsing)
 * 2. Runtime state management for hand instances
 * 3. Type definitions for hand models
 */

// ============================================================================
// Type Definitions
// ============================================================================
export type {
  JointType,
  Handedness,
  FingerName,
  JointMetadata,
  FingerMetadata,
  RobotHandMetadata,
  JointState,
  RobotHandState,
  // Legacy types (for existing code)
  JointLimit,
  UrdfJointInfo,
  ParsedUrdfData,
  SkeletonJoint,
  PalmDimensions,
  RobotSkeletonData,
} from './types'

// ============================================================================
// Pre-processed Hand Models
// ============================================================================
export { LINKER_L10_RIGHT } from './data/linker-l10-right'

// ============================================================================
// Runtime State Management
// ============================================================================
export {
  createHandState,
  updateJointValue,
  getJointValue,
  getAllJointValues,
  updateMultipleJoints,
  resetHandState,
  getJointCount,
  getJointNames,
  getAllJointsFromMetadata,
} from './core/handState'

// ============================================================================
// URDF Loader (Legacy - for existing code)
// ============================================================================
export { loadURDF } from './core/loader'

// ============================================================================
// Components
// ============================================================================
export { RobotHandInterface } from './components/RobotHandInterface'
export { TrackedHandModel } from './components/TrackedHandModel'
