/**
 * useJointAnimDemo Hook
 * R3F integration for procedural joint animation
 */

import { useFrame } from '@react-three/fiber'
import { useStore } from '@/store'
import { calculateJointAngle, setJointAngle, getAnimationLimits } from '../core/jointAnimDemo'

/**
 * React hook that runs joint animations every frame
 * Uses R3F useFrame for smooth 60fps updates
 */
export function useJointAnimDemo() {
  useFrame(() => {
    const animatingJoints = (useStore.getState() as any).animatingJoints as Map<string, any>
    const joints = (useStore.getState() as any).joints || []
    const stopJointAnimDemo = (useStore.getState() as any).stopJointAnimDemo

    if (!animatingJoints || animatingJoints.size === 0) {
      return // No animations running
    }

    const now = performance.now()

    // Update each animating joint
    animatingJoints.forEach((animation, jointName) => {
      // Find the joint data
      const joint = joints.find((j: any) => j.name === jointName)

      if (!joint || !joint.object3D) {
        // Joint not found or no Object3D, stop animation
        stopJointAnimDemo(jointName)
        return
      }

      // Calculate elapsed time
      const elapsedTime = now - animation.startTime

      // Get safe animation limits
      const limits = getAnimationLimits(
        joint.limits?.lower,
        joint.limits?.upper
      )

      // Calculate current angle procedurally
      const result = calculateJointAngle(
        elapsedTime,
        animation.duration,
        animation.initialAngle,
        limits.lower,
        limits.upper
      )

      // Apply angle to joint Object3D
      setJointAngle(joint.object3D, joint.axis, result.angle)

      // Update current angle in joint info (for display)
      joint.currentAngle = result.angle

      // Check if animation is complete
      if (result.completed) {
        stopJointAnimDemo(jointName)
      }
    })
  })
}
