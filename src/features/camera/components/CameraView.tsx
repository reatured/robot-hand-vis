'use client'

import { useEffect, useRef, useState } from 'react'
import { useHandTracking } from '../../tracking/hooks/useHandTracking'
import { LandmarkOverlay } from '../../tracking/components/LandmarkOverlay'

interface CameraViewProps {
  width?: number
  height?: number
  className?: string
  enableTracking?: boolean
}

export function CameraView({
  width = 320,
  height = 240,
  className = '',
  enableTracking = true,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Hand tracking
  const { results, isTracking, error: trackingError, fps } = useHandTracking(videoRef, {
    enabled: enableTracking,
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    filterAlpha: 0.5,
  })

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

      {trackingError && (
        <div className="absolute top-0 left-0 right-0 bg-orange-900 text-white p-2 text-xs text-center">
          Tracking: {trackingError}
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

      {/* Hand tracking overlay */}
      {enableTracking && isTracking && (
        <LandmarkOverlay
          width={width}
          height={height}
          results={results}
          showConfidence={true}
          showFPS={true}
          fps={fps}
        />
      )}
    </div>
  )
}
