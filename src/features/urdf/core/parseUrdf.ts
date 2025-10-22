/**
 * URDF Parser - Extract joint information from loaded URDF models
 */

import * as THREE from 'three'
import { UrdfJointInfo, JointType, JointLimit, ParsedUrdfData } from '../types'

/**
 * Parse a loaded URDF robot model and extract all joint information
 *
 * @param robot - The loaded URDF robot (THREE.Group with joints and links)
 * @param robotName - Name of the robot
 * @returns ParsedUrdfData with all joints and metadata
 */
export function parseUrdfJoints(robot: THREE.Group, robotName: string): ParsedUrdfData {
  const joints: UrdfJointInfo[] = []

  // Traverse the robot hierarchy to find all joints
  robot.traverse((object) => {
    // Check if this object has joint metadata (added by urdf-loader)
    const jointData = (object as any).jointType

    if (jointData !== undefined) {
      const jointInfo = extractJointInfo(object)
      if (jointInfo) {
        joints.push(jointInfo)
      }
    }
  })

  return {
    joints,
    robotName,
    rootObject: robot,
  }
}

/**
 * Extract joint information from a Three.js object with URDF joint metadata
 */
function extractJointInfo(object: THREE.Object3D): UrdfJointInfo | null {
  const joint = object as any

  // Extract basic joint info
  const name = joint.name || 'unnamed_joint'
  const type = normalizeJointType(joint.jointType)

  // Extract axis in local coordinates (default to [0, 1, 0] if not specified)
  const axisData = joint.axis || { x: 0, y: 1, z: 0 }
  const localAxis = new THREE.Vector3(axisData.x || 0, axisData.y || 1, axisData.z || 0)

  // Transform axis from local joint coordinates to world coordinates
  // This is critical for joints with complex parent transformations (e.g., thumb)
  const worldAxis = new THREE.Vector3()
  const worldQuaternion = new THREE.Quaternion()
  object.getWorldQuaternion(worldQuaternion) // Get accumulated rotation from all parents
  worldAxis.copy(localAxis).applyQuaternion(worldQuaternion).normalize()

  const axis = worldAxis

  // Extract limits
  let limits: JointLimit | null = null
  if (joint.limit) {
    limits = {
      lower: joint.limit.lower ?? -Math.PI,
      upper: joint.limit.upper ?? Math.PI,
      effort: joint.limit.effort ?? 0,
      velocity: joint.limit.velocity ?? 0,
    }
  }

  // Get current angle/position (default to 0)
  const currentAngle = joint.angle ?? 0

  // Get world position
  const position = new THREE.Vector3()
  object.getWorldPosition(position)

  // Get parent and child link names
  const parentLink = joint.parent?.name || 'unknown_parent'
  const childLink = object.children.find((c: any) => c.isURDFLink)?.name || 'unknown_child'

  return {
    name,
    type,
    axis,
    limits,
    currentAngle,
    position,
    parentLink,
    childLink,
    object3D: object,
  }
}

/**
 * Normalize joint type string to JointType enum
 */
function normalizeJointType(typeStr: string): JointType {
  const normalized = (typeStr || 'fixed').toLowerCase()

  switch (normalized) {
    case 'revolute':
      return 'revolute'
    case 'continuous':
      return 'continuous'
    case 'prismatic':
      return 'prismatic'
    case 'fixed':
      return 'fixed'
    case 'floating':
      return 'floating'
    case 'planar':
      return 'planar'
    default:
      console.warn(`Unknown joint type: ${typeStr}, defaulting to 'fixed'`)
      return 'fixed'
  }
}

/**
 * Get the color for a joint based on its type
 */
export function getJointTypeColor(type: JointType): number {
  switch (type) {
    case 'revolute':
      return 0x00ffff // cyan
    case 'continuous':
      return 0xffff00 // yellow
    case 'prismatic':
      return 0xff00ff // magenta
    case 'fixed':
      return 0x808080 // gray
    case 'floating':
      return 0x00ff00 // green
    case 'planar':
      return 0x0000ff // blue
    default:
      return 0xffffff // white
  }
}

/**
 * Determine which finger a joint belongs to based on its name
 */
export function getJointFinger(jointName: string): 'thumb' | 'index' | 'middle' | 'ring' | 'pinky' | 'other' {
  const name = jointName.toLowerCase()

  if (name.includes('thumb')) return 'thumb'
  if (name.includes('index')) return 'index'
  if (name.includes('middle')) return 'middle'
  if (name.includes('ring')) return 'ring'
  if (name.includes('pinky') || name.includes('little')) return 'pinky'

  return 'other'
}
