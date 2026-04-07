// ─────────────────────────────────────────────────────────
// FILE: frontend/contexts/session-context.tsx
// ─────────────────────────────────────────────────────────
// Shared backend session context for all dashboard pages.
// Creates a single backend session on mount and exposes the session_id
// plus analysis state to Analysis Center, Mock Interview, and Career Chat.

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSession as apiCreateSession, type AnalysisScores, type HighlightCard } from '@/lib/api'

interface SessionContextType {
  sessionId: string | null
  sessionReady: boolean
  sessionError: string | null
  // Analysis results shared across pages (so interview/career chat can reference them)
  analysisResult: string | null
  analysisScores: AnalysisScores | null
  analysisHighlights: HighlightCard[] | null
  setAnalysisResult: (result: string | null) => void
  setAnalysisScores: (scores: AnalysisScores | null) => void
  setAnalysisHighlights: (highlights: HighlightCard[] | null) => void
  // Reset everything (new analysis)
  resetSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [analysisScores, setAnalysisScores] = useState<AnalysisScores | null>(null)
  const [analysisHighlights, setAnalysisHighlights] = useState<HighlightCard[] | null>(null)

  const initSession = useCallback(async () => {
    setSessionError(null)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Not logged in — session will be created after login
      setSessionReady(false)
      return
    }

    const sid = await apiCreateSession()
    if (sid) {
      setSessionId(sid)
      setSessionReady(true)
    } else {
      setSessionError('Could not connect to CrackD servers. Please refresh the page.')
      setSessionReady(false)
    }
  }, [])

  // Create backend session on mount
  useEffect(() => {
    initSession()
  }, [initSession])

  // Listen for auth changes — re-create session if user logs in/out
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        initSession()
      } else if (event === 'SIGNED_OUT') {
        setSessionId(null)
        setSessionReady(false)
        setAnalysisResult(null)
        setAnalysisScores(null)
        setAnalysisHighlights(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [initSession])

  const resetSession = useCallback(async () => {
    setAnalysisResult(null)
    setAnalysisScores(null)
    setAnalysisHighlights(null)
    setSessionId(null)
    setSessionReady(false)
    await initSession()
  }, [initSession])

  return (
    <SessionContext.Provider value={{
      sessionId,
      sessionReady,
      sessionError,
      analysisResult,
      analysisScores,
      analysisHighlights,
      setAnalysisResult,
      setAnalysisScores,
      setAnalysisHighlights,
      resetSession,
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}
