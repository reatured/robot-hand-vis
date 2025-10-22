/**
 * Main Zustand Store
 * Combines all feature slices into a single store
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createDebugSlice } from '@/features/debug/store/debugSlice'
import { DebugState } from '@/features/debug/types'

// Combined store type
type StoreState = DebugState // Add more slices as needed: & TrackingState & UrdfState, etc.

/**
 * Main application store
 */
export const useStore = create<StoreState>()(
  devtools(
    (...a) => ({
      ...createDebugSlice(...a),
      // Add more slices here as you implement them:
      // ...createTrackingSlice(...a),
      // ...createUrdfSlice(...a),
    }),
    {
      name: 'robot-hand-vis-store',
    }
  )
)
