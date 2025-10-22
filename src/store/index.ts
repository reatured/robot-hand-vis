/**
 * Main Zustand Store
 * Combines all feature slices into a single store
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createDebugSlice } from '@/features/debug/store/debugSlice'
import { DebugState } from '@/features/debug/types'
import { createJointAnimDemoSlice, JointAnimDemoState } from '@/features/urdf/store/jointAnimDemoSlice'
import { createSkeletonSlice, SkeletonState } from '@/features/urdf/store/skeletonSlice'

// Combined store type
type StoreState = DebugState & JointAnimDemoState & SkeletonState // Add more slices as needed

/**
 * Main application store
 */
export const useStore = create<StoreState>()(
  devtools(
    (...a) => ({
      ...createDebugSlice(...a),
      ...createJointAnimDemoSlice(...a),
      ...createSkeletonSlice(...a),
      // Add more slices here as you implement them:
      // ...createTrackingSlice(...a),
    }),
    {
      name: 'robot-hand-vis-store',
    }
  )
)
