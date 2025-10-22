'use client'

/**
 * Skeleton Overlay Component
 * Visualizes skeleton as points and lines, always rendered on top
 * Reads LIVE world positions from model's Object3D for perfect alignment
 */

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/store'
import { SkeletonJoint } from '../types'
import { useState } from 'react'

const JOINT_SPHERE_RADIUS = 0.02 // 2cm spheres
const LINE_WIDTH = 2

export function SkeletonOverlay() {
  const skeletonData = useStore((state) => (state as any).skeletonData)

  // Store live world positions computed from model
  const [livePositions, setLivePositions] = useState<Map<string, THREE.Vector3>>(new Map())

  // Update live positions every frame by reading from model's Object3D
  useFrame(() => {
    if (!skeletonData) return

    const newPositions = new Map<string, THREE.Vector3>()

    for (const joint of skeletonData.joints) {
      if (!joint.object3D) continue

      // Read current world position from the model's Object3D
      const worldPos = new THREE.Vector3()
      joint.object3D.getWorldPosition(worldPos)
      newPositions.set(joint.name, worldPos)
    }

    setLivePositions(newPositions)
  })

  // Build parent-child connection lines using live positions
  const connectionLines = useMemo(() => {
    if (!skeletonData || livePositions.size === 0) return []

    const lines: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = []

    for (const joint of skeletonData.joints) {
      if (joint.parentName === null) continue

      // Find parent joint
      const parent = skeletonData.joints.find((j: SkeletonJoint) => j.name === joint.parentName)
      if (!parent) continue

      const startPos = livePositions.get(parent.name)
      const endPos = livePositions.get(joint.name)

      if (startPos && endPos) {
        lines.push({
          start: startPos.clone(),
          end: endPos.clone(),
        })
      }
    }

    return lines
  }, [skeletonData, livePositions])

  if (!skeletonData || livePositions.size === 0) return null

  return (
    <group>
      {/* Joint spheres - always on top, using LIVE world positions */}
      {skeletonData.joints.map((joint: SkeletonJoint) => {
        const worldPos = livePositions.get(joint.name)
        if (!worldPos) return null

        return (
          <mesh
            key={`sphere-${joint.name}`}
            position={worldPos}
            renderOrder={1001}
          >
            <sphereGeometry args={[JOINT_SPHERE_RADIUS, 16, 16]} />
            <meshBasicMaterial
              color={getJointColor(joint.type)}
              depthTest={false}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Connection lines - always on top */}
      {connectionLines.map((line, index) => (
        <Line
          key={`line-${index}`}
          start={line.start}
          end={line.end}
          color={0x00ffff}
        />
      ))}
    </group>
  )
}

/**
 * Line component for connecting joints
 */
interface LineProps {
  start: THREE.Vector3
  end: THREE.Vector3
  color: number
}

function Line({ start, end, color }: LineProps) {
  const points = useMemo(() => {
    return new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])
  }, [start, end])

  return (
    <line renderOrder={1001}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={2} array={points} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={LINE_WIDTH} depthTest={false} transparent opacity={0.6} />
    </line>
  )
}

/**
 * Get color for joint based on type
 */
function getJointColor(type: string): number {
  switch (type) {
    case 'revolute':
      return 0x00ffff // cyan
    case 'continuous':
      return 0xffff00 // yellow
    case 'prismatic':
      return 0xff00ff // magenta
    case 'fixed':
      return 0x808080 // gray
    default:
      return 0xffffff // white
  }
}
