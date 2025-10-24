/**
 * IK Store Slice - IK demo state management
 */

import { StateCreator } from 'zustand'

export interface IKSlice {
  ik: {
    /** Whether the IK demo is visible in the scene */
    isIKDemoVisible: boolean
    /** Endpoint target position */
    endpointPosition: { x: number; y: number; z: number }
    /** Endpoint target rotation (radians) */
    endpointRotation: { x: number; y: number; z: number }
  }
  /** Set IK demo visibility */
  setIKDemoVisible: (visible: boolean) => void
  /** Set endpoint position */
  setEndpointPosition: (x: number, y: number, z: number) => void
  /** Set endpoint rotation */
  setEndpointRotation: (x: number, y: number, z: number) => void
}

export const createIKSlice: StateCreator<IKSlice> = (set) => ({
  ik: {
    isIKDemoVisible: false,
    endpointPosition: { x: 0, y: 0, z: 0.5 },
    endpointRotation: { x: 0, y: 0, z: 0 },
  },

  setIKDemoVisible: (visible) =>
    set((state) => ({
      ik: {
        ...state.ik,
        isIKDemoVisible: visible,
      },
    })),

  setEndpointPosition: (x, y, z) =>
    set((state) => ({
      ik: {
        ...state.ik,
        endpointPosition: { x, y, z },
      },
    })),

  setEndpointRotation: (x, y, z) =>
    set((state) => ({
      ik: {
        ...state.ik,
        endpointRotation: { x, y, z },
      },
    })),
})
