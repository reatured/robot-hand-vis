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

  /** Local position (relative to parent) from URDF joint origin */
  position: THREE.Vector3

  /** Local rotation (relative to parent) */
  rotation: THREE.Quaternion

  /** World position at load time (for palm metrics calculation) */
  worldPosition: THREE.Vector3

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

/**
 * Skeleton joint data - single source of truth for joint transforms
 * Stores LOCAL transforms (relative to parent), world positions computed dynamically
 */
export interface SkeletonJoint {
  /** Joint name */
  name: string

  /** LOCAL position (relative to parent) - single source of truth */
  position: THREE.Vector3

  /** LOCAL rotation quaternion (relative to parent) - single source of truth */
  rotation: THREE.Quaternion

  /** Parent joint name (null for root) */
  parentName: string | null

  /** Joint type */
  type: JointType

  /** Reference to the Three.js Object3D (for syncing model) */
  object3D?: THREE.Object3D
}

/**
 * Palm dimensions calculated from model
 */
export interface PalmDimensions {
  /** Palm width (index to pinky base distance) */
  width: number

  /** Palm length (wrist to middle finger base distance) */
  length: number

  /** Wrist position */
  wristPosition: THREE.Vector3

  /** Base joint positions for each finger */
  baseJoints: {
    thumb?: THREE.Vector3
    index?: THREE.Vector3
    middle?: THREE.Vector3
    ring?: THREE.Vector3
    pinky?: THREE.Vector3
  }
}

/**
 * Complete skeleton data - single source of truth for robot state
 */
export interface RobotSkeletonData {
  /** All skeleton joints */
  joints: SkeletonJoint[]

  /** Palm dimensions */
  palmDimensions: PalmDimensions

  /** Root position */
  rootPosition: THREE.Vector3

  /** Root rotation */
  rootRotation: THREE.Euler
}
