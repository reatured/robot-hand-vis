/**
 * URDF Feature Type Definitions
 */

import * as THREE from 'three'

/**
 * Joint type from URDF specification
 */
export type JointType = 'revolute' | 'continuous' | 'prismatic' | 'fixed' | 'floating' | 'planar'

/**
 * Joint limit information from URDF
 */
export interface JointLimit {
  lower: number
  upper: number
  effort: number
  velocity: number
}

/**
 * Complete joint information extracted from URDF
 */
export interface UrdfJointInfo {
  /** Joint name from URDF */
  name: string

  /** Joint type (revolute, continuous, prismatic, etc.) */
  type: JointType

  /** Rotation/translation axis direction [x, y, z] */
  axis: THREE.Vector3

  /** Joint limits (lower, upper, effort, velocity) */
  limits: JointLimit | null

  /** Current joint angle (radians) or position (meters) */
  currentAngle: number

  /** Joint origin position in world coordinates */
  position: THREE.Vector3

  /** Parent link name */
  parentLink: string

  /** Child link name */
  childLink: string

  /** Reference to the Three.js Object3D representing this joint */
  object3D?: THREE.Object3D
}

/**
 * Parsed URDF robot model data
 */
export interface ParsedUrdfData {
  /** All joints in the robot */
  joints: UrdfJointInfo[]

  /** Robot name from URDF */
  robotName: string

  /** Root Three.js object */
  rootObject: THREE.Group
}
