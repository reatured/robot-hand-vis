/**
 * IK Store Slice - IK demo state management
 */

import { StateCreator } from 'zustand'

export interface IKSlice {
  ik: {
    /** Whether the IK demo is visible in the scene */
    isIKDemoVisible: boolean
  }
  /** Set IK demo visibility */
  setIKDemoVisible: (visible: boolean) => void
}

export const createIKSlice: StateCreator<IKSlice> = (set) => ({
  ik: {
    isIKDemoVisible: false,
  },

  setIKDemoVisible: (visible) =>
    set((state) => ({
      ik: {
        ...state.ik,
        isIKDemoVisible: visible,
      },
    })),
})
