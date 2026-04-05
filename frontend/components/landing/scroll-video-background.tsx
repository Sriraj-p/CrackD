"use client"

import { useEffect, useRef, useState } from "react"

interface ScrollVideoBackgroundProps {
  src: string
  fallbackPoster?: string
}

export function ScrollVideoBackground({ src, fallbackPoster }: ScrollVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setIsLoaded(true)
      video.pause()
    }

    const handleError = () => {
      setHasError(true)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("error", handleError)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !isLoaded) return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
          const scrollProgress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1)
          
          // Map scroll progress to video time
          if (video.duration && isFinite(video.duration)) {
            video.currentTime = scrollProgress * video.duration
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    // Initial position
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isLoaded])

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video layer */}
      <video
        ref={videoRef}
        src={src}
        poster={fallbackPoster}
        muted
        playsInline
        preload="auto"
        className={`
          absolute inset-0 w-full h-full object-cover
          transition-opacity duration-1000
          ${isLoaded && !hasError ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Animated fallback gradient - shows when video hasn't loaded or errored */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isLoaded && !hasError ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Base gradient simulating aerial/campus view */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a365d] via-[#2a4a5c] to-[#1e3a4c] dark:from-[#0a0f14] dark:via-[#0d1117] dark:to-[#0a0e12]" />
        
        {/* Animated atmospheric blobs - simulating clouds/movement */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-[20%] top-[10%] h-[50vh] w-[50vh] rounded-full bg-[#4A7C6F]/10 dark:bg-primary/5 blur-[100px] animate-float-slow" />
          <div className="absolute -right-[15%] top-[30%] h-[60vh] w-[60vh] rounded-full bg-[#5B9BAF]/10 dark:bg-accent/5 blur-[120px] animate-float-slower" />
          <div className="absolute left-[20%] top-[50%] h-[40vh] w-[40vh] rounded-full bg-[#4A7C6F]/8 dark:bg-primary/3 blur-[80px] animate-float-medium" />
          <div className="absolute right-[10%] bottom-[20%] h-[45vh] w-[45vh] rounded-full bg-[#5B9BAF]/8 dark:bg-accent/4 blur-[90px] animate-float-slow" />
        </div>

        {/* Subtle grid pattern suggesting architecture/campus buildings */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Theme-aware overlay for content readability */}
      {/* Light mode: warm creamy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background/95 dark:from-background/70 dark:via-background/80 dark:to-background/95" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_90%)] opacity-40" />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay noise-overlay" />
    </div>
  )
}
