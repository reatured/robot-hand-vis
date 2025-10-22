/**
 * Skeleton Data Store Slice
 * Single source of truth for robot skeleton state
 */

import { StateCreator } from 'zustand'
import * as THREE from 'three'
import { RobotSkeletonData, SkeletonJoint } from '../types'

export interface SkeletonState {
  /** Current skeleton data (single source of truth) */
  skeletonData: RobotSkeletonData | null

  /** Set complete skeleton data */
  setSkeletonData: (data: RobotSkeletonData) => void

  /** Update a single joint transform */
  updateJointTransform: (jointName: string, position: THREE.Vector3, rotation: THREE.Quaternion) => void

  /** Update multiple joints at once */
  updateJoints: (updates: Array<{ name: string; position: THREE.Vector3; rotation: THREE.Quaternion }>) => void

  /** Update root transform */
  updateRootTransform: (position: THREE.Vector3, rotation: THREE.Euler) => void

  /** Clear skeleton data */
  clearSkeletonData: () => void
}

export const createSkeletonSlice: StateCreator<SkeletonState> = (set) => ({
  skeletonData: null,

  setSkeletonData: (data) => {
    set({ skeletonData: data })
  },

  updateJointTransform: (jointName, position, rotation) => {
    set((state) => {
      if (!state.skeletonData) return state

      const updatedJoints = state.skeletonData.joints.map((joint) =>
        joint.name === jointName
          ? {
              ...joint,
              position: position.clone(),
              rotation: rotation.clone(),
            }
          : joint
      )

      return {
        skeletonData: {
          ...state.skeletonData,
          joints: updatedJoints,
        },
      }
    })
  },

  updateJoints: (updates) => {
    set((state) => {
      if (!state.skeletonData) return state

      const updateMap = new Map(updates.map((u) => [u.name, u]))

      const updatedJoints = state.skeletonData.joints.map((joint) => {
        const update = updateMap.get(joint.name)
        if (!update) return joint

        return {
          ...joint,
          position: update.position.clone(),
          rotation: update.rotation.clone(),
        }
      })

      return {
        skeletonData: {
          ...state.skeletonData,
          joints: updatedJoints,
        },
      }
    })
  },

  updateRootTransform: (position, rotation) => {
    set((state) => {
      if (!state.skeletonData) return state

      return {
        skeletonData: {
          ...state.skeletonData,
          rootPosition: position.clone(),
          rootRotation: rotation.clone(),
        },
      }
    })
  },

  clearSkeletonData: () => {
    set({ skeletonData: null })
  },
})
