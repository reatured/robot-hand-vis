'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CCDIKSolver } from 'three-stdlib'
import { TransformControls } from '@react-three/drei'
import { useStore } from '@/store'
import { RobotHandInterface } from '@/features/urdf/components/RobotHandInterface'
import { HandModel } from './RobotScene'

/**
 * Demo Scene Component
 * A simplified scene showcasing just the robot hand model
 */
export function DemoScene() {
  // Hand model configuration
  const handModel: HandModel = {
    modelId: 'linker-l10-right',
    scale: 5,
    position: [0, 0.5, 0],
    rotation: [0, 0, 0],
  }

  // Get hand metadata from store
  const handMetadata = useStore((state) => state.urdf.handMetadata)

  // Bone chain refs and state
  const boneGroupRef = useRef<THREE.Group>(null)
  const ikSolverRef = useRef<CCDIKSolver | null>(null)
  const bonesRef = useRef<THREE.Bone[]>([])
  const targetMeshRef = useRef<THREE.Mesh>(null!)
  const skinnedMeshRef = useRef<THREE.SkinnedMesh | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [controlMode, setControlMode] = useState<'translate' | 'rotate'>('translate')

  // Setup bone structure from zustand store
  useEffect(() => {
    if (!handMetadata) {
      console.log('DemoScene: Waiting for handMetadata...')
      return
    }

    console.log('DemoScene: handMetadata loaded:', handMetadata.id)

    // Get index finger joint data
    const indexFinger = handMetadata.fingers.index
    if (!indexFinger || indexFinger.joints.length === 0) {
      console.warn('DemoScene: No index finger data found')
      return
    }

    console.log('=== INDEX FINGER JOINT DATA ===')
    console.log('Total joints:', indexFinger.joints.length)
    indexFinger.joints.forEach((joint, i) => {
      console.log(`  Joint ${i}: ${joint.name}`)
      console.log(`    Position: [${joint.position[0].toFixed(4)}, ${joint.position[1].toFixed(4)}, ${joint.position[2].toFixed(4)}]`)
      console.log(`    Parent: ${joint.parentLink}`)
      console.log(`    Child: ${joint.childLink}`)
    })

    // Create bone hierarchy
    const bones: THREE.Bone[] = []

    // Root bone at origin
    const rootBone = new THREE.Bone()
    rootBone.name = 'root'
    rootBone.position.set(0, 0, 0)
    bones.push(rootBone)

    console.log('=== CREATING BONE HIERARCHY ===')
    console.log('Bone 0: root at [0, 0, 0]')

    // Create a bone for each joint
    let prevBone = rootBone
    indexFinger.joints.forEach((joint, index) => {
      const bone = new THREE.Bone()
      bone.name = joint.name
      bone.position.set(joint.position[0], joint.position[1], joint.position[2])
      bones.push(bone)
      prevBone.add(bone)

      console.log(`Bone ${index + 1}: ${joint.name}`)
      console.log(`  Local position: [${joint.position[0].toFixed(4)}, ${joint.position[1].toFixed(4)}, ${joint.position[2].toFixed(4)}]`)
      console.log(`  Parent bone: ${prevBone.name}`)

      prevBone = bone
    })

    // Store bones
    bonesRef.current = bones

    console.log('=== BONE STRUCTURE COMPLETE ===')
    console.log('Total bones created:', bones.length)

    // Log world positions (need to update matrices first)
    rootBone.updateMatrixWorld(true)
    console.log('=== WORLD POSITIONS ===')
    bones.forEach((bone, i) => {
      const worldPos = new THREE.Vector3()
      bone.getWorldPosition(worldPos)
      console.log(`Bone ${i} (${bone.name}): [${worldPos.x.toFixed(4)}, ${worldPos.y.toFixed(4)}, ${worldPos.z.toFixed(4)}]`)
    })

    setIsSetupComplete(true)

    // Cleanup
    return () => {
      console.log('DemoScene: Cleaning up bones...')
      bonesRef.current = []
      setIsSetupComplete(false)
    }
  }, [handMetadata])

  // Update last bone based on target mesh position and rotation
  useFrame(() => {
    if (!isSetupComplete || !targetMeshRef.current || bonesRef.current.length === 0) {
      return
    }

    const lastBone = bonesRef.current[bonesRef.current.length - 1]
    if (!lastBone || !boneGroupRef.current) return

    // Get target mesh world position and rotation
    const worldPos = new THREE.Vector3()
    const worldQuat = new THREE.Quaternion()
    targetMeshRef.current.getWorldPosition(worldPos)
    targetMeshRef.current.getWorldQuaternion(worldQuat)

    // Convert to bone group's local space
    boneGroupRef.current.worldToLocal(worldPos)

    // Convert world quaternion to local
    const groupWorldQuat = new THREE.Quaternion()
    boneGroupRef.current.getWorldQuaternion(groupWorldQuat)
    const localQuat = groupWorldQuat.clone().invert().multiply(worldQuat)

    // Update last bone's position and rotation
    lastBone.position.copy(worldPos)
    lastBone.quaternion.copy(localQuat)

    // Update matrices
    lastBone.updateMatrixWorld(true)
  })

  return (
    <>
      {/* Robot Hand - Linker L10 Right */}
      <RobotHandInterface handModel={handModel} />

      {/* Bone Visualization */}
      <group ref={boneGroupRef} position={[0, 0.5, 0]} scale={5}>
        {/* Render spheres at each bone position */}
        {isSetupComplete && bonesRef.current.length > 0 && (
          <>
            {bonesRef.current.map((bone, index) => {
              // Get world position of bone
              const position = new THREE.Vector3()
              bone.getWorldPosition(position)

              return (
                <mesh key={`bone-${index}-${bone.name}`} position={position}>
                  <sphereGeometry args={[0.01, 16, 16]} />
                  <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              )
            })}
          </>
        )}

        {/* Target mesh for last bone - draggable control */}
        {isSetupComplete && bonesRef.current.length > 0 && (
          <>
            {(() => {
              const lastBone = bonesRef.current[bonesRef.current.length - 1]
              const position = new THREE.Vector3()
              lastBone.getWorldPosition(position)

              return (
                <mesh ref={targetMeshRef} position={position}>
                  <sphereGeometry args={[0.015, 16, 16]} />
                  <meshStandardMaterial
                    color={isDragging ? '#ff6b6b' : '#ffff00'}
                    emissive={isDragging ? '#ff0000' : '#ffaa00'}
                    emissiveIntensity={0.7}
                  />
                </mesh>
              )
            })()}

            {/* Transform controls for position and rotation */}
            <TransformControls
              object={targetMeshRef.current}
              mode={controlMode}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
            />
          </>
        )}
      </group>

      {/* Control mode toggle UI */}
      {isSetupComplete && (
        <group position={[0, 2, 0]}>
          {/* Translate button */}
          <mesh
            position={[-0.3, 0, 0]}
            onClick={() => setControlMode('translate')}
          >
            <boxGeometry args={[0.25, 0.1, 0.05]} />
            <meshStandardMaterial
              color={controlMode === 'translate' ? '#00ff00' : '#666666'}
              emissive={controlMode === 'translate' ? '#00ff00' : '#000000'}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Rotate button */}
          <mesh
            position={[0.3, 0, 0]}
            onClick={() => setControlMode('rotate')}
          >
            <boxGeometry args={[0.25, 0.1, 0.05]} />
            <meshStandardMaterial
              color={controlMode === 'rotate' ? '#00ff00' : '#666666'}
              emissive={controlMode === 'rotate' ? '#00ff00' : '#000000'}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}
    </>
  )
}
