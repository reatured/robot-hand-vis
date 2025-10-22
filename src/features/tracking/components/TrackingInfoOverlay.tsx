'use client'

import type { HandTrackingResult } from '../types'

interface TrackingInfoOverlayProps {
  results: HandTrackingResult[]
  fps: number
  showFPS?: boolean
  showConfidence?: boolean
}

export function TrackingInfoOverlay({
  results,
  fps,
  showFPS = true,
  showConfidence = true,
}: TrackingInfoOverlayProps) {
  return (
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
  )
}
