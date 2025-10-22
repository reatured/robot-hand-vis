'use client'

import { useEffect, useRef } from 'react'
import type { HandTrackingResult } from '../types'
import { HAND_CONNECTIONS } from '../types'

interface LandmarkOverlayProps {
  width: number
  height: number
  results: HandTrackingResult[]
  showConfidence?: boolean
  showFPS?: boolean
  fps?: number
}

export function LandmarkOverlay({
  width,
  height,
  results,
  showConfidence = true,
  showFPS = true,
  fps = 0,
}: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw each detected hand
    results.forEach((result) => {
      drawHand(ctx, result, width, height)
    })

    // Draw UI overlays
    if (showFPS || showConfidence) {
      drawInfo(ctx, results, fps, showFPS, showConfidence)
    }
  }, [results, width, height, fps, showFPS, showConfidence])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: 'scaleX(-1)', // Mirror to match video
      }}
    />
  )
}

/**
 * Draw a single hand with landmarks and connections
 */
function drawHand(
  ctx: CanvasRenderingContext2D,
  result: HandTrackingResult,
  width: number,
  height: number,
) {
  const { landmarks, handedness } = result

  // Choose color based on handedness
  const handColor = handedness === 'Left' ? '#00ff88' : '#ff8800'
  const jointColor = handColor
  const connectionColor = handColor

  // Draw connections (skeleton)
  ctx.strokeStyle = connectionColor
  ctx.lineWidth = 2
  HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx]
    const end = landmarks[endIdx]

    if (start && end) {
      ctx.beginPath()
      ctx.moveTo(start.x * width, start.y * height)
      ctx.lineTo(end.x * width, end.y * height)
      ctx.stroke()
    }
  })

  // Draw landmarks (joints)
  landmarks.forEach((landmark, index) => {
    const x = landmark.x * width
    const y = landmark.y * height

    // Determine landmark type for different sizes
    const isTip = index % 4 === 0 && index > 0 // Fingertips
    const isWrist = index === 0
    const radius = isTip ? 6 : isWrist ? 8 : 4

    // Draw landmark
    ctx.fillStyle = jointColor
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw border for better visibility
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw index numbers for debugging (optional)
    if (false) {
      // Set to true to show landmark indices
      ctx.fillStyle = '#ffffff'
      ctx.font = '10px monospace'
      ctx.fillText(String(index), x + 8, y - 8)
    }
  })
}

/**
 * Draw info overlay (FPS, confidence)
 */
function drawInfo(
  ctx: CanvasRenderingContext2D,
  results: HandTrackingResult[],
  fps: number,
  showFPS: boolean,
  showConfidence: boolean,
) {
  const padding = 8
  let yOffset = padding

  // Setup text style
  ctx.font = '12px monospace'
  ctx.textAlign = 'left'

  // Draw FPS
  if (showFPS) {
    ctx.fillStyle = fps > 20 ? '#00ff88' : '#ff8800'
    ctx.fillText(`FPS: ${fps.toFixed(0)}`, padding, yOffset + 12)
    yOffset += 20
  }

  // Draw confidence for each hand
  if (showConfidence && results.length > 0) {
    results.forEach((result) => {
      const confidencePercent = (result.score * 100).toFixed(0)
      const color = result.score > 0.7 ? '#00ff88' : '#ff8800'
      ctx.fillStyle = color
      ctx.fillText(`${result.handedness}: ${confidencePercent}%`, padding, yOffset + 12)
      yOffset += 20
    })
  }

  // Draw "No hands detected" if no results
  if (results.length === 0) {
    ctx.fillStyle = '#ffffff80'
    ctx.fillText('No hands detected', padding, yOffset + 12)
  }
}
