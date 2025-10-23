/**
 * Custom React hook for hand tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { HandTracker } from '../core/handTracker'
import type { HandTrackingResult } from '../types'
import { useStore } from '@/store'

interface UseHandTrackingOptions {
  enabled?: boolean
  maxNumHands?: number
  modelComplexity?: 0 | 1
  minDetectionConfidence?: number
  minTrackingConfidence?: number
  filterAlpha?: number // EMA smoothing factor
}

interface UseHandTrackingReturn {
  results: HandTrackingResult[]
  isTracking: boolean
  error: string | null
  fps: number
}

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: UseHandTrackingOptions = {},
): UseHandTrackingReturn {
  const {
    enabled = true,
    maxNumHands = 2,
    modelComplexity = 1,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
    filterAlpha = 0.5,
  } = options

  const [results, setResults] = useState<HandTrackingResult[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)

  const trackerRef = useRef<HandTracker | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() })

  // Get store actions
  const setTrackingResults = useStore((state) => state.setTrackingResults)
  const setTrackingFPS = useStore((state) => state.setTrackingFPS)

  // Handle results from tracker
  const handleResults = useCallback((trackingResults: HandTrackingResult[]) => {
    setResults(trackingResults)
    setTrackingResults(trackingResults) // Update global store

    // Update FPS counter
    const counter = fpsCounterRef.current
    counter.frames++
    const now = performance.now()
    const elapsed = now - counter.lastTime

    if (elapsed >= 1000) {
      // Update FPS every second
      const calculatedFps = counter.frames / (elapsed / 1000)
      setFps(calculatedFps)
      setTrackingFPS(calculatedFps) // Update global store
      counter.frames = 0
      counter.lastTime = now
    }
  }, [setTrackingResults, setTrackingFPS])

  // Initialize tracker
  useEffect(() => {
    if (!enabled) return

    let mounted = true

    async function initTracker() {
      try {
        const tracker = new HandTracker()
        await tracker.initialize()

        if (!mounted) {
          tracker.dispose()
          return
        }

        // Configure tracker
        tracker.setOptions({
          maxNumHands,
          modelComplexity,
          minDetectionConfidence,
          minTrackingConfidence,
        })

        tracker.setFilterConfig({
          enabled: true,
          alpha: filterAlpha,
        })

        tracker.onResults(handleResults)

        trackerRef.current = tracker
        setIsTracking(true)
        setError(null)
      } catch (err) {
        if (!mounted) return
        console.error('Failed to initialize hand tracker:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize hand tracker')
        setIsTracking(false)
      }
    }

    initTracker()

    return () => {
      mounted = false
      if (trackerRef.current) {
        trackerRef.current.dispose()
        trackerRef.current = null
      }
      setIsTracking(false)
    }
  }, [
    enabled,
    maxNumHands,
    modelComplexity,
    minDetectionConfidence,
    minTrackingConfidence,
    filterAlpha,
    handleResults,
  ])

  // Processing loop
  useEffect(() => {
    if (!enabled || !isTracking || !videoRef.current || !trackerRef.current) {
      return
    }

    const videoElement = videoRef.current
    const tracker = trackerRef.current

    let isProcessing = false

    async function processFrame() {
      if (!isProcessing && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        isProcessing = true
        try {
          await tracker.processFrame(videoElement)
        } catch (err) {
          console.error('Error processing frame:', err)
        } finally {
          isProcessing = false
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame)
    }

    // Start processing loop
    processFrame()

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [enabled, isTracking, videoRef])

  return {
    results,
    isTracking,
    error,
    fps,
  }
}
