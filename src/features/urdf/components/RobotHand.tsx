'use client'

import { useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { loadURDF } from '../core/loader'

interface RobotHandProps {
  /** Model ID to load (defaults to linker-l10-right) */
  modelId?: string
  /** Scale factor */
  scale?: number
  /** Position [x, y, z] */
  position?: [number, number, number]
  /** Rotation [x, y, z] in radians */
  rotation?: [number, number, number]
}

export function RobotHand({
  modelId = 'linker-l10-right',
  scale = 5, // Scale up for visibility (URDF is in meters, very small)
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: RobotHandProps) {
  const [robot, setRobot] = useState<THREE.Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        // Map model ID to URDF path
        const urdfPath = getUrdfPath(modelId)

        console.log(`Loading URDF model: ${urdfPath}`)

        // Load the URDF model
        const loadedRobot = await loadURDF(urdfPath, {
          scale,
          position,
          rotation,
        })

        if (!mounted) return

        console.log('URDF model loaded successfully', loadedRobot)
        setRobot(loadedRobot)
        setLoading(false)
      } catch (err) {
        if (!mounted) return

        console.error('Failed to load robot hand:', err)
        setError(err instanceof Error ? err.message : 'Failed to load robot model')
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [modelId, scale, position, rotation])

  // Update group ref when robot loads
  useEffect(() => {
    if (robot && groupRef.current) {
      // Clear previous children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0])
      }
      // Add loaded robot
      groupRef.current.add(robot)
    }
  }, [robot])

  // Optional: Animate or update robot state
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Add any animation logic here
      // For now, just a subtle rotation for demo
      // groupRef.current.rotation.y += delta * 0.1
    }
  })

  if (error) {
    console.error('[RobotHand] Error state:', error)
    return (
      <group>
        {/* Error placeholder - RED CUBE */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    )
  }

  if (loading) {
    console.log('[RobotHand] Loading state...')
    return (
      <group>
        {/* Loading placeholder - YELLOW WIREFRAME */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="yellow" wireframe />
        </mesh>
      </group>
    )
  }

  console.log('[RobotHand] Rendered successfully, robot loaded:', robot !== null)

  return <group ref={groupRef} />
}

/**
 * Map model ID to URDF file path
 */
function getUrdfPath(modelId: string): string {
  const models: Record<string, string> = {
    'linker-l10-right': '/assets/robots/hands/linker_l10/right/linkerhand_l10_right.urdf',
    'linker-l10-left': '/assets/robots/hands/linker_l10/left/linkerhand_l10_left.urdf',
    'linker-l20-right': '/assets/robots/hands/linker_l20/right/linkerhand_l20_right.urdf',
    'linker-l20-left': '/assets/robots/hands/linker_l20/left/linkerhand_l20_left.urdf',
    'shadow-hand-right': '/assets/robots/hands/shadow_hand/shadow_hand_right.urdf',
    'shadow-hand-left': '/assets/robots/hands/shadow_hand/shadow_hand_left.urdf',
  }

  return models[modelId] || models['linker-l10-right']
}
