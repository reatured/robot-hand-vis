/**
 * Debug Feature Type Definitions
 */

import { UrdfJointInfo } from '../urdf/types'

/**
 * Finger filter options
 */
export type FingerFilter = 'all' | 'thumb' | 'index' | 'middle' | 'ring' | 'pinky' | 'other'

/**
 * Debug state for visualization controls
 */
export interface DebugState {
  /** Show/hide joint axis arrows */
  showAxisLines: boolean

  /** Currently selected joint name */
  selectedJointName: string | null

  /** Filter joints by finger */
  fingerFilter: FingerFilter

  /** All parsed joints from the loaded URDF */
  joints: UrdfJointInfo[]

  /** Actions */
  setShowAxisLines: (show: boolean) => void
  setSelectedJoint: (jointName: string | null) => void
  setFingerFilter: (filter: FingerFilter) => void
  setJoints: (joints: UrdfJointInfo[]) => void
}
