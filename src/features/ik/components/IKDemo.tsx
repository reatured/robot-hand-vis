'use client'

/**
 * Interactive IK Demo Component
 * Demonstrates CCDIKSolver with both a simple chain demo and a robot hand
 */

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CCDIKSolver } from 'three-stdlib'
import { TransformControls } from '@react-three/drei'
import { useStore } from '@/store'
import { loadURDF } from '@/features/urdf/core/loader'
import { LINKER_L10_RIGHT } from '@/features/urdf/data/linker-l10-right'

export function IKDemo() {
  const isVisible = useStore((state) => state.ik.isIKDemoVisible)

  // Chain demo refs
  const chainGroupRef = useRef<THREE.Group>(null)
  const chainIKSolverRef = useRef<CCDIKSolver | null>(null)
  const chainMeshRef = useRef<THREE.SkinnedMesh | null>(null)
  const chainTargetRef = useRef<THREE.Bone | null>(null)
  const chainTargetMeshRef = useRef<THREE.Mesh>(null!)

  // Robot hand refs
  const handGroupRef = useRef<THREE.Group>(null)
  const handIKSolverRef = useRef<CCDIKSolver | null>(null)
  const handRobotRef = useRef<THREE.Group | null>(null)
  const handTargetMeshRef = useRef<THREE.Mesh>(null!)
  const handBonesRef = useRef<THREE.Bone[]>([])

  const [isDraggingChain, setIsDraggingChain] = useState(false)
  const [isDraggingHand, setIsDraggingHand] = useState(false)
  const [activeControl, setActiveControl] = useState<'chain' | 'hand'>('hand') // Default to hand
  const [isChainSetupComplete, setIsChainSetupComplete] = useState(false)
  const [isHandSetupComplete, setIsHandSetupComplete] = useState(false)

  // Setup chain demo
  useEffect(() => {
    console.log('IKDemo: Chain demo setup, isVisible =', isVisible)
    if (!isVisible || !chainGroupRef.current) return

    console.log('IKDemo: Setting up chain bones and mesh...')

    // Clean up previous mesh if it exists
    if (chainMeshRef.current) {
      chainMeshRef.current.geometry.dispose()
      if (Array.isArray(chainMeshRef.current.material)) {
        chainMeshRef.current.material.forEach((m: THREE.Material) => m.dispose())
      } else {
        chainMeshRef.current.material.dispose()
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
    chainTargetRef.current = targetBone

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
    chainMeshRef.current = mesh

    // Add mesh to group
    chainGroupRef.current.add(mesh)

    // Add skeleton helper for visualization
    const skeletonHelper = new THREE.SkeletonHelper(mesh)
    chainGroupRef.current.add(skeletonHelper)

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
    chainIKSolverRef.current = new CCDIKSolver(mesh, iks)

    // Initial IK update
    chainIKSolverRef.current.update()

    setIsChainSetupComplete(true)
    console.log('IKDemo: Chain setup complete!')

    // Cleanup function
    return () => {
      console.log('IKDemo: Chain cleaning up...')
      setIsChainSetupComplete(false)
      if (chainGroupRef.current) {
        while (chainGroupRef.current.children.length > 0) {
          const child = chainGroupRef.current.children[0]
          chainGroupRef.current.remove(child)
          if (child instanceof THREE.SkinnedMesh) {
            child.geometry.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach((m: THREE.Material) => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      }
    }
  }, [isVisible])

  // Setup robot hand demo
  useEffect(() => {
    console.log('IKDemo: Robot hand setup, isVisible =', isVisible)
    if (!isVisible || !handGroupRef.current) return

    let mounted = true

    async function setupRobotHand() {
      try {
        console.log('Loading robot hand for IK demo...')

        // Load the URDF robot hand
        const robotGroup = await loadURDF('/assets/robots/hands/linker_l10/right/linkerhand_l10_right.urdf', {
          scale: 5,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
        })

        if (!mounted || !handGroupRef.current) return

        handRobotRef.current = robotGroup
        handGroupRef.current.add(robotGroup)

        // Find the bones in the robot for the index finger
        const bones: THREE.Bone[] = []
        let skinnedMesh: THREE.SkinnedMesh | null = null

        // Find the skinned mesh and extract bones
        robotGroup.traverse((child) => {
          if (child instanceof THREE.SkinnedMesh && !skinnedMesh) {
            skinnedMesh = child
            if (child.skeleton) {
              bones.push(...child.skeleton.bones)
            }
          }
        })

        if (!skinnedMesh || bones.length === 0) {
          console.warn('No skinned mesh or bones found in robot hand')
          return
        }

        console.log('Found bones:', bones.map(b => b.name))
        handBonesRef.current = bones

        // Find index finger bones based on LINKER_L10_RIGHT metadata
        const indexJointNames = LINKER_L10_RIGHT.fingers.index?.joints.map(j => j.name) || []
        console.log('Expected index joints:', indexJointNames)

        // Find bone indices for index finger
        const indexBoneIndices: number[] = []
        indexJointNames.forEach(jointName => {
          const boneIndex = bones.findIndex(bone => bone.name === jointName || bone.name.includes(jointName))
          if (boneIndex !== -1) {
            indexBoneIndices.push(boneIndex)
          }
        })

        console.log('Index bone indices:', indexBoneIndices)

        if (indexBoneIndices.length < 2) {
          console.warn('Not enough index finger bones found for IK')
          return
        }

        // Create a target bone at the tip of the index finger
        const tipBone = bones[indexBoneIndices[indexBoneIndices.length - 1]]
        const targetBone = new THREE.Bone()
        targetBone.position.set(0, 0, 0.03) // Offset from tip
        tipBone.add(targetBone)
        bones.push(targetBone)

        // Setup IK solver for index finger
        const iks = [
          {
            target: bones.length - 1, // target bone (last added)
            effector: indexBoneIndices[indexBoneIndices.length - 1], // tip bone
            links: indexBoneIndices.slice(0, -1).reverse().map(index => ({ index, enabled: true })), // reverse order for CCD
            iteration: 10,
            minAngle: 0.0,
            maxAngle: Math.PI / 2,
          },
        ]

        handIKSolverRef.current = new CCDIKSolver(skinnedMesh, iks)
        handIKSolverRef.current.update()

        setIsHandSetupComplete(true)
        console.log('Robot hand IK setup complete!')
        console.log('HandTargetMeshRef current:', handTargetMeshRef.current)

      } catch (error) {
        console.error('Failed to setup robot hand IK:', error)
      }
    }

    setupRobotHand()

    return () => {
      mounted = false
      setIsHandSetupComplete(false)
      if (handGroupRef.current) {
        while (handGroupRef.current.children.length > 0) {
          const child = handGroupRef.current.children[0]
          handGroupRef.current.remove(child)
        }
      }
    }
  }, [isVisible])

  // Update target bones and IK solvers
  useFrame(() => {
    if (!isVisible) return

    // Update chain demo
    if (isChainSetupComplete && chainTargetRef.current && chainTargetMeshRef.current) {
      // Sync target bone position with draggable mesh position
      const worldPos = new THREE.Vector3()
      chainTargetMeshRef.current.getWorldPosition(worldPos)

      // Convert world position to local position relative to the root
      if (chainGroupRef.current) {
        chainGroupRef.current.worldToLocal(worldPos)
        chainTargetRef.current.position.copy(worldPos)
      }

      // Update IK solver
      chainIKSolverRef.current?.update()
    }

    // Update robot hand demo
    if (isHandSetupComplete && handTargetMeshRef.current && handIKSolverRef.current) {
      // Get the world position of the draggable target
      const worldPos = new THREE.Vector3()
      handTargetMeshRef.current.getWorldPosition(worldPos)

      // Convert to robot's local space
      if (handRobotRef.current) {
        handRobotRef.current.worldToLocal(worldPos)

        // Find the target bone and update its position
        const bones = handBonesRef.current
        if (bones.length > 0) {
          const targetBone = bones[bones.length - 1] // Last bone is our target
          targetBone.position.copy(worldPos)
        }
      }

      // Update IK solver
      handIKSolverRef.current.update()
    }
  })

  console.log('IKDemo render: isVisible =', isVisible,
    ', chainSetup =', isChainSetupComplete,
    ', handSetup =', isHandSetupComplete)

  if (!isVisible) return null

  return (
    <>
      {/* Control Toggle UI */}
      <group position={[0, 5, 0]}>
        <mesh
          position={[-2, 0, 0]}
          onClick={() => setActiveControl('chain')}
        >
          <boxGeometry args={[2, 0.5, 0.2]} />
          <meshStandardMaterial
            color={activeControl === 'chain' ? '#00ff00' : '#666666'}
          />
        </mesh>
        <mesh
          position={[2, 0, 0]}
          onClick={() => setActiveControl('hand')}
        >
          <boxGeometry args={[2, 0.5, 0.2]} />
          <meshStandardMaterial
            color={activeControl === 'hand' ? '#00ff00' : '#666666'}
          />
        </mesh>
      </group>

      {/* Chain Demo */}
      <group ref={chainGroupRef} position={[-15, 2, 0]}>
        {/* The mesh and skeleton are added via useEffect */}

        {/* Draggable target sphere for chain */}
        <mesh ref={chainTargetMeshRef} position={[0, 32, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={isDraggingChain ? '#ff6b6b' : (activeControl === 'chain' ? '#4ecdc4' : '#666666')}
            emissive={isDraggingChain ? '#ff0000' : (activeControl === 'chain' ? '#00ffff' : '#000000')}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Transform controls for dragging chain target */}
        {activeControl === 'chain' && isChainSetupComplete && chainTargetMeshRef.current && (
          <TransformControls
            object={chainTargetMeshRef.current}
            mode="translate"
            onMouseDown={() => setIsDraggingChain(true)}
            onMouseUp={() => setIsDraggingChain(false)}
          />
        )}
      </group>

      {/* Robot Hand Demo */}
      <group ref={handGroupRef} position={[15, 0, 0]}>
        {/* The robot hand is added via useEffect */}

        {/* Draggable target sphere for robot hand fingertip - Always draggable */}
        <mesh ref={handTargetMeshRef} position={[0, 2, 1]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={isDraggingHand ? '#ff6b6b' : (activeControl === 'hand' ? '#ffff00' : '#666666')}
            emissive={isDraggingHand ? '#ff0000' : (activeControl === 'hand' ? '#ffaa00' : '#000000')}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Transform controls for dragging hand target - only when active */}
        {activeControl === 'hand' && (
          <TransformControls
            object={handTargetMeshRef}
            mode="translate"
            onMouseDown={() => setIsDraggingHand(true)}
            onMouseUp={() => setIsDraggingHand(false)}
          />
        )}
      </group>
    </>
  )
}
