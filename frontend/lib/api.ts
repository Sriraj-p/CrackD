// ─────────────────────────────────────────────────────────
// FILE: frontend/lib/api.ts
// ─────────────────────────────────────────────────────────
// Shared API helper for CrackD frontend → backend communication.
// Handles session creation, auth headers, resume upload, and chat.
// All three dashboard pages import from here via SessionProvider context.

import { createClient } from '@/lib/supabase/client'

// Strip trailing slashes to prevent double-slash URLs (e.g. "https://host//api/session")
const API_BASE = (process.env.NEXT_PUBLIC_CRACKD_API_URL || '').replace(/\/+$/, '')

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
  hr_score: number
  ats_score: number
  knowledge_score: number
  // Sub-scores for breakdown bars
  keyword_match?: number
  formatting?: number
  impact_statements?: number
  section_completeness?: number
}

export interface HighlightCard {
  icon: 'check' | 'trending' | 'alert' | 'search'
  title: string
  description: string
}

export interface UploadResult {
  response: string
  session_id: string
  scores: AnalysisScores | null
  highlights: HighlightCard[] | null
}

const SCORE_MARKERS = [
  'OVERALL_FIT:', 'HR_SCORE:', 'ATS_SCORE:', 'KNOWLEDGE_SCORE:',
  'KEYWORD_MATCH:', 'FORMATTING:', 'IMPACT_STATEMENTS:', 'SECTION_COMPLETENESS:',
]

function parseScoresFallback(text: string): AnalysisScores | null {
  const patterns: Record<string, RegExp> = {
    overall_fit: /OVERALL_FIT:\s*(\d+)/,
    hr_score: /HR_SCORE:\s*(\d+)/,
    ats_score: /ATS_SCORE:\s*(\d+)/,
    knowledge_score: /KNOWLEDGE_SCORE:\s*(\d+)/,
    keyword_match: /KEYWORD_MATCH:\s*(\d+)/,
    formatting: /FORMATTING:\s*(\d+)/,
    impact_statements: /IMPACT_STATEMENTS:\s*(\d+)/,
    section_completeness: /SECTION_COMPLETENESS:\s*(\d+)/,
  }
  const scores: Record<string, number> = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match) scores[key] = Math.min(100, Math.max(0, parseInt(match[1])))
  }
  // Need at least the 4 primary scores
  if (['overall_fit', 'hr_score', 'ats_score', 'knowledge_score'].every(k => k in scores)) {
    return scores as unknown as AnalysisScores
  }
  return null
}

function parseHighlightsFallback(text: string): HighlightCard[] | null {
  const pattern = /HIGHLIGHT:\s*(\w+)\s*\|\s*([^|]+?)\s*\|\s*(.+)/g
  const highlights: HighlightCard[] = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    highlights.push({
      icon: match[1].trim() as HighlightCard['icon'],
      title: match[2].trim(),
      description: match[3].trim(),
    })
  }
  return highlights.length >= 4 ? highlights.slice(0, 4) : null
}

function cleanResponse(text: string): string {
  let clean = text
  for (const marker of SCORE_MARKERS) {
    clean = clean.replace(new RegExp(`${marker}\\s*\\d+\\n?`, 'g'), '')
  }
  // Remove HIGHLIGHT lines
  clean = clean.replace(/HIGHLIGHT:\s*\w+\s*\|[^\n]*\n?/g, '')
  // Remove leftover section headers for markers
  clean = clean.replace(/###\s*Scores\s*\n?/g, '')
  clean = clean.replace(/###\s*Highlight Cards\s*\n?/g, '')
  return clean.trim()
}

export async function uploadResume(
  sessionId: string,
  file: File | null,
  jobDescription: string,
  resumeText: string = '',
): Promise<{ analysis: string; scores: AnalysisScores | null; highlights: HighlightCard[] | null } | { error: string }> {
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
    console.log('[API] Upload response:', { scores: data.scores, highlights: data.highlights, responseLength: data.response?.length })
    let finalScores = data.scores
    if (!finalScores) finalScores = parseScoresFallback(data.response)
    let finalHighlights = data.highlights
    if (!finalHighlights) finalHighlights = parseHighlightsFallback(data.response)

    return {
      analysis: cleanResponse(data.response),
      scores: finalScores,
      highlights: finalHighlights,
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