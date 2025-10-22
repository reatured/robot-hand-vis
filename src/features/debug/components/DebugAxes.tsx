'use client'

/**
 * DebugAxes Component
 * Visualizes joint rotation axes as 3D arrows with labels
 */

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store'
import { getJointTypeColor, getJointFinger } from '../../urdf/core/parseUrdf'
import { UrdfJointInfo } from '../../urdf/types'

const AXIS_LENGTH = 0.15 // 15cm arrow length (3x larger for better visibility)
const AXIS_HEAD_LENGTH = 0.045 // 4.5cm arrow head (3x larger)
const AXIS_HEAD_WIDTH = 0.03 // 3cm arrow head width (3x larger)

export function DebugAxes() {
  // Get state from store
  const showAxisLines = useStore((state) => (state as any).showAxisLines)
  const fingerFilter = useStore((state) => (state as any).fingerFilter)
  const selectedJointName = useStore((state) => (state as any).selectedJointName)
  const joints = useStore((state) => (state as any).joints || [])

  // Filter joints based on finger selection and joint type
  const filteredJoints = useMemo(() => {
    return joints.filter((joint: UrdfJointInfo) => {
      // Only show rotatable joints (revolute, continuous, prismatic)
      if (joint.type === 'fixed' || joint.type === 'floating' || joint.type === 'planar') {
        return false
      }

      // Apply finger filter
      if (fingerFilter !== 'all') {
        const jointFinger = getJointFinger(joint.name)
        if (jointFinger !== fingerFilter) {
          return false
        }
      }

      return true
    })
  }, [joints, fingerFilter])

  if (!showAxisLines) {
    return null
  }

  return (
    <group renderOrder={999}>
      {filteredJoints.map((joint: UrdfJointInfo) => (
        <JointAxisVisualizer
          key={joint.name}
          joint={joint}
          isSelected={joint.name === selectedJointName}
        />
      ))}
    </group>
  )
}

interface JointAxisVisualizerProps {
  joint: UrdfJointInfo
  isSelected: boolean
}

function JointAxisVisualizer({ joint, isSelected }: JointAxisVisualizerProps) {
  const color = getJointTypeColor(joint.type)

  // Create arrow geometry
  const arrow = useMemo(() => {
    const direction = joint.axis.clone().normalize()
    const origin = joint.position.clone()

    return {
      origin,
      direction,
      color,
      length: isSelected ? AXIS_LENGTH * 1.5 : AXIS_LENGTH,
    }
  }, [joint, color, isSelected])

  // Label position (slightly offset from arrow tip)
  const labelPosition = useMemo(() => {
    const pos = arrow.origin.clone()
    pos.add(arrow.direction.clone().multiplyScalar(arrow.length + 0.05))
    return pos
  }, [arrow])

  // Format angle for display
  const angleText = `${joint.name}\n${(joint.currentAngle * 180 / Math.PI).toFixed(1)}°`

  return (
    <group>
      {/* Custom Arrow showing rotation axis - Always on top */}
      <CustomArrow
        origin={arrow.origin}
        direction={arrow.direction}
        length={arrow.length}
        color={arrow.color}
        headLength={AXIS_HEAD_LENGTH * (isSelected ? 1.5 : 1)}
        headWidth={AXIS_HEAD_WIDTH * (isSelected ? 0.5 : 0.25)}
      />

      {/* Joint name and angle label - Always on top */}
      <Text
        position={labelPosition}
        fontSize={0.025}
        color={isSelected ? '#ffff00' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.003}
        outlineColor="#000000"
        renderOrder={1000}
        material-depthTest={false}
      >
        {angleText}
      </Text>

      {/* Optional: Small sphere at joint origin for selected joint - Always on top */}
      {isSelected && (
        <mesh position={arrow.origin} renderOrder={1000}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshBasicMaterial color={0xffff00} depthTest={false} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Custom Arrow Component
 * Renders an arrow with shaft and cone head, always on top of other objects
 */
interface CustomArrowProps {
  origin: THREE.Vector3
  direction: THREE.Vector3
  length: number
  color: number
  headLength: number
  headWidth: number
}

function CustomArrow({ origin, direction, length, color, headLength, headWidth }: CustomArrowProps) {
  // Calculate arrow end point
  const endPoint = useMemo(() => {
    return origin.clone().add(direction.clone().multiplyScalar(length - headLength))
  }, [origin, direction, length, headLength])

  // Calculate cone head position and rotation
  const headPosition = useMemo(() => {
    return origin.clone().add(direction.clone().multiplyScalar(length - headLength / 2))
  }, [origin, direction, length, headLength])

  // Calculate rotation quaternion to align cone with direction
  const headRotation = useMemo(() => {
    const quaternion = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    quaternion.setFromUnitVectors(up, direction)
    return quaternion
  }, [direction])

  return (
    <group>
      {/* Arrow shaft (line) */}
      <line renderOrder={1000}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              origin.x, origin.y, origin.z,
              endPoint.x, endPoint.y, endPoint.z
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} depthTest={false} linewidth={2} />
      </line>

      {/* Arrow head (cone) */}
      <mesh position={headPosition} quaternion={headRotation} renderOrder={1000}>
        <coneGeometry args={[headWidth, headLength, 8]} />
        <meshBasicMaterial color={color} depthTest={false} />
      </mesh>
    </group>
  )
}
