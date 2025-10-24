/**
 * Tracked Hand Points Group Component
 * Visualizes tracked hand landmarks including finger roots and fingertips
 */

import type { HandTrackingResult } from '@/features/tracking/types'

// Landmark indices for finger roots
const INDEX_ROOT = 5
const MIDDLE_ROOT = 9
const RING_ROOT = 13
const PINKY_ROOT = 17

// Landmark indices for fingertips
const THUMB_TIP = 4
const INDEX_TIP = 8
const MIDDLE_TIP = 12
const RING_TIP = 16
const PINKY_TIP = 20

interface TrackedHandPointsGroupProps {
  handData: HandTrackingResult
  calibratedScale: number
}

/**
 * Renders tracked hand landmarks as colored spheres
 */
export function TrackedHandPointsGroup({ handData, calibratedScale }: TrackedHandPointsGroupProps) {
  // Convert landmark to relative position from wrist (landmark 0)
  // Apply calibrated scale to position distances, not mesh sizes
  const getRelativePosition = (landmark: { x: number; y: number; z: number }) => {
    if (!handData.landmarks[0]) return [0, 0, 0] as [number, number, number]

    const wrist = handData.landmarks[0]
    const relativeX = (landmark.x - wrist.x) * 2 * calibratedScale
    const relativeY = -(landmark.y - wrist.y) * 2 * calibratedScale // Invert Y axis
    const relativeZ = -(landmark.z - wrist.z) * 2 * calibratedScale

    return [relativeX, relativeY, relativeZ] as [number, number, number]
  }

  if (!handData.landmarks || !handData.landmarks[0]) {
    return null
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Debug spheres for finger roots - positioned relative to wrist */}

      {/* Index finger root - Red sphere */}
      {handData.landmarks[INDEX_ROOT] && (
        <mesh position={getRelativePosition(handData.landmarks[INDEX_ROOT])}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}

      {/* Middle finger root - Green sphere */}
      {handData.landmarks[MIDDLE_ROOT] && (
        <mesh position={getRelativePosition(handData.landmarks[MIDDLE_ROOT])}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="green" />
        </mesh>
      )}

      {/* Ring finger root - Yellow sphere */}
      {handData.landmarks[RING_ROOT] && (
        <mesh position={getRelativePosition(handData.landmarks[RING_ROOT])}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      )}

      {/* Pinky finger root - Blue sphere */}
      {handData.landmarks[PINKY_ROOT] && (
        <mesh position={getRelativePosition(handData.landmarks[PINKY_ROOT])}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      )}

      {/* Fingertip spheres - smaller size for distinction */}

      {/* Thumb tip - Orange sphere */}
      {handData.landmarks[THUMB_TIP] && (
        <mesh position={getRelativePosition(handData.landmarks[THUMB_TIP])}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )}

      {/* Index tip - Yellow sphere */}
      {handData.landmarks[INDEX_TIP] && (
        <mesh position={getRelativePosition(handData.landmarks[INDEX_TIP])}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      )}

      {/* Middle tip - Magenta sphere */}
      {handData.landmarks[MIDDLE_TIP] && (
        <mesh position={getRelativePosition(handData.landmarks[MIDDLE_TIP])}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="magenta" />
        </mesh>
      )}

      {/* Ring tip - Purple sphere */}
      {handData.landmarks[RING_TIP] && (
        <mesh position={getRelativePosition(handData.landmarks[RING_TIP])}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="purple" />
        </mesh>
      )}

      {/* Pinky tip - Pink sphere */}
      {handData.landmarks[PINKY_TIP] && (
        <mesh position={getRelativePosition(handData.landmarks[PINKY_TIP])}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="pink" />
        </mesh>
      )}
    </group>
  )
}
