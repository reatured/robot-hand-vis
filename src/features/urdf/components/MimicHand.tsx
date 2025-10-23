'use client'

/**
 * Mimic Hand Component
 * A debug feature that displays a hand model mimicking user hand movements in real-time
 */

import { HandModel } from '@/features/scene/components/RobotScene'

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
  // Empty structure - ready for implementation
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Placeholder - will be replaced with actual hand model */}
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
    </group>
  )
}
