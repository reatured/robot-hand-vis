'use client'

import { OrbitControls, Grid, Text } from '@react-three/drei'
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
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <directionalLight position={[0, -5, 0]} intensity={0.3} />

      {/* Grid helper for ground reference */}
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* Directional labels for scene orientation */}
      <Text
        position={[0, 0.1, -10]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        FRONT
      </Text>
      <Text
        position={[0, 0.1, 10]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.5}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        BACK
      </Text>
      <Text
        position={[-10, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.5}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        LEFT
      </Text>
      <Text
        position={[10, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.5}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        RIGHT
      </Text>

      {/* Robot Hand Interface - Linker L10 Right with Skeleton Overlay */}
      <RobotHandInterface handModel={handModel} />

      <MimicHand handModel={handModel} />

      {/* IK Demo */}
      <IKDemo />

      {/* Orbit controls for camera interaction */}
      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0.5, 0]}
      />
    </>
  )
}
