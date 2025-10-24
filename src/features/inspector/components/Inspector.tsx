'use client'

/**
 * Inspector Component
 * Main inspector panel for debugging and controlling the robot hand
 */

import { Panel } from '@/shared/components/Panel'
import { useStore } from '@/store'

export function Inspector() {
  const isModelVisible = useStore((state) => state.urdf.isModelVisible)
  const setModelVisible = useStore((state) => state.setModelVisible)
  const isMimicHandVisible = useStore((state) => state.urdf.isMimicHandVisible)
  const setMimicHandVisible = useStore((state) => state.setMimicHandVisible)
  const isIKDemoVisible = useStore((state) => state.ik?.isIKDemoVisible ?? false)
  const setIKDemoVisible = useStore((state) => state.setIKDemoVisible)

  console.log('Inspector: IK state =', { isIKDemoVisible, hasSetFunction: !!setIKDemoVisible })

  return (
    <div className="fixed top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto z-30">
      <Panel title="Inspector">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="model-visibility" className="text-sm text-gray-200">
              Model Layer
            </label>
            <input
              id="model-visibility"
              type="checkbox"
              checked={isModelVisible}
              onChange={(e) => setModelVisible(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="mimic-hand-visibility" className="text-sm text-gray-200">
              Mimic Hand Layer
            </label>
            <input
              id="mimic-hand-visibility"
              type="checkbox"
              checked={isMimicHandVisible}
              onChange={(e) => setMimicHandVisible(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="ik-demo-visibility" className="text-sm text-gray-200">
              IK Demo
            </label>
            <input
              id="ik-demo-visibility"
              type="checkbox"
              checked={isIKDemoVisible}
              onChange={(e) => setIKDemoVisible(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
        </div>
      </Panel>
    </div>
  )
}
