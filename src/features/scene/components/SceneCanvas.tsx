'use client'

import { Canvas } from '@react-three/fiber'
import { Preload, OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'
// import { RobotScene } from './RobotScene'
import { DemoScene } from './DemoScene'

export function SceneCanvas() {
  return (
    <Canvas
      shadows
      camera={{
        position: [3, 3, 5],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      onCreated={(state) => {
        state.gl.toneMapping = THREE.AgXToneMapping
        state.gl.toneMappingExposure = 1
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    >
      {/* Universal Scene Setup - Shared across all scenes */}

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

      {/* Orbit controls for camera interaction */}
      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0.5, 0]}
      />

      {/* Scene Components */}
      {/* <RobotScene /> */}
      <DemoScene />

      <Preload all />
    </Canvas>
  )
}
