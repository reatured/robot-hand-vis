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

  // Endpoint position and rotation
  const endpointPosition = useStore((state) => state.ik?.endpointPosition ?? { x: 0, y: 0, z: 0.5 })
  const endpointRotation = useStore((state) => state.ik?.endpointRotation ?? { x: 0, y: 0, z: 0 })
  const setEndpointPosition = useStore((state) => state.setEndpointPosition)
  const setEndpointRotation = useStore((state) => state.setEndpointRotation)

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

          {/* Endpoint Position Controls */}
          <div className="border-t border-gray-600 pt-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Endpoint Position</h3>

            {/* X Position */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="endpoint-x" className="text-xs text-gray-300">
                  X
                </label>
                <span className="text-xs text-gray-400">{endpointPosition.x.toFixed(2)}</span>
              </div>
              <input
                id="endpoint-x"
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={endpointPosition.x}
                onChange={(e) => setEndpointPosition(parseFloat(e.target.value), endpointPosition.y, endpointPosition.z)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Y Position */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="endpoint-y" className="text-xs text-gray-300">
                  Y
                </label>
                <span className="text-xs text-gray-400">{endpointPosition.y.toFixed(2)}</span>
              </div>
              <input
                id="endpoint-y"
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={endpointPosition.y}
                onChange={(e) => setEndpointPosition(endpointPosition.x, parseFloat(e.target.value), endpointPosition.z)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Z Position */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="endpoint-z" className="text-xs text-gray-300">
                  Z
                </label>
                <span className="text-xs text-gray-400">{endpointPosition.z.toFixed(2)}</span>
              </div>
              <input
                id="endpoint-z"
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={endpointPosition.z}
                onChange={(e) => setEndpointPosition(endpointPosition.x, endpointPosition.y, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Endpoint Rotation Controls */}
          <div className="border-t border-gray-600 pt-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Endpoint Rotation</h3>

            {/* RX Rotation */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="endpoint-rx" className="text-xs text-gray-300">
                  RX
                </label>
                <span className="text-xs text-gray-400">{endpointRotation.x.toFixed(2)}</span>
              </div>
              <input
                id="endpoint-rx"
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step="0.01"
                value={endpointRotation.x}
                onChange={(e) => setEndpointRotation(parseFloat(e.target.value), endpointRotation.y, endpointRotation.z)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* RY Rotation */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="endpoint-ry" className="text-xs text-gray-300">
                  RY
                </label>
                <span className="text-xs text-gray-400">{endpointRotation.y.toFixed(2)}</span>
              </div>
              <input
                id="endpoint-ry"
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step="0.01"
                value={endpointRotation.y}
                onChange={(e) => setEndpointRotation(endpointRotation.x, parseFloat(e.target.value), endpointRotation.z)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* RZ Rotation */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="endpoint-rz" className="text-xs text-gray-300">
                  RZ
                </label>
                <span className="text-xs text-gray-400">{endpointRotation.z.toFixed(2)}</span>
              </div>
              <input
                id="endpoint-rz"
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step="0.01"
                value={endpointRotation.z}
                onChange={(e) => setEndpointRotation(endpointRotation.x, endpointRotation.y, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
