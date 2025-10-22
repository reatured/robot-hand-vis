'use client'

import { OrbitControls, Grid } from '@react-three/drei'
import { RobotHand } from '@/features/urdf/components/RobotHand'
import { DebugAxes } from '@/features/debug/components/DebugAxes'

export function RobotScene() {
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

      {/* Robot Hand - Linker L10 Right */}
      <RobotHand
        modelId="linker-l10-right"
        scale={5}
        position={[0, 0.5, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Debug Axes Visualization */}
      <DebugAxes />

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
