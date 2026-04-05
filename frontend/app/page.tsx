'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/landing/navbar'
import HeroSection from '@/components/landing/hero-section'
import FeaturesBento from '@/components/landing/features-bento'
import Footer from '@/components/landing/footer'
import { ScrollVideoBackground } from '@/components/landing/scroll-video-background'
import { useScrollAnimations } from '@/hooks/use-scroll-animations'

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useScrollAnimations()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  return (
    <>
      <ScrollVideoBackground src="/videos/uob-campus.mp4" fallbackPoster="/images/uob-campus-poster.jpg" />
      <main className="relative min-h-screen text-foreground">
        <Navbar theme={theme} onThemeToggle={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))} />
        <HeroSection />
        <FeaturesBento />
        <Footer />
      </main>
    </>
  )
}
