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

const AXIS_LENGTH = 0.05 // 5cm arrow length
const AXIS_HEAD_LENGTH = 0.015 // 1.5cm arrow head
const AXIS_HEAD_WIDTH = 0.01 // 1cm arrow head width

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
    <group>
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
    pos.add(arrow.direction.clone().multiplyScalar(arrow.length + 0.02))
    return pos
  }, [arrow])

  // Format angle for display
  const angleText = `${joint.name}\n${(joint.currentAngle * 180 / Math.PI).toFixed(1)}°`

  return (
    <group>
      {/* Arrow showing rotation axis */}
      <arrowHelper
        args={[
          arrow.direction,
          arrow.origin,
          arrow.length,
          arrow.color,
          AXIS_HEAD_LENGTH * (isSelected ? 1.5 : 1),
          AXIS_HEAD_WIDTH * (isSelected ? 1.5 : 1),
        ]}
      />

      {/* Joint name and angle label */}
      <Text
        position={labelPosition}
        fontSize={0.008}
        color={isSelected ? '#ffff00' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.001}
        outlineColor="#000000"
      >
        {angleText}
      </Text>

      {/* Optional: Small sphere at joint origin for selected joint */}
      {isSelected && (
        <mesh position={arrow.origin}>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshBasicMaterial color={0xffff00} />
        </mesh>
      )}
    </group>
  )
}
