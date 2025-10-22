/**
 * JointAnimDemo - Procedural Joint Animation System
 *
 * Provides standalone, reusable joint animation that tests full range of motion.
 * Animation sequence: current → lower limit → upper limit → 0°
 */

import * as THREE from 'three'

// Animation configuration
const ANIMATION_DURATION = 3000 // 3 seconds total
const PHASE_1_END = 0.25 // 25% - go to lower limit
const PHASE_2_END = 0.75 // 75% - go to upper limit
// Phase 3: 75-100% - return to zero

/**
 * Animation result from procedural calculation
 */
export interface AnimationResult {
  angle: number
  completed: boolean
  phase: 1 | 2 | 3
}

/**
 * Calculate joint angle procedurally based on elapsed time
 *
 * @param elapsedTime - Time since animation start (ms)
 * @param duration - Total animation duration (ms)
 * @param initialAngle - Starting angle of the joint
 * @param lowerLimit - Lower joint limit (radians)
 * @param upperLimit - Upper joint limit (radians)
 * @returns Current angle and completion status
 */
export function calculateJointAngle(
  elapsedTime: number,
  duration: number = ANIMATION_DURATION,
  initialAngle: number,
  lowerLimit: number,
  upperLimit: number
): AnimationResult {
  // Calculate overall progress (0 to 1)
  const progress = Math.min(elapsedTime / duration, 1.0)

  let phase: 1 | 2 | 3
  let phaseProgress: number
  let startAngle: number
  let endAngle: number

  // Determine current phase and interpolation targets
  if (progress < PHASE_1_END) {
    // Phase 1: Initial angle → Lower limit
    phase = 1
    phaseProgress = progress / PHASE_1_END
    startAngle = initialAngle
    endAngle = lowerLimit
  } else if (progress < PHASE_2_END) {
    // Phase 2: Lower limit → Upper limit
    phase = 2
    phaseProgress = (progress - PHASE_1_END) / (PHASE_2_END - PHASE_1_END)
    startAngle = lowerLimit
    endAngle = upperLimit
  } else {
    // Phase 3: Upper limit → Zero
    phase = 3
    phaseProgress = (progress - PHASE_2_END) / (1.0 - PHASE_2_END)
    startAngle = upperLimit
    endAngle = 0
  }

  // Apply smooth easing to phase progress
  const eased = easeInOutCubic(phaseProgress)

  // Linear interpolation between start and end angles
  const angle = startAngle + (endAngle - startAngle) * eased

  return {
    angle,
    completed: progress >= 1.0,
    phase,
  }
}

/**
 * Smooth cubic ease-in-out easing function
 *
 * @param t - Progress value (0 to 1)
 * @returns Eased value (0 to 1)
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Set joint angle by rotating around its axis
 *
 * @param object3D - Three.js object representing the joint
 * @param axis - Rotation axis (normalized vector)
 * @param angle - Target angle in radians
 */
export function setJointAngle(
  object3D: THREE.Object3D,
  axis: THREE.Vector3,
  angle: number
): void {
  // Create quaternion from axis and angle
  const quaternion = new THREE.Quaternion()
  quaternion.setFromAxisAngle(axis, angle)

  // Apply rotation to joint
  object3D.quaternion.copy(quaternion)

  // Mark for update
  object3D.updateMatrixWorld(true)
}

/**
 * Get safe animation limits for a joint
 * Handles joints with no limits (continuous) by providing default range
 *
 * @param lowerLimit - URDF lower limit (or null)
 * @param upperLimit - URDF upper limit (or null)
 * @returns Safe limits to use for animation
 */
export function getAnimationLimits(
  lowerLimit: number | null | undefined,
  upperLimit: number | null | undefined
): { lower: number; upper: number } {
  // If no limits (continuous joint), use a safe default range
  if (lowerLimit === null || lowerLimit === undefined ||
      upperLimit === null || upperLimit === undefined) {
    return {
      lower: -Math.PI / 4, // -45 degrees
      upper: Math.PI / 4,  // +45 degrees
    }
  }

  return {
    lower: lowerLimit,
    upper: upperLimit,
  }
}
