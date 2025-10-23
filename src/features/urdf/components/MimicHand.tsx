'use client'

/**
 * Mimic Hand Component
 * A debug feature that displays a hand model mimicking user hand movements in real-time
 */

import { HandModel } from '@/features/scene/components/RobotScene'
import { useStore } from '@/store'
import type { HandTrackingResult } from '@/features/tracking/types'

interface MimicHandProps {
  /** Hand model configuration object */
  handModel?: HandModel
  /** Model ID to load (defaults to linker-l10-right) - deprecated, use handModel */
  modelId?: string
  /** Scale factor - deprecated, use handModel */
  scale?: number
  /** Position [x, y, z] - deprecated, use handModel */
  position?: [number, number, number]
  /** Rotation [x, y, z] in radians - deprecated, use handModel */
  rotation?: [number, number, number]
}

export function MimicHand({
  handModel,
  modelId: deprecatedModelId,
  scale: deprecatedScale,
  position: deprecatedPosition,
  rotation: deprecatedRotation,
}: MimicHandProps) {
  // Use handModel if provided, otherwise fall back to individual props
  const modelId = handModel?.modelId ?? deprecatedModelId ?? 'linker-l10-right'
  const scale = handModel?.scale ?? deprecatedScale ?? 5
  const position = handModel?.position ?? deprecatedPosition ?? [0, 0, 0]
  const rotation = handModel?.rotation ?? deprecatedRotation ?? [0, 0, 0]

  // Subscribe to tracking data from Zustand store
  const trackingResults = useStore((state) => state.tracking.results)

  // Get the first detected hand (or filter by handedness if needed)
  const handData: HandTrackingResult | undefined = trackingResults[0]

  // Landmark indices for finger roots
  const INDEX_ROOT = 5
  const MIDDLE_ROOT = 9
  const PINKY_ROOT = 17

  // Landmark indices for fingertips
  const THUMB_TIP = 4
  const INDEX_TIP = 8
  const MIDDLE_TIP = 12
  const RING_TIP = 16
  const PINKY_TIP = 20

  // Convert MediaPipe normalized coordinates to 3D scene coordinates
  const convertToSceneCoords = (landmark: { x: number; y: number; z: number }) => {
    // MediaPipe: x,y are normalized 0-1, z is relative depth
    // Convert to centered 3D coordinates scaled appropriately
    const sceneX = (landmark.x - 0.5) * 2 // Center around 0, range -1 to 1
    const sceneY = -(landmark.y - 0.5) * 2 // Invert Y (MediaPipe Y goes down, Three.js Y goes up)
    const sceneZ = -landmark.z * 2 // Z depth (negative moves away from camera)

    return [sceneX, sceneY, sceneZ] as [number, number, number]
  }

  // Convert landmark to relative position from wrist (landmark 0)
  const getRelativePosition = (landmark: { x: number; y: number; z: number }) => {
    if (!handData || !handData.landmarks[0]) return [0, 0, 0] as [number, number, number]

    const wrist = handData.landmarks[0]
    const relativeX = (landmark.x - wrist.x) * 2
    const relativeY = -(landmark.y - wrist.y) * 2 // Invert Y axis
    const relativeZ = -(landmark.z - wrist.z) * 2

    return [relativeX, relativeY, relativeZ] as [number, number, number]
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Root cube at wrist position (landmark 0) */}
      {handData && handData.landmarks && handData.landmarks[0] && (
        <group position={[0, 0, 0]}>
          {/* Wrist root cube */}
          <mesh>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="cyan" />
          </mesh>

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

      {/* Fallback placeholder when no hand detected */}
      {
        (!handData || !handData.landmarks) && (
          <mesh>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="cyan" />
          </mesh>
        )
      }
    </group >
  )
}
