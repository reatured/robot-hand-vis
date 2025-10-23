'use client'

/**
 * Mimic Hand Component
 * A debug feature that displays a hand model mimicking user hand movements in real-time
 */

import { HandModel } from '@/features/scene/components/RobotScene'
import { useStore } from '@/store'
import type { HandTrackingResult } from '@/features/tracking/types'
import type { JointMetadata, RobotHandMetadata } from '@/features/urdf/types'
import * as THREE from 'three'
import { useMemo } from 'react'

/**
 * Build a lookup map for joints by child link name
 */
function buildJointLookup(metadata: RobotHandMetadata): Map<string, JointMetadata> {
  const jointByChildLink = new Map<string, JointMetadata>()

  Object.values(metadata.fingers).forEach((finger) => {
    if (finger) {
      finger.joints.forEach((j) => {
        jointByChildLink.set(j.childLink, j)
      })
    }
  })

  return jointByChildLink
}

/**
 * Get parent chain from joint to base link
 */
function getParentChain(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): JointMetadata[] {
  const chain: JointMetadata[] = []
  let currentJoint: JointMetadata | undefined = joint

  while (currentJoint) {
    chain.push(currentJoint)

    if (currentJoint.parentLink === metadata.baseLink) {
      break
    }

    currentJoint = jointLookup.get(currentJoint.parentLink)
  }

  return chain.reverse() // Base to target order
}

/**
 * Compute world position of a joint by traversing parent chain
 * Accumulates positions from the joint up to the base link
 */
function computeWorldPosition(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): [number, number, number] {
  const chain = getParentChain(joint, metadata, jointLookup)

  let worldX = 0
  let worldY = 0
  let worldZ = 0

  for (const j of chain) {
    worldX += j.position[0]
    worldY += j.position[1]
    worldZ += j.position[2]
  }

  return [worldX, worldY, worldZ]
}

/**
 * Compute world rotation (quaternion) by accumulating parent rotations
 * Returns the accumulated rotation from base to this joint
 */
function computeWorldRotation(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): THREE.Quaternion {
  const chain = getParentChain(joint, metadata, jointLookup)

  // Start with identity rotation
  const worldQuat = new THREE.Quaternion()

  // For each joint in chain, we would need to apply its rotation
  // However, URDF joint positions are defined in the parent frame
  // The axis directions are also in the parent frame
  // For now, we'll just return identity since we need the actual joint angles
  // to compute the full rotation (which we don't have in metadata)

  return worldQuat
}

/**
 * Transform axis direction by accumulated parent rotations
 */
function computeWorldAxisDirection(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): THREE.Vector3 {
  // Get local axis direction
  const localAxis = new THREE.Vector3(...joint.axis)

  // Get accumulated rotation
  const worldRot = computeWorldRotation(joint, metadata, jointLookup)

  // Transform axis by world rotation
  return localAxis.applyQuaternion(worldRot)
}

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
  const isMimicHandVisible = useStore((state) => state.urdf.isMimicHandVisible)

  // Subscribe to hand model metadata from Zustand store
  const handMetadata = useStore((state) => state.urdf.handMetadata)

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

  // Compute calibrated scale based on palm length (wrist to middle finger root)
  const calibratedScale = useMemo(() => {
    // Default to user-provided scale if calibration not possible
    let scaleFactor = scale

    if (handData && handData.landmarks && handMetadata && handMetadata.fingers.middle) {
      try {
        // 1. Calculate tracked hand palm length (wrist to middle finger root)
        const wrist = handData.landmarks[0]
        const middleRoot = handData.landmarks[MIDDLE_ROOT]

        if (wrist && middleRoot) {
          const trackedPalmLength = Math.sqrt(
            Math.pow(middleRoot.x - wrist.x, 2) +
            Math.pow(middleRoot.y - wrist.y, 2) +
            Math.pow(middleRoot.z - wrist.z, 2)
          )

          // 2. Calculate robot hand palm length (base to middle finger root)
          const jointLookup = buildJointLookup(handMetadata)
          const middleBaseJoint = handMetadata.fingers.middle.joints[0]
          const robotMiddleRootPos = computeWorldPosition(middleBaseJoint, handMetadata, jointLookup)

          // Distance from base link [0,0,0] to middle finger base
          const robotPalmLength = Math.sqrt(
            Math.pow(robotMiddleRootPos[0], 2) +
            Math.pow(robotMiddleRootPos[1], 2) +
            Math.pow(robotMiddleRootPos[2], 2)
          )

          // 3. Compute scale factor to match robot model size
          if (trackedPalmLength > 0) {
            const autoScale = robotPalmLength / trackedPalmLength
            scaleFactor = autoScale
          }
        }
      } catch (error) {
        console.warn('Failed to calibrate mimic hand scale:', error)
      }
    }

    return scaleFactor
  }, [handData, handMetadata, scale])

  // If mimic hand is hidden, return null
  if (!isMimicHandVisible) {
    return null
  }

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
  // Apply calibrated scale to position distances, not mesh sizes
  const getRelativePosition = (landmark: { x: number; y: number; z: number }) => {
    if (!handData || !handData.landmarks[0]) return [0, 0, 0] as [number, number, number]

    const wrist = handData.landmarks[0]
    const relativeX = (landmark.x - wrist.x) * 2 * calibratedScale
    const relativeY = -(landmark.y - wrist.y) * 2 * calibratedScale // Invert Y axis
    const relativeZ = -(landmark.z - wrist.z) * 2 * calibratedScale

    return [relativeX, relativeY, relativeZ] as [number, number, number]
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>

      {/* Wrist root cube */}
      <mesh>
        <boxGeometry args={[0.02, 0.02, 0.05]} />
        <meshStandardMaterial color="cyan" />
      </mesh>

      {/* Tracking landmarks - positions scaled, mesh sizes constant */}
      {handData && handData.landmarks && handData.landmarks[0] && (
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
      )}

      {/* Thumb joint rotation axes from hand metadata - colored lines */}
      {handMetadata && handMetadata.fingers.thumb && (() => {
        const jointLookup = buildJointLookup(handMetadata)

        return (
          <group position={[0, 0, 0]}>
            {handMetadata.fingers.thumb.joints.map((joint, index) => {
              // Compute world position and axis direction
              const worldPos = computeWorldPosition(joint, handMetadata, jointLookup)
              const worldAxis = computeWorldAxisDirection(joint, handMetadata, jointLookup)

              // Line length for visualization
              const lineLength = 0.03

              // Create arrow helper to visualize rotation axis
              const arrowHelper = new THREE.ArrowHelper(
                worldAxis.normalize(),
                new THREE.Vector3(...worldPos),
                lineLength,
                [
                  0xff0000, // cmc_roll - bright red
                  0xff4500, // cmc_yaw - orange red
                  0xff8c00, // cmc_pitch - dark orange
                  0xffa500, // mcp - orange
                  0xffd700, // ip - gold
                ][index] || 0xffffff,
                lineLength * 0.25, // Head length
                lineLength * 0.2   // Head width
              )

              return (
                <group key={joint.name}>
                  <primitive object={arrowHelper} />
                  {/* Small sphere at joint position */}
                  <mesh position={worldPos}>
                    <sphereGeometry args={[0.005, 8, 8]} />
                    <meshBasicMaterial
                      color={
                        [
                          '#ff0000', // cmc_roll - bright red
                          '#ff4500', // cmc_yaw - orange red
                          '#ff8c00', // cmc_pitch - dark orange
                          '#ffa500', // mcp - orange
                          '#ffd700', // ip - gold
                        ][index] || '#ffffff'
                      }
                    />
                  </mesh>
                </group>
              )
            })}
          </group>
        )
      })()
      }
    </group >
  )
}
