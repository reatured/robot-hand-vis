'use client'

import { useEffect, useRef, useState } from 'react'

interface CameraViewProps {
  width?: number
  height?: number
  className?: string
}

export function CameraView({ width = 320, height = 240, className = '' }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let mounted = true

    async function initCamera() {
      try {
        setIsLoading(true)
        setError(null)

        // Request camera access
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: 'user',
          },
          audio: false,
        })

        if (!mounted) {
          // Clean up if component unmounted during async operation
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }

        setIsLoading(false)
      } catch (err) {
        if (!mounted) return

        console.error('Camera access error:', err)
        setError(err instanceof Error ? err.message : 'Failed to access camera')
        setIsLoading(false)
      }
    }

    initCamera()

    return () => {
      mounted = false
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [width, height])

  return (
    <div
      className={`fixed top-4 left-4 z-50 rounded-lg overflow-hidden shadow-lg bg-black ${className}`}
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-sm">Loading camera...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white p-4 text-xs text-center">
          <div>
            <div className="font-bold mb-2">Camera Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
      />
    </div>
  )
}
