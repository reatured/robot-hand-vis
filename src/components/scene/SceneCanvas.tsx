'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import * as THREE from 'three'
import { RobotScene } from './RobotScene'

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
      <RobotScene />
      <Preload all />
    </Canvas>
  )
}
