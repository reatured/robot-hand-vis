/**
 * MediaPipe Hands integration for hand tracking
 */

import { Hands, Results, NormalizedLandmarkList } from '@mediapipe/hands'
import type { HandTrackingResult, HandLandmarks, FilterConfig } from '../types'

export class HandTracker {
  private hands: Hands | null = null
  private isInitialized = false
  private onResultsCallback: ((results: HandTrackingResult[]) => void) | null = null
  private filterConfig: FilterConfig = {
    enabled: true,
    alpha: 0.5, // EMA smoothing factor
  }
  private previousLandmarks: Map<string, HandLandmarks> = new Map()

  constructor() {
    // Initialize in async method
  }

  /**
   * Initialize MediaPipe Hands
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        },
      })

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      this.hands.onResults(this.handleResults.bind(this))
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize MediaPipe Hands:', error)
      throw error
    }
  }

  /**
   * Process a video frame
   */
  async processFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isInitialized || !this.hands) {
      throw new Error('HandTracker not initialized. Call initialize() first.')
    }

    try {
      await this.hands.send({ image: videoElement })
    } catch (error) {
      console.error('Error processing frame:', error)
    }
  }

  /**
   * Handle results from MediaPipe
   */
  private handleResults(results: Results): void {
    const trackingResults: HandTrackingResult[] = []

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i]
        const handedness = results.multiHandedness[i]
        const worldLandmarks = results.multiHandWorldLandmarks?.[i]

        // Convert to our format
        const handLandmarks = this.convertLandmarks(landmarks)
        const handWorldLandmarks = worldLandmarks ? this.convertLandmarks(worldLandmarks) : undefined

        // Apply filtering
        const handKey = handedness.label // 'Left' or 'Right'
        const filteredLandmarks = this.applyFilter(handKey, handLandmarks)

        trackingResults.push({
          landmarks: filteredLandmarks,
          worldLandmarks: handWorldLandmarks,
          handedness: handedness.label as 'Left' | 'Right',
          score: handedness.score,
        })
      }
    }

    // Invoke callback with results
    if (this.onResultsCallback) {
      this.onResultsCallback(trackingResults)
    }
  }

  /**
   * Convert MediaPipe landmarks to our format
   */
  private convertLandmarks(landmarks: NormalizedLandmarkList): HandLandmarks {
    return landmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility,
    }))
  }

  /**
   * Apply exponential moving average (EMA) filter for smoothing
   */
  private applyFilter(handKey: string, landmarks: HandLandmarks): HandLandmarks {
    if (!this.filterConfig.enabled) {
      this.previousLandmarks.set(handKey, landmarks)
      return landmarks
    }

    const previous = this.previousLandmarks.get(handKey)
    if (!previous) {
      this.previousLandmarks.set(handKey, landmarks)
      return landmarks
    }

    const alpha = this.filterConfig.alpha
    const filtered = landmarks.map((lm, i) => ({
      x: alpha * lm.x + (1 - alpha) * previous[i].x,
      y: alpha * lm.y + (1 - alpha) * previous[i].y,
      z: alpha * lm.z + (1 - alpha) * previous[i].z,
      visibility: lm.visibility,
    }))

    this.previousLandmarks.set(handKey, filtered)
    return filtered
  }

  /**
   * Set callback for tracking results
   */
  onResults(callback: (results: HandTrackingResult[]) => void): void {
    this.onResultsCallback = callback
  }

  /**
   * Update filter configuration
   */
  setFilterConfig(config: Partial<FilterConfig>): void {
    this.filterConfig = { ...this.filterConfig, ...config }
  }

  /**
   * Update MediaPipe options
   */
  setOptions(options: {
    maxNumHands?: number
    modelComplexity?: 0 | 1
    minDetectionConfidence?: number
    minTrackingConfidence?: number
  }): void {
    if (this.hands) {
      this.hands.setOptions(options)
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.hands) {
      this.hands.close()
      this.hands = null
    }
    this.isInitialized = false
    this.previousLandmarks.clear()
  }
}
