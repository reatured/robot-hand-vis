/**
 * Example Usage of Robot Hand Metadata System
 *
 * This demonstrates how to use the pre-processed hand metadata
 * and runtime state management without URDF parsing.
 */

import {
  LINKER_L10_RIGHT,
  createHandState,
  updateJointValue,
  getJointValue,
  getAllJointValues,
  updateMultipleJoints,
  resetHandState,
  getJointCount,
  getJointNames,
  getAllJointsFromMetadata,
} from '../index'

// ============================================================================
// Example 1: Accessing Metadata
// ============================================================================

console.log('=== Hand Model Info ===')
console.log(`ID: ${LINKER_L10_RIGHT.id}`)
console.log(`Name: ${LINKER_L10_RIGHT.name}`)
console.log(`Brand: ${LINKER_L10_RIGHT.brand}`)
console.log(`Model: ${LINKER_L10_RIGHT.model}`)
console.log(`Handedness: ${LINKER_L10_RIGHT.handedness}`)
console.log(`Base Link: ${LINKER_L10_RIGHT.baseLink}`)
console.log()

// ============================================================================
// Example 2: Inspecting Joint Structure
// ============================================================================

console.log('=== Joint Structure ===')
console.log(`Thumb joints: ${LINKER_L10_RIGHT.fingers.thumb?.joints.length || 0}`)
console.log(`Index joints: ${LINKER_L10_RIGHT.fingers.index?.joints.length || 0}`)
console.log(`Middle joints: ${LINKER_L10_RIGHT.fingers.middle?.joints.length || 0}`)
console.log(`Ring joints: ${LINKER_L10_RIGHT.fingers.ring?.joints.length || 0}`)
console.log(`Pinky joints: ${LINKER_L10_RIGHT.fingers.pinky?.joints.length || 0}`)
console.log()

// Get all joints as flat array
const allJoints = getAllJointsFromMetadata(LINKER_L10_RIGHT)
console.log(`Total joints: ${allJoints.length}`)
console.log()

// ============================================================================
// Example 3: Accessing Specific Joint Data
// ============================================================================

console.log('=== Thumb CMC Roll Joint Details ===')
const thumbCMC = LINKER_L10_RIGHT.fingers.thumb?.joints[0]
if (thumbCMC) {
  console.log(`Name: ${thumbCMC.name}`)
  console.log(`Type: ${thumbCMC.type}`)
  console.log(`Position: [${thumbCMC.position.join(', ')}]`)
  console.log(`Axis: [${thumbCMC.axis.join(', ')}]`)
  console.log(
    `Limits: ${thumbCMC.limits?.lower} to ${thumbCMC.limits?.upper} rad (${((thumbCMC.limits?.upper || 0) * 180) / Math.PI}°)`
  )
  console.log(`Parent: ${thumbCMC.parentLink}`)
  console.log(`Child: ${thumbCMC.childLink}`)
}
console.log()

// ============================================================================
// Example 4: Creating Runtime State
// ============================================================================

console.log('=== Creating Runtime State ===')
const handState = createHandState(LINKER_L10_RIGHT)
console.log(`Created state with ${getJointCount(handState)} joints`)
console.log()

// ============================================================================
// Example 5: Updating Individual Joints
// ============================================================================

console.log('=== Updating Individual Joints ===')
updateJointValue(handState, 'thumb_cmc_roll', 0.5)
updateJointValue(handState, 'index_mcp_pitch', 1.0)
updateJointValue(handState, 'middle_mcp_pitch', 0.8)

console.log(`thumb_cmc_roll: ${getJointValue(handState, 'thumb_cmc_roll')} rad`)
console.log(`index_mcp_pitch: ${getJointValue(handState, 'index_mcp_pitch')} rad`)
console.log(`middle_mcp_pitch: ${getJointValue(handState, 'middle_mcp_pitch')} rad`)
console.log()

// ============================================================================
// Example 6: Batch Update (e.g., from external system)
// ============================================================================

console.log('=== Batch Update ===')
const newValues = {
  thumb_cmc_roll: 0.8,
  thumb_cmc_pitch: 0.3,
  index_mcp_pitch: 1.2,
  middle_mcp_pitch: 1.1,
  ring_mcp_pitch: 0.9,
  pinky_mcp_pitch: 0.7,
}

updateMultipleJoints(handState, newValues)
console.log('Updated 6 joints from external data')
console.log()

// ============================================================================
// Example 7: Exporting State (for communication)
// ============================================================================

console.log('=== Exporting State for Communication ===')
const exportedState = getAllJointValues(handState)
console.log('Serialized joint values:')
console.log(JSON.stringify(exportedState, null, 2).substring(0, 300) + '...')
console.log(
  `\nSerialized size: ~${JSON.stringify(exportedState).length} bytes (${Object.keys(exportedState).length} joints)`
)
console.log()

// ============================================================================
// Example 8: Resetting State
// ============================================================================

console.log('=== Resetting State ===')
resetHandState(handState)
console.log('All joints reset to neutral position (0)')
console.log(`thumb_cmc_roll after reset: ${getJointValue(handState, 'thumb_cmc_roll')}`)
console.log()

// ============================================================================
// Example 9: Getting Joint Names
// ============================================================================

console.log('=== All Joint Names ===')
const jointNames = getJointNames(handState)
console.log(`Total: ${jointNames.length} joints`)
console.log('First 10:', jointNames.slice(0, 10).join(', '))
console.log()

// ============================================================================
// Summary
// ============================================================================

console.log('=== Summary ===')
console.log('✓ No runtime URDF parsing required')
console.log('✓ Instant access to all joint metadata')
console.log('✓ Type-safe with TypeScript')
console.log('✓ Variable joint counts per finger supported')
console.log('✓ Efficient state management with Map')
console.log('✓ Easy serialization for real-time communication')
console.log()
console.log('Next steps:')
console.log('1. Parse more hand models (L10-Left, L20, Shadow Hand, etc.)')
console.log('2. Integrate with 3D visualization')
console.log('3. Connect to real-time hand tracking data')
console.log('4. Implement calibration using position/axis data')
