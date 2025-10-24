'use client'

/**
 * Interactive IK Demo Component
 * Demonstrates CCDIKSolver with a draggable target endpoint
 */

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CCDIKSolver } from 'three-stdlib'
import { TransformControls } from '@react-three/drei'
import { useStore } from '@/store'

export function IKDemo() {
  const isVisible = useStore((state) => state.ik.isIKDemoVisible)
  const groupRef = useRef<THREE.Group>(null)
  const ikSolverRef = useRef<CCDIKSolver | null>(null)
  const meshRef = useRef<THREE.SkinnedMesh | null>(null)
  const targetRef = useRef<THREE.Bone | null>(null)
  const targetMeshRef = useRef<THREE.Mesh>(null!)
  const [isDragging, setIsDragging] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)

  useEffect(() => {
    console.log('IKDemo: isVisible =', isVisible)
    if (!isVisible || !groupRef.current) return

    console.log('IKDemo: Setting up bones and mesh...')

    // Clean up previous mesh if it exists
    if (meshRef.current) {
      meshRef.current.geometry.dispose()
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((m) => m.dispose())
      } else {
        meshRef.current.material.dispose()
      }
    }

    //
    // Bones hierarchy:
    //
    //   root
    //     ├── bone0
    //     │    └── bone1
    //     │          └── bone2
    //     │                └── bone3
    //     └── target
    //

    const bones: THREE.Bone[] = []

    // "root"
    const rootBone = new THREE.Bone()
    rootBone.position.y = -12
    bones.push(rootBone)

    // "bone0"
    let prevBone = new THREE.Bone()
    prevBone.position.y = 0
    rootBone.add(prevBone)
    bones.push(prevBone)

    // "bone1", "bone2", "bone3"
    for (let i = 1; i <= 3; i++) {
      const bone = new THREE.Bone()
      bone.position.y = 8
      bones.push(bone)

      prevBone.add(bone)
      prevBone = bone
    }

    // "target" - starting position above the chain
    const targetBone = new THREE.Bone()
    targetBone.position.set(0, 32, 0)
    rootBone.add(targetBone)
    bones.push(targetBone)
    targetRef.current = targetBone

    //
    // skinned mesh
    //

    const geometry = new THREE.CylinderGeometry(5, 5, 32, 8, 16)
    geometry.translate(0, 0, 0)

    // Create skin indices and weights
    const position = geometry.attributes.position
    const skinIndices: number[] = []
    const skinWeights: number[] = []

    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i)

      let skinIndex = 0
      if (y < -8) skinIndex = 0 // root
      else if (y < 0) skinIndex = 1 // bone0
      else if (y < 8) skinIndex = 2 // bone1
      else if (y < 16) skinIndex = 3 // bone2
      else skinIndex = 4 // bone3

      skinIndices.push(skinIndex, 0, 0, 0)
      skinWeights.push(1, 0, 0, 0)
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))

    const material = new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true,
    })

    const mesh = new THREE.SkinnedMesh(geometry, material)
    const skeleton = new THREE.Skeleton(bones)

    mesh.add(bones[0]) // "root" bone
    mesh.bind(skeleton)
    meshRef.current = mesh

    // Add mesh to group
    groupRef.current.add(mesh)

    // Add skeleton helper for visualization
    const skeletonHelper = new THREE.SkeletonHelper(mesh)
    groupRef.current.add(skeletonHelper)

    //
    // ikSolver
    //

    const iks = [
      {
        target: 5, // "target" bone index
        effector: 4, // "bone3" bone index
        links: [
          { index: 3, enabled: true },
          { index: 2, enabled: true },
          { index: 1, enabled: true },
        ], // "bone2", "bone1", "bone0"
        iteration: 10,
        minAngle: 0.0,
        maxAngle: 1.0,
      },
    ]
    ikSolverRef.current = new CCDIKSolver(mesh, iks)

    // Initial IK update
    ikSolverRef.current.update()

    setIsSetupComplete(true)
    console.log('IKDemo: Setup complete!')

    // Cleanup function
    return () => {
      console.log('IKDemo: Cleaning up...')
      setIsSetupComplete(false)
      if (groupRef.current) {
        while (groupRef.current.children.length > 0) {
          const child = groupRef.current.children[0]
          groupRef.current.remove(child)
          if (child instanceof THREE.SkinnedMesh) {
            child.geometry.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      }
    }
  }, [isVisible])

  // Update target bone position and IK solver
  useFrame(() => {
    if (!isVisible || !isSetupComplete || !targetRef.current || !targetMeshRef.current) return

    // Sync target bone position with draggable mesh position
    const worldPos = new THREE.Vector3()
    targetMeshRef.current.getWorldPosition(worldPos)

    // Convert world position to local position relative to the root
    if (groupRef.current) {
      groupRef.current.worldToLocal(worldPos)
      targetRef.current.position.copy(worldPos)
    }

    // Update IK solver
    ikSolverRef.current?.update()
  })

  console.log('IKDemo render: isVisible =', isVisible, ', isSetupComplete =', isSetupComplete)

  if (!isVisible) return null

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      {/* The mesh and skeleton are added via useEffect */}

      {/* Draggable target sphere */}
      <mesh ref={targetMeshRef} position={[0, 32, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={isDragging ? '#ff6b6b' : '#4ecdc4'}
          emissive={isDragging ? '#ff0000' : '#00ffff'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Transform controls for dragging */}
      {isSetupComplete && (
        <TransformControls
          object={targetMeshRef.current}
          mode="translate"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        />
      )}
    </group>
  )
}
