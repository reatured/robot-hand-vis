'use client'

/**
 * Robot Hand Interface Component
 * Loads a URDF robot hand model and optionally applies hand tracking
 */

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { loadURDF } from '../core/loader'
import { TrackedHandModel } from './TrackedHandModel'
import { HandModel } from '@/features/scene/components/RobotScene'
import { useStore } from '@/store'
import { LINKER_L10_RIGHT } from '../data/linker-l10-right'
import { createHandState } from '../core/handState'

interface RobotHandInterfaceProps {
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
  /** Enable hand tracking rotation */
  useTracking?: boolean
  /** Which hand to track */
  trackingHand?: 'Left' | 'Right' | 'auto'
  /** Rotation smoothing factor (0 = no smoothing, 1 = max smoothing) */
  smoothing?: number
}

export function RobotHandInterface({
  handModel,
  modelId: deprecatedModelId,
  scale: deprecatedScale,
  position: deprecatedPosition,
  rotation: deprecatedRotation,
  useTracking = true,
  trackingHand = 'Right',
  smoothing = 0.3,
}: RobotHandInterfaceProps) {
  // Use handModel if provided, otherwise fall back to individual props
  const modelId = handModel?.modelId ?? deprecatedModelId ?? 'linker-l10-right'
  const scale = handModel?.scale ?? deprecatedScale ?? 5
  const position = handModel?.position ?? deprecatedPosition ?? [0, 0, 0]
  const rotation = handModel?.rotation ?? deprecatedRotation ?? [0, 0, 0]
  const [robot, setRobot] = useState<THREE.Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get store action to set hand model and visibility state
  const setHandModel = useStore((state) => state.setHandModel)
  const isModelVisible = useStore((state) => state.urdf.isModelVisible)

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

        // Load hand metadata and create runtime state
        const metadata = getHandMetadata(modelId)
        if (metadata) {
          const handState = createHandState(metadata)
          setHandModel(metadata, handState)
          console.log('Hand metadata stored in Zustand:', metadata.id)
        }

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

  // If model is hidden, return null
  if (!isModelVisible) {
    return null
  }

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

/**
 * Get hand metadata by model ID
 */
function getHandMetadata(modelId: string) {
  // Map model IDs to their metadata
  const metadataMap: Record<string, typeof LINKER_L10_RIGHT> = {
    'linker-l10-right': LINKER_L10_RIGHT,
    // Add more models as they become available
  }

  return metadataMap[modelId] || LINKER_L10_RIGHT
}
