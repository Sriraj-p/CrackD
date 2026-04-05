'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sun, Moon, Menu, X, Zap } from 'lucide-react'

interface NavbarProps {
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar({ theme, onThemeToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'py-3 glass-card mx-4 mt-3 rounded-2xl' : 'py-5 bg-transparent'}`}>
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center glow-primary">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground tracking-tight">
            Crack<span className="text-primary italic">D</span>
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-sans">{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={onThemeToggle} aria-label="Toggle theme" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>
          <Link href="/login" className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors font-sans px-4 py-2">Log in</Link>
          <Link href="/login" className="hidden md:inline-flex btn-pill bg-primary text-primary-foreground text-sm hover:opacity-90 hover:scale-105 active:scale-95">Get Started</Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" className="md:hidden w-10 h-10 rounded-full glass-card flex items-center justify-center">
            {mobileOpen ? <X className="w-4 h-4 text-foreground" /> : <Menu className="w-4 h-4 text-foreground" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden mx-4 mt-2 glass-card rounded-2xl p-4">
          <ul className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">{l.label}</a>
              </li>
            ))}
            <li className="pt-2"><Link href="/login" onClick={() => setMobileOpen(false)} className="block btn-pill bg-primary text-primary-foreground text-sm text-center">Get Started Free</Link></li>
          </ul>
        </div>
      )}
    </header>
  )
}
