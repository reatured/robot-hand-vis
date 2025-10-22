'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports to avoid SSR issues with WebGL and camera
// Using barrel exports from @/components for clean imports
const Scene = dynamic(() => import('@/components').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
      <div className="text-white">Loading 3D scene...</div>
    </div>
  ),
})

const Camera = dynamic(() => import('@/components').then((mod) => mod.Camera), {
  ssr: false,
})

const Inspector = dynamic(() => import('@/components').then((mod) => mod.Inspector), {
  ssr: false,
})

export default function PageContent() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 3D Scene - Full screen background */}
      <Suspense fallback={null}>
        <Scene />
      </Suspense>

      {/* Camera View - Top left overlay */}
      <Suspense fallback={null}>
        <Camera width={320} height={240} />
      </Suspense>

      {/* Inspector Panel - Right side */}
      <Suspense fallback={null}>
        <Inspector />
      </Suspense>

      {/* UI Overlay - Optional info panel */}
      <div className="fixed bottom-4 left-4 z-40 bg-black/50 text-white p-4 rounded-lg text-sm backdrop-blur-sm">
        <div className="font-bold mb-2">Robot Hand Visualization</div>
        <div className="text-xs opacity-80">
          <div>• Camera: Top left</div>
          <div>• 3D Scene: Interactive (drag to rotate)</div>
          <div>• Grid: 20x20 units</div>
        </div>
      </div>
    </div>
  )
}
