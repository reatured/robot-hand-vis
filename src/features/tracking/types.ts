/**
 * Hand tracking types for MediaPipe Hands integration
 */

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Vector2 {
  x: number
  y: number
}

/**
 * Single hand landmark point
 * Coordinates are normalized to [0,1] based on image dimensions
 */
export interface HandLandmark {
  x: number // Normalized x coordinate [0,1]
  y: number // Normalized y coordinate [0,1]
  z: number // Depth relative to wrist (negative = closer to camera)
  visibility?: number // Optional visibility score [0,1]
}

/**
 * Complete set of 21 hand landmarks
 * Following MediaPipe Hands landmark model
 */
export type HandLandmarks = HandLandmark[]

/**
 * Hand tracking result from MediaPipe
 */
export interface HandTrackingResult {
  landmarks: HandLandmarks
  worldLandmarks?: HandLandmarks // 3D world coordinates in meters
  handedness: 'Left' | 'Right'
  score: number // Confidence score [0,1]
}

/**
 * Tracking state
 */
export interface TrackingState {
  enabled: boolean
  isTracking: boolean
  lastDetectionTime: number
  fps: number
  results: HandTrackingResult[]
}

/**
 * MediaPipe Hand landmark indices
 */
export enum HandLandmarkIndex {
  WRIST = 0,
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  THUMB_IP = 3,
  THUMB_TIP = 4,
  INDEX_FINGER_MCP = 5,
  INDEX_FINGER_PIP = 6,
  INDEX_FINGER_DIP = 7,
  INDEX_FINGER_TIP = 8,
  MIDDLE_FINGER_MCP = 9,
  MIDDLE_FINGER_PIP = 10,
  MIDDLE_FINGER_DIP = 11,
  MIDDLE_FINGER_TIP = 12,
  RING_FINGER_MCP = 13,
  RING_FINGER_PIP = 14,
  RING_FINGER_DIP = 15,
  RING_FINGER_TIP = 16,
  PINKY_MCP = 17,
  PINKY_PIP = 18,
  PINKY_DIP = 19,
  PINKY_TIP = 20,
}

/**
 * Hand connections for drawing skeleton
 * Each pair represents a connection between two landmark indices
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

/**
 * Filtering configuration for landmark smoothing
 */
export interface FilterConfig {
  enabled: boolean
  alpha: number // EMA smoothing factor [0,1], lower = more smoothing
  minCutoff?: number // Minimum cutoff frequency (for advanced filters)
  beta?: number // Speed coefficient (for advanced filters)
}
