/**
 * Tracking Store Slice - Hand tracking state management
 */

import { StateCreator } from 'zustand'
import type { HandTrackingResult } from '../types'

export interface TrackingSlice {
  tracking: {
    enabled: boolean
    results: HandTrackingResult[]
    lastDetectionTime: number
    fps: number
    isTracking: boolean
  }
  setTrackingEnabled: (enabled: boolean) => void
  setTrackingResults: (results: HandTrackingResult[]) => void
  setTrackingFPS: (fps: number) => void
}

export const createTrackingSlice: StateCreator<TrackingSlice> = (set) => ({
  tracking: {
    enabled: true,
    results: [],
    lastDetectionTime: 0,
    fps: 0,
    isTracking: false,
  },

  setTrackingEnabled: (enabled) =>
    set((state) => ({
      tracking: {
        ...state.tracking,
        enabled,
      },
    })),

  setTrackingResults: (results) =>
    set((state) => ({
      tracking: {
        ...state.tracking,
        results,
        lastDetectionTime: Date.now(),
        isTracking: results.length > 0,
      },
    })),

  setTrackingFPS: (fps) =>
    set((state) => ({
      tracking: {
        ...state.tracking,
        fps,
      },
    })),
})
