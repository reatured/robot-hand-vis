/**
 * Robot Hand State Management
 *
 * This module handles runtime state for robot hand models.
 * Metadata is immutable, state is cloned per instance.
 */

import { RobotHandMetadata, RobotHandState, JointState, FingerMetadata } from '../types'

/**
 * Create a fresh runtime state from metadata
 * This clones the metadata and initializes all joint values to 0
 *
 * @param metadata - Immutable hand metadata
 * @returns New runtime state instance
 */
export function createHandState(metadata: RobotHandMetadata): RobotHandState {
  const joints = new Map<string, JointState>()

  // Extract all joints from all fingers
  const allFingers: FingerMetadata[] = Object.values(metadata.fingers).filter(
    (f): f is FingerMetadata => f !== undefined
  )

  for (const finger of allFingers) {
    for (const jointMeta of finger.joints) {
      joints.set(jointMeta.name, {
        metadata: jointMeta,
        currentValue: 0, // Initialize to 0 (neutral position)
      })
    }
  }

  return {
    metadata,
    joints,
  }
}

/**
 * Update a single joint's value
 *
 * @param state - Runtime state
 * @param jointName - Name of joint to update
 * @param value - New angle (radians) or position (meters)
 * @throws Error if joint not found
 */
export function updateJointValue(state: RobotHandState, jointName: string, value: number): void {
  const joint = state.joints.get(jointName)
  if (!joint) {
    throw new Error(`Joint "${jointName}" not found in hand model "${state.metadata.id}"`)
  }

  // Optional: Clamp to limits
  if (joint.metadata.limits) {
    value = Math.max(joint.metadata.limits.lower, Math.min(joint.metadata.limits.upper, value))
  }

  joint.currentValue = value
}

/**
 * Get a single joint's current value
 *
 * @param state - Runtime state
 * @param jointName - Name of joint to query
 * @returns Current joint value
 * @throws Error if joint not found
 */
export function getJointValue(state: RobotHandState, jointName: string): number {
  const joint = state.joints.get(jointName)
  if (!joint) {
    throw new Error(`Joint "${jointName}" not found in hand model "${state.metadata.id}"`)
  }
  return joint.currentValue
}

/**
 * Get all joint values as a plain object
 * Useful for serialization/communication with external systems
 *
 * @param state - Runtime state
 * @returns Object mapping joint names to current values
 */
export function getAllJointValues(state: RobotHandState): Record<string, number> {
  const result: Record<string, number> = {}

  Array.from(state.joints.entries()).forEach(([name, joint]) => {
    result[name] = joint.currentValue
  })

  return result
}

/**
 * Update multiple joint values at once
 * Useful for applying data received from external systems
 *
 * @param state - Runtime state
 * @param values - Object mapping joint names to new values
 */
export function updateMultipleJoints(
  state: RobotHandState,
  values: Record<string, number>
): void {
  for (const [name, value] of Object.entries(values)) {
    if (state.joints.has(name)) {
      updateJointValue(state, name, value)
    }
    // Silently ignore unknown joints (allows partial updates)
  }
}

/**
 * Reset all joints to their neutral position (0)
 *
 * @param state - Runtime state
 */
export function resetHandState(state: RobotHandState): void {
  Array.from(state.joints.values()).forEach((joint) => {
    joint.currentValue = 0
  })
}

/**
 * Get total number of joints in the hand
 *
 * @param state - Runtime state
 * @returns Total joint count
 */
export function getJointCount(state: RobotHandState): number {
  return state.joints.size
}

/**
 * Get all joint names
 *
 * @param state - Runtime state
 * @returns Array of joint names
 */
export function getJointNames(state: RobotHandState): string[] {
  return Array.from(state.joints.keys())
}

/**
 * Helper: Get all joints from metadata (useful for initialization)
 *
 * @param metadata - Hand metadata
 * @returns Flat array of all joint metadata
 */
export function getAllJointsFromMetadata(metadata: RobotHandMetadata) {
  const joints = []

  for (const finger of Object.values(metadata.fingers)) {
    if (finger) {
      joints.push(...finger.joints)
    }
  }

  return joints
}
