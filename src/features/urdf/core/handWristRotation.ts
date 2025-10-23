/**
 * Hand Wrist Rotation Utilities
 * Calculate robot hand rotation from tracked hand landmarks
 */

import * as THREE from 'three'
import type { HandTrackingResult } from '@/features/tracking/types'

/**
 * Find the tracked hand from tracking results
 */
export function findTrackedHand(
  trackingResults: HandTrackingResult[],
  trackingHand: 'Left' | 'Right' | 'auto'
): HandTrackingResult | null {
  if (trackingResults.length === 0) return null

  // If auto mode, use the first detected hand
  if (trackingHand === 'auto') {
    return trackingResults[0]
  }

  // Find specific hand
  return trackingResults.find((r) => r.handedness === trackingHand) || null
}

/**
 * Calculate rotation quaternion from wrist and middle finger root
 *
 * @param wristLandmark - Wrist position (landmark[0])
 * @param middleFingerRoot - Middle finger root position (landmark[9])
 * @param baseRotation - Base rotation to apply (optional)
 * @returns Rotation quaternion
 */
export function calculateWristRotation(
  wristLandmark: { x: number; y: number; z: number },
  middleFingerRoot: { x: number; y: number; z: number },
  baseRotation?: THREE.Euler
): THREE.Quaternion {
  // Calculate direction vector from wrist to middle finger root
  const direction = new THREE.Vector3(
    middleFingerRoot.x - wristLandmark.x,
    middleFingerRoot.y - wristLandmark.y,
    middleFingerRoot.z - wristLandmark.z
  ).normalize()

  // Calculate rotation quaternion
  // Assuming robot hand's default orientation is pointing up (0, 1, 0)
  const upVector = new THREE.Vector3(0, 1, 0)
  const rotationQuat = new THREE.Quaternion()
  rotationQuat.setFromUnitVectors(upVector, direction)

  // Apply base rotation if provided
  if (baseRotation) {
    const baseQuat = new THREE.Quaternion().setFromEuler(baseRotation)
    rotationQuat.multiply(baseQuat)
  }

  return rotationQuat
}

/**
 * Calculate rotation from a tracked hand result
 * Convenience function that extracts landmarks and calls calculateWristRotation
 */
export function calculateRotationFromHand(
  hand: HandTrackingResult,
  baseRotation?: THREE.Euler
): THREE.Quaternion | null {
  const wrist = hand.landmarks[0]
  const middleFingerRoot = hand.landmarks[9]

  if (!wrist || !middleFingerRoot) {
    return null
  }

  return calculateWristRotation(wrist, middleFingerRoot, baseRotation)
}

/**
 * Apply rotation with smoothing using SLERP
 *
 * @param currentQuat - Current quaternion to update
 * @param targetQuat - Target quaternion
 * @param smoothing - Smoothing factor (0 = instant, 1 = max smoothing)
 */
export function applySmoothedRotation(
  currentQuat: THREE.Quaternion,
  targetQuat: THREE.Quaternion,
  smoothing: number
): void {
  if (smoothing > 0) {
    currentQuat.slerp(targetQuat, 1 - smoothing)
  } else {
    currentQuat.copy(targetQuat)
  }
}
