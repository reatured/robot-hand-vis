/**
 * Main Zustand Store
 * Combines all feature slices into a single store
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createDebugSlice } from '@/features/debug/store/debugSlice'
import { DebugState } from '@/features/debug/types'
import { createTrackingSlice, TrackingSlice } from '@/features/tracking/store/trackingSlice'
import { createUrdfSlice, UrdfSlice } from '@/features/urdf/store/urdfSlice'

// Combined store type
type StoreState = DebugState & TrackingSlice & UrdfSlice // Add more slices as needed

/**
 * Main application store
 */
export const useStore = create<StoreState>()(
  devtools(
    (...a) => ({
      ...createDebugSlice(...a),
      ...createTrackingSlice(...a),
      ...createUrdfSlice(...a),
    }),
    {
      name: 'robot-hand-vis-store',
    }
  )
)
