/**
 * Robot Joint Group Component
 * Visualizes robot hand joint positions and rotation axes using arrow helpers and spheres
 */

import type { RobotHandMetadata, JointMetadata } from '@/features/urdf/types'
import * as THREE from 'three'

/**
 * Build a lookup map for joints by child link name
 */
function buildJointLookup(metadata: RobotHandMetadata): Map<string, JointMetadata> {
  const jointByChildLink = new Map<string, JointMetadata>()

  Object.values(metadata.fingers).forEach((finger) => {
    if (finger) {
      finger.joints.forEach((j) => {
        jointByChildLink.set(j.childLink, j)
      })
    }
  })

  return jointByChildLink
}

/**
 * Get parent chain from joint to base link
 */
function getParentChain(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): JointMetadata[] {
  const chain: JointMetadata[] = []
  let currentJoint: JointMetadata | undefined = joint

  while (currentJoint) {
    chain.push(currentJoint)

    if (currentJoint.parentLink === metadata.baseLink) {
      break
    }

    currentJoint = jointLookup.get(currentJoint.parentLink)
  }

  return chain.reverse() // Base to target order
}

/**
 * Compute world position of a joint by traversing parent chain
 * Accumulates positions from the joint up to the base link
 */
function computeWorldPosition(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): [number, number, number] {
  const chain = getParentChain(joint, metadata, jointLookup)

  let worldX = 0
  let worldY = 0
  let worldZ = 0

  for (const j of chain) {
    worldX += j.position[0]
    worldY += j.position[1]
    worldZ += j.position[2]
  }

  return [worldX, worldY, worldZ]
}

/**
 * Compute world rotation (quaternion) by accumulating parent rotations
 * Returns the accumulated rotation from base to this joint
 */
function computeWorldRotation(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): THREE.Quaternion {
  const chain = getParentChain(joint, metadata, jointLookup)

  // Start with identity rotation
  const worldQuat = new THREE.Quaternion()

  // For each joint in chain, we would need to apply its rotation
  // However, URDF joint positions are defined in the parent frame
  // The axis directions are also in the parent frame
  // For now, we'll just return identity since we need the actual joint angles
  // to compute the full rotation (which we don't have in metadata)

  return worldQuat
}

/**
 * Transform axis direction by accumulated parent rotations
 */
function computeWorldAxisDirection(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): THREE.Vector3 {
  // Get local axis direction
  const localAxis = new THREE.Vector3(...joint.axis)

  // Get accumulated rotation
  const worldRot = computeWorldRotation(joint, metadata, jointLookup)

  // Transform axis by world rotation
  return localAxis.applyQuaternion(worldRot)
}

interface RobotJointGroupProps {
  handMetadata: RobotHandMetadata
}

/**
 * Renders robot hand joint rotation axes and positions
 */
export function RobotJointGroup({ handMetadata }: RobotJointGroupProps) {
  const jointLookup = buildJointLookup(handMetadata)

  // Color schemes for each finger
  const fingerColors: Record<string, number[]> = {
    thumb: [
      0xff0000, // cmc_roll - bright red
      0xff4500, // cmc_yaw - orange red
      0xff8c00, // cmc_pitch - dark orange
      0xffa500, // mcp - orange
      0xffd700, // ip - gold
    ],
    index: [
      0xffff00, // mcp - yellow
      0xffcc00, // pip - gold yellow
      0xff9900, // dip - orange yellow
    ],
    middle: [
      0x00ff00, // mcp - green
      0x00cc00, // pip - darker green
      0x009900, // dip - even darker green
    ],
    ring: [
      0x00ffff, // mcp - cyan
      0x00ccff, // pip - light blue
      0x0099ff, // dip - blue
    ],
    pinky: [
      0xff00ff, // mcp - magenta
      0xcc00ff, // pip - purple
      0x9900ff, // dip - violet
    ],
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Iterate through all fingers */}
      {Object.entries(handMetadata.fingers).map(([fingerName, fingerMetadata]) => {
        if (!fingerMetadata) return null

        const colors = fingerColors[fingerName] || [0xffffff]

        return fingerMetadata.joints.map((joint, index) => {
          // Compute world position and axis direction
          const worldPos = computeWorldPosition(joint, handMetadata, jointLookup)
          const worldAxis = computeWorldAxisDirection(joint, handMetadata, jointLookup)

          // Line length for visualization
          const lineLength = 0.03

          // Create arrow helper to visualize rotation axis
          const arrowHelper = new THREE.ArrowHelper(
            worldAxis.normalize(),
            new THREE.Vector3(...worldPos),
            lineLength,
            colors[index] || 0xffffff,
            lineLength * 0.25, // Head length
            lineLength * 0.2   // Head width
          )

          return (
            <group key={joint.name}>
              <primitive object={arrowHelper} />
              {/* Small sphere at joint position */}
              <mesh position={worldPos}>
                <sphereGeometry args={[0.005, 8, 8]} />
                <meshBasicMaterial
                  color={colors[index] || 0xffffff}
                />
              </mesh>
            </group>
          )
        })
      })}
    </group>
  )
}
