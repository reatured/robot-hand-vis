'use client'

/**
 * DebugPanel Component
 * Displays all Zustand store data organized by slices with real-time updates
 */

import { useState } from 'react'
import { Panel } from '@/shared/components/Panel'
import { useStore } from '@/store'

export function DebugPanel() {
  const isVisible = useStore((state) => state.isDebugPanelVisible)
  const togglePanel = useStore((state) => state.toggleDebugPanel)

  // Debug slice
  const showAxisLines = useStore((state) => state.showAxisLines)
  const selectedJointName = useStore((state) => state.selectedJointName)
  const fingerFilter = useStore((state) => state.fingerFilter)
  const joints = useStore((state) => state.joints)

  // Tracking slice
  const tracking = useStore((state) => state.tracking)

  // URDF slice
  const urdf = useStore((state) => state.urdf)

  // IK slice
  const ik = useStore((state) => state.ik)

  // Local state for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    debug: true,
    tracking: true,
    urdf: true,
    ik: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Helper to format timestamps
  const formatTimestamp = (timestamp: number) => {
    if (timestamp === 0) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  // Helper to format joint values
  const getJointValuesCount = () => {
    if (!urdf.handState) return 0
    return urdf.handState.joints.size
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={togglePanel}
        className="fixed bottom-4 left-4 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors text-sm font-medium"
        title="Toggle Debug Panel"
      >
        {isVisible ? 'Hide' : 'Show'} Debug
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto z-30">
          <Panel title="Debug Store">
            <div className="space-y-3">
              {/* Debug Slice Section */}
              <div>
                <button
                  onClick={() => toggleSection('debug')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Debug Slice</span>
                  <span className="text-xs">{expandedSections.debug ? '▼' : '▶'}</span>
                </button>
                {expandedSections.debug && (
                  <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-700">
                    <DataRow label="Show Axis Lines" value={showAxisLines} />
                    <DataRow label="Selected Joint" value={selectedJointName || 'None'} />
                    <DataRow label="Finger Filter" value={fingerFilter} />
                    <DataRow label="Joints Count" value={joints.length} />
                  </div>
                )}
              </div>

              {/* Tracking Slice Section */}
              <div>
                <button
                  onClick={() => toggleSection('tracking')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
                >
                  <span>Tracking Slice</span>
                  <span className="text-xs">{expandedSections.tracking ? '▼' : '▶'}</span>
                </button>
                {expandedSections.tracking && (
                  <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-700">
                    <DataRow label="Enabled" value={tracking.enabled} />
                    <DataRow label="Is Tracking" value={tracking.isTracking} />
                    <DataRow label="FPS" value={tracking.fps.toFixed(1)} />
                    <DataRow label="Results Count" value={tracking.results.length} />
                    <DataRow label="Last Detection" value={formatTimestamp(tracking.lastDetectionTime)} />
                    {tracking.results.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {tracking.results.map((result, idx) => (
                          <div key={idx} className="text-xs text-gray-400 pl-2">
                            <div>Hand {idx + 1}: {result.handedness}</div>
                            <div>Score: {(result.score * 100).toFixed(1)}%</div>
                            <div>Landmarks: {result.landmarks.length}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* URDF Slice Section */}
              <div>
                <button
                  onClick={() => toggleSection('urdf')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>URDF Slice</span>
                  <span className="text-xs">{expandedSections.urdf ? '▼' : '▶'}</span>
                </button>
                {expandedSections.urdf && (
                  <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-700">
                    <DataRow label="Is Loaded" value={urdf.isLoaded} />
                    <DataRow label="Model Visible" value={urdf.isModelVisible} />
                    <DataRow label="Mimic Hand Visible" value={urdf.isMimicHandVisible} />
                    {urdf.handMetadata && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-gray-400">
                          <div className="font-semibold text-gray-300">Metadata:</div>
                          <div className="pl-2">
                            <div>Name: {urdf.handMetadata.name}</div>
                            <div>Brand: {urdf.handMetadata.brand}</div>
                            <div>Model: {urdf.handMetadata.model}</div>
                            <div>Handedness: {urdf.handMetadata.handedness}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <DataRow label="Joint Values Count" value={getJointValuesCount()} />
                  </div>
                )}
              </div>

              {/* IK Slice Section */}
              <div>
                <button
                  onClick={() => toggleSection('ik')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <span>IK Slice</span>
                  <span className="text-xs">{expandedSections.ik ? '▼' : '▶'}</span>
                </button>
                {expandedSections.ik && (
                  <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-700">
                    <DataRow label="IK Demo Visible" value={ik.isIKDemoVisible} />
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </div>
      )}
    </>
  )
}

/**
 * Helper component to display a key-value row
 */
function DataRow({ label, value }: { label: string; value: string | number | boolean }) {
  const displayValue =
    typeof value === 'boolean' ? (
      <span className={value ? 'text-green-400' : 'text-red-400'}>{value ? 'Yes' : 'No'}</span>
    ) : (
      <span className="text-gray-300">{value}</span>
    )

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-400">{label}:</span>
      {displayValue}
    </div>
  )
}
