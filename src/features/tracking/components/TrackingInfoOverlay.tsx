'use client'

import type { HandTrackingResult } from '../types'

interface TrackingInfoOverlayProps {
  results: HandTrackingResult[]
  fps: number
  width: number
  height: number
  swapLabels?: boolean
  showFPS?: boolean
  showConfidence?: boolean
}

export function TrackingInfoOverlay({
  results,
  fps,
  width,
  height,
  swapLabels = false,
  showFPS = true,
  showConfidence = true,
}: TrackingInfoOverlayProps) {
  return (
    <>
      {/* Top-left info panel */}
      <div className="absolute top-2 left-2 pointer-events-none select-none font-mono text-xs">
        {/* FPS Counter */}
        {showFPS && (
          <div
            className="mb-1 font-semibold"
            style={{
              color: fps > 20 ? '#00ff88' : '#ff8800',
            }}
          >
            FPS: {fps.toFixed(0)}
          </div>
        )}

        {/* Confidence per hand */}
        {showConfidence && results.length > 0 && (
          <div className="space-y-1">
            {results.map((result, index) => {
              const confidencePercent = (result.score * 100).toFixed(0)
              const color = result.score > 0.7 ? '#00ff88' : '#ff8800'
              return (
                <div key={index} style={{ color }}>
                  {result.handedness}: {confidencePercent}%
                </div>
              )
            })}
          </div>
        )}

        {/* No hands detected */}
        {results.length === 0 && (
          <div className="text-white/50">No hands detected</div>
        )}
      </div>

      {/* Hand labels above highest points */}
      {results.map((result, index) => {
        const { landmarks, handedness } = result

        // Determine display label (swap if needed)
        const displayLabel = swapLabels
          ? (handedness === 'Left' ? 'Right' : 'Left')
          : handedness

        // Choose color based on original handedness
        const handColor = handedness === 'Left' ? '#00ff88' : '#ff8800'

        // Find the highest point (minimum y value)
        const highestPoint = landmarks.reduce((highest, landmark) => {
          return landmark.y < highest.y ? landmark : highest
        }, landmarks[0])

        // Calculate position - flip x coordinate to match mirrored video
        const displayX = width - (highestPoint.x * width)
        const displayY = highestPoint.y * height - 20 // 20px above the highest point

        return (
          <div
            key={index}
            className="absolute pointer-events-none select-none font-mono font-bold text-sm"
            style={{
              left: `${displayX}px`,
              top: `${displayY}px`,
              color: handColor,
              transform: 'translate(-50%, -100%)', // Center horizontally, position above point
              textShadow: '0 0 4px black, 0 0 4px black, 0 0 4px black',
            }}
          >
            {displayLabel}
          </div>
        )
      })}
    </>
  )
}
