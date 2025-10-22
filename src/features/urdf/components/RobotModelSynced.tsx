'use client'

/**
 * Robot Model Synced Component
 * Displays the 3D robot model and syncs with skeleton data from store
 */

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/store'

interface RobotModelSyncedProps {
  /** The loaded URDF robot model */
  robot: THREE.Group
}

export function RobotModelSynced({ robot }: RobotModelSyncedProps) {
  const groupRef = useRef<THREE.Group>(null)
  const skeletonData = useStore((state) => (state as any).skeletonData)

  // Add robot to the group on mount
  useEffect(() => {
    if (groupRef.current) {
      // Clear previous children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0])
      }
      // Add loaded robot
      groupRef.current.add(robot)
    }
  }, [robot])

  // Sync model with skeleton data on every frame
  useFrame(() => {
    if (!skeletonData || !groupRef.current) return

    // Update root transform
    groupRef.current.position.copy(skeletonData.rootPosition)
    groupRef.current.rotation.copy(skeletonData.rootRotation)

    // Update each joint's LOCAL transform from skeleton (single source of truth)
    for (const skeletonJoint of skeletonData.joints) {
      if (!skeletonJoint.object3D) continue

      // Apply LOCAL transforms from skeleton to model joints
      // Skeleton stores local position/rotation, directly apply them
      skeletonJoint.object3D.position.copy(skeletonJoint.position)
      skeletonJoint.object3D.quaternion.copy(skeletonJoint.rotation)

      // THREE.js will automatically compute world positions from these local transforms
    }
  })

  return <group ref={groupRef} />
}
