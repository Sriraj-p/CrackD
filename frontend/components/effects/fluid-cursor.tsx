'use client'

import { useEffect, useRef, useCallback } from 'react'

export function FluidCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })
  const trailPos = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)

  const animate = useCallback(() => {
    cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15
    cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15
    trailPos.current.x += (mousePos.current.x - trailPos.current.x) * 0.08
    trailPos.current.y += (mousePos.current.y - trailPos.current.y) * 0.08

    if (cursorRef.current) {
      cursorRef.current.style.left = `${cursorPos.current.x}px`
      cursorRef.current.style.top = `${cursorPos.current.y}px`
    }
    if (trailRef.current) {
      trailRef.current.style.left = `${trailPos.current.x}px`
      trailRef.current.style.top = `${trailPos.current.y}px`
    }
    rafId.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const interactive = t.tagName === 'A' || t.tagName === 'BUTTON' ||
        t.closest('a') || t.closest('button') || t.closest('[role="button"]') ||
        t.closest('input') || t.closest('textarea')
      cursorRef.current?.classList.toggle('hovering', !!interactive)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafId.current)
    }
  }, [animate])

  return (
    <>
      <div ref={cursorRef} className="fluid-cursor" />
      <div ref={trailRef} className="fluid-cursor-trail" />
    </>
  )
}
