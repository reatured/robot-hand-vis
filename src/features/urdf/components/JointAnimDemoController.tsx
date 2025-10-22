/**
 * JointAnimDemoController Component
 * Headless controller that runs joint animations in the 3D scene
 */

'use client'

import { useJointAnimDemo } from '../hooks/useJointAnimDemo'

/**
 * Scene-level controller for joint animations
 * This component has no visual output - it only runs the animation logic
 */
export function JointAnimDemoController() {
  // Run animation updates every frame
  useJointAnimDemo()

  // No visual output
  return null
}
