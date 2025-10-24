'use client'

import { RobotHandInterface } from '@/features/urdf/components/RobotHandInterface'
import { MimicHand } from '@/features/urdf/components/MimicHand'
import { RobotHandState } from '@/features/urdf/types'
import { IKDemo } from '@/features/ik/components/IKDemo'

export interface HandModel {
  modelId: string
  scale: number
  position: [number, number, number]
  rotation: [number, number, number]
}

export function RobotScene() {
  // Hand model configuration - synced across RobotHandInterface and MimicHand
  const handModel: HandModel = {
    modelId: 'linker-l10-right',
    scale: 5,
    position: [0, 0.5, 0],
    rotation: [0, 0, 0],
  }
  return (
    <>
      {/* Robot Hand Interface - Linker L10 Right with Skeleton Overlay */}
      <RobotHandInterface handModel={handModel} />

      <MimicHand handModel={handModel} />

      {/* IK Demo */}
      <IKDemo />
    </>
  )
}
