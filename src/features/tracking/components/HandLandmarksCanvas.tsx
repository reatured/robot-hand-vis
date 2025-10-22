'use client'

import { useEffect, useRef } from 'react'
import type { HandTrackingResult } from '../types'
import { HAND_CONNECTIONS } from '../types'

interface HandLandmarksCanvasProps {
  width: number
  height: number
  results: HandTrackingResult[]
}

export function HandLandmarksCanvas({ width, height, results }: HandLandmarksCanvasProps) {
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
  }, [results, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
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
  if (HAND_CONNECTIONS && landmarks) {
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
  }

  // Draw landmarks (joints)
  if (landmarks) {
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
    })
  }
}
