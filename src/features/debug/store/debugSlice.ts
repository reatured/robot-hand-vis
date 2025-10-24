/**
 * Debug Store Slice
 * Manages debug visualization state for joint axes and selection
 */

import { StateCreator } from 'zustand'
import { DebugState } from '../types'

export const createDebugSlice: StateCreator<DebugState> = (set) => ({
  // Initial state
  showAxisLines: true, // Show axes by default
  selectedJointName: null,
  fingerFilter: 'all',
  joints: [],
  isDebugPanelVisible: false,

  // Actions
  setShowAxisLines: (show) =>
    set({
      showAxisLines: show,
    }),

  setSelectedJoint: (jointName) =>
    set({
      selectedJointName: jointName,
    }),

  setFingerFilter: (filter) =>
    set({
      fingerFilter: filter,
    }),

  setJoints: (joints) =>
    set({
      joints,
    }),

  toggleDebugPanel: () =>
    set((state) => ({
      isDebugPanelVisible: !state.isDebugPanelVisible,
    })),
})
