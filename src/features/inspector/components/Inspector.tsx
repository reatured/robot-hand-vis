'use client'

/**
 * Inspector Component
 * Main inspector panel for debugging and controlling the robot hand
 */

import { Panel } from '@/shared/components/Panel'

export function Inspector() {
  return (
    <div className="fixed top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto z-30">
      <Panel title="Inspector">
        <div className="space-y-4">
          <div className="text-sm text-gray-400">Inspector panel - content coming soon</div>
        </div>
      </Panel>
    </div>
  )
}
