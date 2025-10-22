/**
 * Palm Metrics Calculator
 * Calculates palm dimensions from joint positions
 */

import * as THREE from 'three'
import { UrdfJointInfo, PalmDimensions } from '../types'

/**
 * Calculate palm dimensions from base knuckle distances
 * Uses distance between index and pinky base joints for width,
 * and wrist to middle finger base for length
 */
export function calculatePalmDimensions(joints: UrdfJointInfo[]): PalmDimensions {
  // Find key joints
  const wristJoint = findJointByPattern(joints, ['wrist', 'palm', 'base'])
  const thumbBase = findFingerBase(joints, 'thumb')
  const indexBase = findFingerBase(joints, 'index')
  const middleBase = findFingerBase(joints, 'middle')
  const ringBase = findFingerBase(joints, 'ring')
  const pinkyBase = findFingerBase(joints, 'pinky')

  // Calculate dimensions using WORLD positions (for accurate palm metrics)
  let width = 0
  let length = 0
  const wristPosition = wristJoint?.worldPosition || new THREE.Vector3(0, 0, 0)

  // Calculate palm width (index to pinky base distance)
  if (indexBase && pinkyBase) {
    width = indexBase.worldPosition.distanceTo(pinkyBase.worldPosition)
  } else {
    // Fallback: estimate from available finger bases
    const fingerBases = [thumbBase, indexBase, middleBase, ringBase, pinkyBase].filter(Boolean)
    if (fingerBases.length >= 2) {
      // Use distance between furthest apart fingers
      let maxDist = 0
      for (let i = 0; i < fingerBases.length; i++) {
        for (let j = i + 1; j < fingerBases.length; j++) {
          const dist = fingerBases[i]!.worldPosition.distanceTo(fingerBases[j]!.worldPosition)
          maxDist = Math.max(maxDist, dist)
        }
      }
      width = maxDist
    }
  }

  // Calculate palm length (wrist to middle finger base distance)
  if (wristJoint && middleBase) {
    length = wristJoint.worldPosition.distanceTo(middleBase.worldPosition)
  } else if (wristJoint) {
    // Fallback: use average distance to all finger bases
    const fingerBases = [thumbBase, indexBase, middleBase, ringBase, pinkyBase].filter(Boolean)
    if (fingerBases.length > 0) {
      const totalDist = fingerBases.reduce(
        (sum, base) => sum + wristJoint.worldPosition.distanceTo(base!.worldPosition),
        0
      )
      length = totalDist / fingerBases.length
    }
  }

  // If we still don't have dimensions, estimate from joint spread
  if (width === 0 || length === 0) {
    const allPositions = joints.map((j) => j.worldPosition)
    const bbox = new THREE.Box3().setFromPoints(allPositions)
    const size = new THREE.Vector3()
    bbox.getSize(size)

    if (width === 0) width = Math.max(size.x, size.z) * 0.4
    if (length === 0) length = Math.max(size.y, Math.max(size.x, size.z)) * 0.5
  }

  return {
    width,
    length,
    wristPosition: wristPosition.clone(),
    baseJoints: {
      thumb: thumbBase?.worldPosition.clone(),
      index: indexBase?.worldPosition.clone(),
      middle: middleBase?.worldPosition.clone(),
      ring: ringBase?.worldPosition.clone(),
      pinky: pinkyBase?.worldPosition.clone(),
    },
  }
}

/**
 * Find a joint by pattern matching (case-insensitive)
 */
function findJointByPattern(joints: UrdfJointInfo[], patterns: string[]): UrdfJointInfo | null {
  for (const pattern of patterns) {
    const found = joints.find((j) => j.name.toLowerCase().includes(pattern.toLowerCase()))
    if (found) return found
  }
  return null
}

/**
 * Find the base joint of a specific finger
 */
function findFingerBase(joints: UrdfJointInfo[], fingerName: string): UrdfJointInfo | null {
  const nameLower = fingerName.toLowerCase()

  // Look for base/knuckle joints first
  const basePatterns = [`${nameLower}_base`, `${nameLower}_knuckle`, `${nameLower}_mcp`, `${nameLower}0`]

  for (const pattern of basePatterns) {
    const found = joints.find((j) => j.name.toLowerCase().includes(pattern))
    if (found) return found
  }

  // Fallback: find first joint with finger name
  const fingerJoints = joints.filter((j) => j.name.toLowerCase().includes(nameLower))

  // Return the joint closest to the origin (likely the base)
  if (fingerJoints.length > 0) {
    return fingerJoints.reduce((closest, current) => {
      const closestDist = closest.position.length()
      const currentDist = current.position.length()
      return currentDist < closestDist ? current : closest
    })
  }

  return null
}
