'use client'

/**
 * Robot Hand Interface Component
 * Loads a URDF robot hand model and optionally applies hand tracking
 */

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { loadURDF } from '../core/loader'
import { TrackedHandModel } from './TrackedHandModel'

interface RobotHandInterfaceProps {
  /** Model ID to load (defaults to linker-l10-right) */
  modelId?: string
  /** Scale factor */
  scale?: number
  /** Position [x, y, z] */
  position?: [number, number, number]
  /** Rotation [x, y, z] in radians */
  rotation?: [number, number, number]
  /** Enable hand tracking rotation */
  useTracking?: boolean
  /** Which hand to track */
  trackingHand?: 'Left' | 'Right' | 'auto'
  /** Rotation smoothing factor (0 = no smoothing, 1 = max smoothing) */
  smoothing?: number
}

export function RobotHandInterface({
  modelId = 'linker-l10-right',
  scale = 5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  useTracking = true,
  trackingHand = 'Right',
  smoothing = 0.3,
}: RobotHandInterfaceProps) {
  const [robot, setRobot] = useState<THREE.Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          scale: 1,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
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
  }, [modelId])

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

  // If tracking is enabled, use TrackedHandModel
  if (useTracking) {
    return (
      <TrackedHandModel
        model={robot}
        trackingHand={trackingHand}
        smoothing={smoothing}
        baseRotation={new THREE.Euler(...rotation)}
        position={position}
        scale={scale}
      />
    )
  }

  // Otherwise, just render the model without tracking
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={robot} />
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
