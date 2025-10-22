'use client'

/**
 * Inspector Component
 * Main inspector panel for debugging and controlling the robot hand
 */

import { Panel } from '@/shared/components/Panel'
import { JointsTab } from './JointsTab'

export function Inspector() {
  return (
    <div className="fixed top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto z-30">
      <Panel title="Inspector">
        <div className="space-y-4">
          {/* Joints Tab - Main content for now */}
          <JointsTab />
        </div>
      </Panel>
    </div>
  )
}
