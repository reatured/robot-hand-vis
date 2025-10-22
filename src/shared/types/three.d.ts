/**
 * Three.js and React Three Fiber type extensions
 */

import { Object3DNode } from '@react-three/fiber'
import * as THREE from 'three'

declare module '@react-three/fiber' {
  interface ThreeElements {
    // These are already defined by @react-three/fiber, but we declare them
    // here for reference and to ensure they're available
  }
}

// Extend JSX to support Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Extend if needed - R3F should auto-generate most of these
    }
  }
}
