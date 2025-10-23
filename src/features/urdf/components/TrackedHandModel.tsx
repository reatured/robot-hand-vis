'use client'

/**
 * Tracked Hand Model Component
 * Self-contained component that reads hand tracking data and applies wrist rotation
 * to a 3D model in real-time
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/store'
import {
  findTrackedHand,
  calculateRotationFromHand,
  applySmoothedRotation,
} from '../core/handWristRotation'

interface TrackedHandModelProps {
  /** The 3D model to control */
  model: THREE.Group
  /** Which hand to track */
  trackingHand?: 'Left' | 'Right' | 'auto'
  /** Rotation smoothing factor (0 = instant, 1 = max smoothing) */
  smoothing?: number
  /** Base rotation to apply */
  baseRotation?: THREE.Euler
  /** Position [x, y, z] */
  position?: [number, number, number]
  /** Scale factor */
  scale?: number
  /** Enable/disable tracking */
  enabled?: boolean
}

export function TrackedHandModel({
  model,
  trackingHand = 'Right',
  smoothing = 0.3,
  baseRotation,
  position = [0, 0, 0],
  scale = 1,
  enabled = true,
}: TrackedHandModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const targetQuaternion = useRef(new THREE.Quaternion())

  // Subscribe to hand tracking data from global store
  const trackingResults = useStore((state) => state.tracking.results)

  // Subscribe to hand metadata to get joint positions
  const handMetadata = useStore((state) => state.urdf.handMetadata)

  // Apply hand tracking rotation in real-time
  useFrame(() => {
    if (!enabled || !groupRef.current || trackingResults.length === 0) {
      return
    }

    // Find the hand to track
    const trackedHand = findTrackedHand(trackingResults, trackingHand)
    if (!trackedHand) return

    // Calculate rotation from hand landmarks
    const rotationQuat = calculateRotationFromHand(trackedHand, baseRotation)
    if (!rotationQuat) return

    // Store target rotation
    targetQuaternion.current.copy(rotationQuat)

    // Apply with smoothing
    // applySmoothedRotation(groupRef.current.quaternion, targetQuaternion.current, smoothing)
  })

  // Get thumb CMC joint position from metadata
  const thumbCmcPosition = handMetadata?.fingers.thumb?.joints[0]?.position

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={model} />

      {/* Sphere marker at thumb CMC location */}
      {thumbCmcPosition && (
        <mesh position={thumbCmcPosition}>
          <sphereGeometry args={[0.01, 16, 16]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )}
    </group>
  )
}
