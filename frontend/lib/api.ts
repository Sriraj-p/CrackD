// ─────────────────────────────────────────────────────────
// FILE: frontend/lib/api.ts
// ─────────────────────────────────────────────────────────
// Shared API helper for CrackD frontend → backend communication.
// Handles session creation, auth headers, resume upload, and chat.
// All three dashboard pages import from here via SessionProvider context.

import { createClient } from '@/lib/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_CRACKD_API_URL || ''

// ─── Auth headers ───

async function getAuthHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra }
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

// ─── Session management ───

export async function createSession(): Promise<string | null> {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/api/session`, {
      method: 'POST',
      headers,
    })
    if (res.status === 401) {
      console.error('[API] Session creation got 401 — token rejected')
      return null
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '(no body)')
      console.error(`[API] Session creation failed: ${res.status}`, body)
      return null
    }
    const data = await res.json()
    return data.session_id
  } catch (e) {
    console.error('[API] Session creation error:', e)
    return null
  }
}

// ─── Resume upload (Analysis Center) ───

export interface AnalysisScores {
  overall_fit: number
  experience_relevance: number
  resume_quality: number
  growth_potential: number
}

export interface UploadResult {
  response: string
  session_id: string
  scores: AnalysisScores | null
}

function parseScoresFallback(text: string): AnalysisScores | null {
  const patterns: Record<keyof AnalysisScores, RegExp> = {
    overall_fit: /OVERALL_FIT:\s*(\d+)/,
    experience_relevance: /EXPERIENCE_RELEVANCE:\s*(\d+)/,
    resume_quality: /RESUME_QUALITY:\s*(\d+)/,
    growth_potential: /GROWTH_POTENTIAL:\s*(\d+)/,
  }
  const scores: Partial<AnalysisScores> = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match) scores[key as keyof AnalysisScores] = Math.min(100, Math.max(0, parseInt(match[1])))
  }
  return Object.keys(scores).length === 4 ? (scores as AnalysisScores) : null
}

function cleanResponse(text: string): string {
  let clean = text
  for (const marker of ['OVERALL_FIT:', 'EXPERIENCE_RELEVANCE:', 'RESUME_QUALITY:', 'GROWTH_POTENTIAL:']) {
    clean = clean.replace(new RegExp(`${marker}\\s*\\d+\\n?`, 'g'), '')
  }
  return clean.trim()
}

export async function uploadResume(
  sessionId: string,
  file: File | null,
  jobDescription: string,
  resumeText: string = '',
): Promise<{ analysis: string; scores: AnalysisScores | null } | { error: string }> {
  try {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('job_description', jobDescription)
    if (file) formData.append('file', file)
    formData.append('resume_text', resumeText)

    const headers = await getAuthHeaders()
    // Do NOT set Content-Type — browser sets multipart boundary automatically
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (res.status === 401) {
      return { error: 'Authentication expired. Please sign in again.' }
    }
    if (!res.ok) {
      return { error: `Server error (${res.status}). Please try again.` }
    }

    const data: UploadResult = await res.json()
    console.log('[API] Upload response:', { scores: data.scores, responseLength: data.response?.length, responsePreview: data.response?.substring(0, 200) })
    let finalScores = data.scores
    if (!finalScores) finalScores = parseScoresFallback(data.response)

    return {
      analysis: cleanResponse(data.response),
      scores: finalScores,
    }
  } catch (e) {
    console.error('[API] Upload error:', e)
    return { error: 'Could not connect to server. Please check your connection and try again.' }
  }
}

// ─── Chat (Mock Interview + Career Chat) ───

export interface ChatApiResponse {
  response: string
  session_id: string
  scores: AnalysisScores | null
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
): Promise<{ response: string } | { error: string }> {
  try {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' })
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ session_id: sessionId, message }),
    })

    if (res.status === 401) {
      return { error: 'Authentication expired. Please sign in again.' }
    }
    if (!res.ok) {
      return { error: `Server error (${res.status}). Please try again.` }
    }

    const data: ChatApiResponse = await res.json()
    return { response: data.response }
  } catch (e) {
    console.error('[API] Chat error:', e)
    return { error: 'Could not connect to server. Please try again.' }
  }
}