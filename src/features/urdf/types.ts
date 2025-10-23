/**
 * URDF Feature Type Definitions
 */

import * as THREE from 'three'

/**
 * Joint type from URDF specification
 */
export type JointType = 'revolute' | 'continuous' | 'prismatic' | 'fixed' | 'floating' | 'planar'

/**
 * Handedness of the robot hand
 */
export type Handedness = 'left' | 'right'

/**
 * Finger names in a robot hand
 */
export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'

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

// ============================================================================
// ROBOT HAND METADATA - Pre-processed from URDF
// ============================================================================

/**
 * Joint metadata extracted from URDF
 * Immutable reference data - does not include runtime state
 */
export interface JointMetadata {
  /** Joint name from URDF (e.g., "thumb_cmc_roll") */
  name: string

  /** Joint type (revolute, continuous, prismatic, etc.) */
  type: JointType

  /** Local position [x, y, z] relative to parent link */
  position: [number, number, number]

  /** Rotation/translation axis direction [x, y, z] */
  axis: [number, number, number]

  /** Joint limits (null for continuous/fixed joints) */
  limits: {
    lower: number
    upper: number
    effort: number
    velocity: number
  } | null

  /** Parent link name */
  parentLink: string

  /** Child link name */
  childLink: string
}

/**
 * Finger metadata - contains array of joints for one finger
 * Different fingers may have different numbers of joints
 */
export interface FingerMetadata {
  /** Finger name (thumb, index, middle, ring, pinky) */
  name: FingerName

  /** Ordered array of joints from base to tip */
  joints: JointMetadata[]
}

/**
 * Complete robot hand metadata parsed from URDF
 * This is immutable reference data - runtime state is managed separately
 */
export interface RobotHandMetadata {
  /** Unique identifier (e.g., "linker-l10-right") */
  id: string

  /** Display name (e.g., "Linker L10 Right Hand") */
  name: string

  /** Manufacturer/brand name (e.g., "Linker") */
  brand: string

  /** Model designation (e.g., "L10") */
  model: string

  /** Left or right hand */
  handedness: Handedness

  /** Path to original URDF file (for reference/debugging) */
  urdfPath: string

  /** Optional preview image path */
  previewImage?: string

  /** Base link name from URDF (root of the hand) */
  baseLink: string

  /** Finger data - not all hands have all fingers */
  fingers: {
    thumb?: FingerMetadata
    index?: FingerMetadata
    middle?: FingerMetadata
    ring?: FingerMetadata
    pinky?: FingerMetadata
  }
}

/**
 * Runtime joint state - combines metadata with current value
 */
export interface JointState {
  /** Immutable metadata */
  metadata: JointMetadata

  /** Current joint angle (radians) or position (meters) */
  currentValue: number
}

/**
 * Runtime robot hand state - cloned from metadata for each instance
 */
export interface RobotHandState {
  /** Reference to source metadata */
  metadata: RobotHandMetadata

  /** Map of joint name → joint state for fast lookup */
  joints: Map<string, JointState>
}
