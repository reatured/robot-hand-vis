/**
 * URDF Store Slice - Robot hand metadata and runtime state management
 */

import { StateCreator } from 'zustand'
import { RobotHandMetadata, RobotHandState } from '../types'

export interface UrdfSlice {
  urdf: {
    /** Current loaded hand metadata (immutable reference data) */
    handMetadata: RobotHandMetadata | null
    /** Runtime hand state (joint values, mutable) */
    handState: RobotHandState | null
    /** Whether a model is currently loaded */
    isLoaded: boolean
    /** Whether the model is visible in the scene */
    isModelVisible: boolean
    /** Whether the mimic hand debug layer is visible */
    isMimicHandVisible: boolean
  }
  /** Set the current hand metadata and runtime state */
  setHandModel: (metadata: RobotHandMetadata, state: RobotHandState) => void
  /** Update a single joint value */
  updateJointValue: (jointName: string, value: number) => void
  /** Update multiple joint values at once */
  updateMultipleJoints: (values: Record<string, number>) => void
  /** Reset all joints to neutral position (0) */
  resetHandState: () => void
  /** Clear the current model */
  clearHandModel: () => void
  /** Set model visibility */
  setModelVisible: (visible: boolean) => void
  /** Set mimic hand visibility */
  setMimicHandVisible: (visible: boolean) => void
}

export const createUrdfSlice: StateCreator<UrdfSlice> = (set) => ({
  urdf: {
    handMetadata: null,
    handState: null,
    isLoaded: false,
    isModelVisible: true,
    isMimicHandVisible: true,
  },

  setHandModel: (metadata, state) =>
    set((prevState) => ({
      urdf: {
        handMetadata: metadata,
        handState: state,
        isLoaded: true,
        isModelVisible: prevState.urdf.isModelVisible,
        isMimicHandVisible: prevState.urdf.isMimicHandVisible,
      },
    })),

  updateJointValue: (jointName, value) =>
    set((state) => {
      if (!state.urdf.handState) return state

      const joint = state.urdf.handState.joints.get(jointName)
      if (!joint) {
        console.warn(`Joint "${jointName}" not found in hand model`)
        return state
      }

      // Clamp to limits if they exist
      let clampedValue = value
      if (joint.metadata.limits) {
        clampedValue = Math.max(
          joint.metadata.limits.lower,
          Math.min(joint.metadata.limits.upper, value)
        )
      }

      joint.currentValue = clampedValue

      return {
        urdf: {
          ...state.urdf,
          handState: { ...state.urdf.handState },
        },
      }
    }),

  updateMultipleJoints: (values) =>
    set((state) => {
      if (!state.urdf.handState) return state

      for (const [jointName, value] of Object.entries(values)) {
        const joint = state.urdf.handState.joints.get(jointName)
        if (joint) {
          // Clamp to limits if they exist
          let clampedValue = value
          if (joint.metadata.limits) {
            clampedValue = Math.max(
              joint.metadata.limits.lower,
              Math.min(joint.metadata.limits.upper, value)
            )
          }
          joint.currentValue = clampedValue
        }
      }

      return {
        urdf: {
          ...state.urdf,
          handState: { ...state.urdf.handState },
        },
      }
    }),

  resetHandState: () =>
    set((state) => {
      if (!state.urdf.handState) return state

      // Reset all joints to 0
      state.urdf.handState.joints.forEach((joint) => {
        joint.currentValue = 0
      })

      return {
        urdf: {
          ...state.urdf,
          handState: { ...state.urdf.handState },
        },
      }
    }),

  clearHandModel: () =>
    set({
      urdf: {
        handMetadata: null,
        handState: null,
        isLoaded: false,
        isModelVisible: true,
        isMimicHandVisible: true,
      },
    }),

  setModelVisible: (visible) =>
    set((state) => ({
      urdf: {
        ...state.urdf,
        isModelVisible: visible,
      },
    })),

  setMimicHandVisible: (visible) =>
    set((state) => ({
      urdf: {
        ...state.urdf,
        isMimicHandVisible: visible,
      },
    })),
})
