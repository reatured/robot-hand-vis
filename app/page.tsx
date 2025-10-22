'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports to avoid SSR issues with WebGL and camera
const SceneCanvas = dynamic(() => import('@/components/scene/SceneCanvas').then((mod) => mod.SceneCanvas), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
      <div className="text-white">Loading 3D scene...</div>
    </div>
  ),
})

const CameraView = dynamic(() => import('@/components/camera/CameraView').then((mod) => mod.CameraView), {
  ssr: false,
})

export default function Page() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 3D Scene - Full screen background */}
      <Suspense fallback={null}>
        <SceneCanvas />
      </Suspense>

      {/* Camera View - Top left overlay */}
      <Suspense fallback={null}>
        <CameraView width={320} height={240} />
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
