/**
 * JointAnimDemo Store Slice
 * Manages animation state for joint motion testing
 */

import { StateCreator } from 'zustand'

/**
 * Animation info for a single joint
 */
export interface JointAnimationInfo {
  jointName: string
  startTime: number
  duration: number
  initialAngle: number
}

/**
 * JointAnimDemo state interface
 */
export interface JointAnimDemoState {
  /** Currently animating joints (jointName → animation info) */
  animatingJoints: Map<string, JointAnimationInfo>

  /** Start animation for a joint */
  startJointAnimDemo: (jointName: string, initialAngle: number, duration?: number) => void

  /** Stop animation for a joint */
  stopJointAnimDemo: (jointName: string) => void

  /** Clear all animations */
  clearAllAnimations: () => void

  /** Check if a joint is currently animating */
  isJointAnimating: (jointName: string) => boolean
}

export const createJointAnimDemoSlice: StateCreator<JointAnimDemoState> = (set, get) => ({
  animatingJoints: new Map(),

  startJointAnimDemo: (jointName, initialAngle, duration = 3000) => {
    set((state) => {
      const newAnimatingJoints = new Map(state.animatingJoints)

      newAnimatingJoints.set(jointName, {
        jointName,
        startTime: performance.now(),
        duration,
        initialAngle,
      })

      return { animatingJoints: newAnimatingJoints }
    })
  },

  stopJointAnimDemo: (jointName) => {
    set((state) => {
      const newAnimatingJoints = new Map(state.animatingJoints)
      newAnimatingJoints.delete(jointName)
      return { animatingJoints: newAnimatingJoints }
    })
  },

  clearAllAnimations: () => {
    set({ animatingJoints: new Map() })
  },

  isJointAnimating: (jointName) => {
    return get().animatingJoints.has(jointName)
  },
})
