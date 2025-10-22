'use client'

/**
 * Robot Hand Interface Component
 * Main wrapper that loads URDF, extracts skeleton data, and renders both model and overlay
 */

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { loadURDF } from '../core/loader'
import { parseUrdfJoints } from '../core/parseUrdf'
import { extractSkeletonData } from '../core/skeletonExtractor'
import { useStore } from '@/store'
import { RobotModelSynced } from './RobotModelSynced'
import { SkeletonOverlay } from './SkeletonOverlay'

interface RobotHandInterfaceProps {
  /** Model ID to load (defaults to linker-l10-right) */
  modelId?: string
  /** Scale factor */
  scale?: number
  /** Position [x, y, z] */
  position?: [number, number, number]
  /** Rotation [x, y, z] in radians */
  rotation?: [number, number, number]
}

export function RobotHandInterface({
  modelId = 'linker-l10-right',
  scale = 5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: RobotHandInterfaceProps) {
  const [robot, setRobot] = useState<THREE.Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get store actions
  const setJoints = useStore((state) => (state as any).setJoints)
  const setSkeletonData = useStore((state) => (state as any).setSkeletonData)

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

        // Parse joint information from the loaded robot
        const parsedData = parseUrdfJoints(loadedRobot, modelId)
        console.log(`Parsed ${parsedData.joints.length} joints from URDF`)

        // Store joints in Zustand for inspector (legacy)
        setJoints(parsedData.joints)

        // Extract skeleton data
        const rootPos = new THREE.Vector3(...position)
        const rootRot = new THREE.Euler(...rotation)
        const skeletonData = extractSkeletonData(loadedRobot, parsedData.joints, rootPos, rootRot)

        console.log('Skeleton data extracted:', skeletonData)
        console.log('Palm dimensions:', skeletonData.palmDimensions)

        // Store skeleton data in Zustand (SINGLE SOURCE OF TRUTH)
        setSkeletonData(skeletonData)

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
  }, [modelId, scale, position, rotation, setJoints, setSkeletonData])

  if (error) {
    console.error('[RobotHandInterface] Error state:', error)
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

  if (loading || !robot) {
    console.log('[RobotHandInterface] Loading state...')
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

  console.log('[RobotHandInterface] Rendered successfully, robot loaded:', robot !== null)

  return (
    <group>
      {/* Robot model synced with skeleton data */}
      <RobotModelSynced robot={robot} />

      {/* Skeleton overlay visualization (always on top) */}
      <SkeletonOverlay />
    </group>
  )
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
