'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, AlertCircle } from 'lucide-react'

type AuthMode = 'options' | 'email-signin' | 'email-signup'

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>('options')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/analysis-center'

  const supabase = createClient()

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null)
    setLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setError(msg)
      setLoading(null)
    }
  }

  const handleEmailSignIn = async () => {
    setError(null)
    setLoading('email')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push(redirect)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed'
      setError(msg)
      setLoading(null)
    }
  }

  const handleEmailSignUp = async () => {
    setError(null)
    setLoading('email')
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
        },
      })
      if (error) throw error
      setMessage('Check your email to confirm your account.')
      setLoading(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed'
      setError(msg)
      setLoading(null)
    }
  }

  // Check for URL error params (from OAuth callback)
  const urlError = searchParams.get('error')

  return (
    <div className="flex flex-col gap-3">
      {/* URL error from callback */}
      {urlError && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 mb-1">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive font-sans">
            There was an error logging you in. If the problem persists, please try again later.
          </p>
        </div>
      )}

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive font-sans">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3"
          >
            <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-primary font-sans">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google OAuth */}
      <button
        onClick={() => handleOAuth('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-secondary px-4 py-3.5 font-sans text-sm font-medium text-foreground transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        {loading === 'google' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </button>

      {/* GitHub OAuth */}
      <button
        onClick={() => handleOAuth('github')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-secondary px-4 py-3.5 font-sans text-sm font-medium text-foreground transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        {loading === 'github' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        )}
        Continue with GitHub
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email form */}
      <AnimatePresence mode="wait">
        {mode === 'options' ? (
          <motion.div
            key="options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <button
              onClick={() => {
                if (!email) {
                  setError('Please enter your email')
                  return
                }
                setMode('email-signin')
              }}
              className="w-full rounded-xl border border-border bg-card hover:bg-secondary px-4 py-3.5 font-sans text-sm font-medium text-foreground transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              Continue with email
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="email-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  mode === 'email-signin' ? handleEmailSignIn() : handleEmailSignUp()
                }
              }}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <button
              onClick={mode === 'email-signin' ? handleEmailSignIn : handleEmailSignUp}
              disabled={loading === 'email'}
              className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3.5 font-sans text-sm font-medium transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading === 'email' ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : mode === 'email-signin' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setMode(mode === 'email-signin' ? 'email-signup' : 'email-signin')}
                className="text-xs text-muted-foreground hover:text-foreground font-sans transition-colors"
              >
                {mode === 'email-signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              <button
                onClick={() => { setMode('options'); setPassword(''); setError(null) }}
                className="text-xs text-muted-foreground hover:text-foreground font-sans transition-colors"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms */}
      <p className="text-[11px] text-muted-foreground font-sans text-center mt-2 leading-relaxed">
        By continuing, you acknowledge CrackD&apos;s{' '}
        <a href="#" className="underline hover:text-foreground transition-colors">
          Privacy Policy
        </a>{' '}
        and agree to receive occasional updates.
      </p>
    </div>
  )
}
