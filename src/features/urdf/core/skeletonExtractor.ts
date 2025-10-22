/**
 * Skeleton Data Extractor
 * Extracts skeleton data from loaded URDF model
 */

import * as THREE from 'three'
import { UrdfJointInfo, RobotSkeletonData, SkeletonJoint } from '../types'
import { calculatePalmDimensions } from './palmMetrics'

/**
 * Extract complete skeleton data from loaded URDF robot
 *
 * @param robot - The loaded URDF robot (THREE.Group)
 * @param joints - Parsed joint information from URDF
 * @param rootPosition - Initial root position
 * @param rootRotation - Initial root rotation
 * @returns Complete skeleton data
 */
export function extractSkeletonData(
  robot: THREE.Group,
  joints: UrdfJointInfo[],
  rootPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
  rootRotation: THREE.Euler = new THREE.Euler(0, 0, 0)
): RobotSkeletonData {
  // Convert UrdfJointInfo to SkeletonJoint format
  // SkeletonJoint stores LOCAL transforms (relative to parent) as single source of truth
  const skeletonJoints: SkeletonJoint[] = joints.map((joint) => {
    // Determine parent joint name
    const parentName = findParentJointName(joint, joints)

    return {
      name: joint.name,
      position: joint.position.clone(), // LOCAL position from URDF
      rotation: joint.rotation.clone(), // LOCAL rotation from URDF
      parentName,
      type: joint.type,
      object3D: joint.object3D,
    }
  })

  // Calculate palm dimensions
  const palmDimensions = calculatePalmDimensions(joints)

  return {
    joints: skeletonJoints,
    palmDimensions,
    rootPosition: rootPosition.clone(),
    rootRotation: rootRotation.clone(),
  }
}

/**
 * Find the parent joint name for a given joint
 * Uses the parentLink name to find the joint that has this link as its childLink
 */
function findParentJointName(joint: UrdfJointInfo, allJoints: UrdfJointInfo[]): string | null {
  // Find the joint whose childLink matches this joint's parentLink
  const parentJoint = allJoints.find((j) => j.childLink === joint.parentLink)

  return parentJoint ? parentJoint.name : null
}

/**
 * Build parent-child hierarchy map
 * Returns a map of joint name -> array of child joint names
 */
export function buildJointHierarchy(
  skeletonJoints: SkeletonJoint[]
): Map<string | null, SkeletonJoint[]> {
  const hierarchy = new Map<string | null, SkeletonJoint[]>()

  for (const joint of skeletonJoints) {
    const children = hierarchy.get(joint.parentName) || []
    children.push(joint)
    hierarchy.set(joint.parentName, children)
  }

  return hierarchy
}

/**
 * Get all child joints recursively
 */
export function getChildJoints(
  jointName: string,
  skeletonJoints: SkeletonJoint[],
  hierarchy?: Map<string | null, SkeletonJoint[]>
): SkeletonJoint[] {
  if (!hierarchy) {
    hierarchy = buildJointHierarchy(skeletonJoints)
  }

  const children = hierarchy.get(jointName) || []
  const allChildren: SkeletonJoint[] = [...children]

  for (const child of children) {
    allChildren.push(...getChildJoints(child.name, skeletonJoints, hierarchy))
  }

  return allChildren
}
