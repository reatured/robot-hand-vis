/**
 * Tracking Feature Type Definitions
 */

export interface Landmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export interface HandLandmarks extends Array<Landmark> {}

export interface HandTrackingResult {
  landmarks: HandLandmarks
  handedness: 'Left' | 'Right'
  score: number
}

export interface FilterConfig {
  minDetectionConfidence: number
  minTrackingConfidence: number
  smoothing?: boolean
}

export interface TrackingState {
  // Tracking state will be defined here when implemented (M1)
}

/**
 * MediaPipe hand landmark connections
 * Defines which landmarks connect to form the hand skeleton
 */
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
]
