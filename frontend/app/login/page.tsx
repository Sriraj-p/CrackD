'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'
import { LoginShowcase } from '@/components/auth/login-showcase'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: 'var(--primary)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]" style={{ background: 'var(--accent)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-[400px] relative z-10">
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <Zap className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-serif text-2xl font-semibold text-foreground tracking-tight">Crack<span className="text-primary italic">D</span></span>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground leading-tight mb-2">Prep smart,</h1>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground leading-tight mb-4">land faster</h1>
            <p className="font-sans text-sm text-muted-foreground">AI-powered interview prep, built for focus</p>
          </div>

          <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right — Feature showcase */}
      <div className="hidden lg:flex flex-1 max-w-[580px] relative">
        <LoginShowcase />
      </div>
    </div>
  )
}
