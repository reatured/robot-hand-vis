'use client'

/**
 * Debug Panel Component
 * Displays calibration data for MimicHand palm length calculations
 */

import { Panel } from '@/shared/components/Panel'
import { useStore } from '@/store'
import { useMemo } from 'react'
import type { JointMetadata, RobotHandMetadata } from '@/features/urdf/types'

/**
 * Build a lookup map for joints by child link name
 */
function buildJointLookup(metadata: RobotHandMetadata): Map<string, JointMetadata> {
  const jointByChildLink = new Map<string, JointMetadata>()

  Object.values(metadata.fingers).forEach((finger) => {
    if (finger) {
      finger.joints.forEach((j) => {
        jointByChildLink.set(j.childLink, j)
      })
    }
  })

  return jointByChildLink
}

/**
 * Get parent chain from joint to base link
 */
function getParentChain(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): JointMetadata[] {
  const chain: JointMetadata[] = []
  let currentJoint: JointMetadata | undefined = joint

  while (currentJoint) {
    chain.push(currentJoint)

    if (currentJoint.parentLink === metadata.baseLink) {
      break
    }

    currentJoint = jointLookup.get(currentJoint.parentLink)
  }

  return chain.reverse() // Base to target order
}

/**
 * Compute world position of a joint by traversing parent chain
 */
function computeWorldPosition(
  joint: JointMetadata,
  metadata: RobotHandMetadata,
  jointLookup: Map<string, JointMetadata>
): [number, number, number] {
  const chain = getParentChain(joint, metadata, jointLookup)

  let worldX = 0
  let worldY = 0
  let worldZ = 0

  for (const j of chain) {
    worldX += j.position[0]
    worldY += j.position[1]
    worldZ += j.position[2]
  }

  return [worldX, worldY, worldZ]
}

export function DebugPanel() {
  const isCollapsed = useStore((state) => state.isDebugPanelCollapsed)
  const togglePanel = useStore((state) => state.toggleDebugPanel)
  const trackingResults = useStore((state) => state.tracking.results)
  const handMetadata = useStore((state) => state.urdf.handMetadata)
  const isMimicHandVisible = useStore((state) => state.urdf.isMimicHandVisible)

  // Get the first detected hand
  const handData = trackingResults[0]

  // Landmark indices
  const MIDDLE_ROOT = 9

  // Calculate calibration data
  const calibrationData = useMemo(() => {
    let trackedPalmLength = 0
    let robotPalmLength = 0
    let scaleFactor = 0

    if (handData && handData.landmarks && handMetadata && handMetadata.fingers.middle) {
      try {
        // 1. Calculate tracked hand palm length (wrist to middle finger root)
        const wrist = handData.landmarks[0]
        const middleRoot = handData.landmarks[MIDDLE_ROOT]

        if (wrist && middleRoot) {
          trackedPalmLength = Math.sqrt(
            Math.pow(middleRoot.x - wrist.x, 2) +
            Math.pow(middleRoot.y - wrist.y, 2) +
            Math.pow(middleRoot.z - wrist.z, 2)
          )

          // 2. Calculate robot hand palm length (base to middle finger root)
          const jointLookup = buildJointLookup(handMetadata)
          const middleBaseJoint = handMetadata.fingers.middle.joints[0]
          const robotMiddleRootPos = computeWorldPosition(middleBaseJoint, handMetadata, jointLookup)

          // Distance from base link [0,0,0] to middle finger base
          robotPalmLength = Math.sqrt(
            Math.pow(robotMiddleRootPos[0], 2) +
            Math.pow(robotMiddleRootPos[1], 2) +
            Math.pow(robotMiddleRootPos[2], 2)
          )

          // 3. Compute scale factor
          if (trackedPalmLength > 0) {
            scaleFactor = robotPalmLength / trackedPalmLength
          }
        }
      } catch (error) {
        console.warn('Failed to calculate calibration data:', error)
      }
    }

    return {
      trackedPalmLength,
      robotPalmLength,
      scaleFactor,
    }
  }, [handData, handMetadata])

  // Don't show panel if mimic hand is not visible
  if (!isMimicHandVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 z-30">
      <Panel title="Debug: MimicHand Calibration" className="select-none">
        <div className="space-y-3">
          {/* Toggle button */}
          <button
            onClick={togglePanel}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
          >
            {isCollapsed ? 'Show Details' : 'Hide Details'}
          </button>

          {/* Collapsed view - only show if data available */}
          {!isCollapsed && handData && handData.landmarks && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Robot Palm Length:</span>
                <span className="text-green-400 font-mono">
                  {calibrationData.robotPalmLength.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tracked Palm Length:</span>
                <span className="text-blue-400 font-mono">
                  {calibrationData.trackedPalmLength.toFixed(4)}
                </span>
              </div>

              <div className="h-px bg-gray-700 my-2"></div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Scale Factor:</span>
                <span className="text-yellow-400 font-mono font-semibold">
                  {calibrationData.scaleFactor.toFixed(4)}
                </span>
              </div>

              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                Scale = Robot Length / Tracked Length
              </div>
            </div>
          )}

          {/* No tracking data message */}
          {!isCollapsed && (!handData || !handData.landmarks) && (
            <div className="text-sm text-gray-500 text-center py-2">
              No hand tracking data available
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
