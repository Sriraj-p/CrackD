import { useState, useEffect, useCallback, useRef } from 'react'
import Layout from './components/Layout'
import LandingView from './components/LandingView'
import ResultsDashboard from './components/ResultsDashboard'
import ChatView from './components/ChatView'
import AuthModal from './components/AuthModal'
import { supabase } from './lib/supabase'

const API_BASE = ''

export default function App() {
  const [theme, setTheme] = useState('dark')

  // ─── Auth state ───
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // ─── App state ───
  const [sessionId, setSessionId] = useState(null)
  const [currentView, setCurrentView] = useState('landing')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [analysisResult, setAnalysisResult] = useState(null)
  const [scores, setScores] = useState(null)

  const [careerMessages, setCareerMessages] = useState([])
  const [interviewMessages, setInterviewMessages] = useState([])
  const [chatMode, setChatMode] = useState('career')
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)

  // Store pending action when auth modal is triggered
  const pendingAction = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  // ─── Supabase auth listener ───
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        setUser(buildUser(s.user))
      }
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        setUser(buildUser(s.user))
        setShowAuthModal(false)

        // Execute pending action if one was stored
        if (pendingAction.current) {
          const action = pendingAction.current
          pendingAction.current = null
          // Small delay to let session state propagate
          setTimeout(action, 100)
        }
      } else {
        setUser(null)
        handleLogout()
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function buildUser(supaUser) {
    const meta = supaUser.user_metadata || {}
    return {
      id: supaUser.id,
      email: supaUser.email,
      full_name: meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'User',
      avatar_url: meta.avatar_url || null,
    }
  }

  // ─── Helper: get auth headers ───
  const getAuthHeaders = useCallback(async (extra = {}) => {
    const headers = { ...extra }
    const { data: { session: s } } = await supabase.auth.getSession()
    if (s?.access_token) {
      headers['Authorization'] = `Bearer ${s.access_token}`
    }
    return headers
  }, [])

  // ─── Auth guard: require login, then execute action ───
  const requireAuth = useCallback((action) => {
    if (session) {
      action()
    } else {
      pendingAction.current = action
      setShowAuthModal(true)
    }
  }, [session])

  // ─── Logout ───
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setSessionId(null)
    setAnalysisResult(null)
    setScores(null)
    setCareerMessages([])
    setInterviewMessages([])
    setInterviewStarted(false)
    setChatMode('career')
    setCurrentView('landing')
  }

  // ─── Session management ───
  const createSession = useCallback(async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/session`, {
        method: 'POST',
        headers,
      })
      if (res.status === 401) return null
      const data = await res.json()
      setSessionId(data.session_id)
      return data.session_id
    } catch (e) {
      console.error('Session creation failed:', e)
      setError('Could not connect to server. Please refresh.')
      return null
    }
  }, [getAuthHeaders])

  // Create backend session when auth session is available
  useEffect(() => {
    if (session && !sessionId) createSession()
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetSession = async () => {
    setAnalysisResult(null)
    setScores(null)
    setCareerMessages([])
    setInterviewMessages([])
    setInterviewStarted(false)
    setChatLoading(false)
    setChatMode('career')
    setError(null)
    setCurrentView('landing')
    setSessionId(null)
    await createSession()
  }

  const parseScoresFallback = (text) => {
    const patterns = {
      overall_fit: /OVERALL_FIT:\s*(\d+)/,
      experience_relevance: /EXPERIENCE_RELEVANCE:\s*(\d+)/,
      resume_quality: /RESUME_QUALITY:\s*(\d+)/,
      growth_potential: /GROWTH_POTENTIAL:\s*(\d+)/,
    }
    const s = {}
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern)
      if (match) s[key] = Math.min(100, Math.max(0, parseInt(match[1])))
    }
    return Object.keys(s).length === 4 ? s : null
  }

  const cleanResponse = (text) => {
    let clean = text
    for (const marker of ['OVERALL_FIT:', 'EXPERIENCE_RELEVANCE:', 'RESUME_QUALITY:', 'GROWTH_POTENTIAL:']) {
      clean = clean.replace(new RegExp(`${marker}\\s*\\d+\\n?`, 'g'), '')
    }
    return clean.trim()
  }

  const handleUpload = async (file, resumeText, jobDescription) => {
    // Gate behind auth
    if (!session) {
      pendingAction.current = () => handleUpload(file, resumeText, jobDescription)
      setShowAuthModal(true)
      return
    }

    let sid = sessionId
    if (!sid) sid = await createSession()
    if (!sid) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('session_id', sid)
      formData.append('job_description', jobDescription)
      if (file) formData.append('file', file)
      formData.append('resume_text', resumeText || '')

      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (res.status === 401) { setShowAuthModal(true); return }
      const data = await res.json()

      let finalScores = data.scores
      if (!finalScores) finalScores = parseScoresFallback(data.response)

      const cleanedResponse = cleanResponse(data.response)
      setAnalysisResult(cleanedResponse)
      setScores(finalScores)
      setCurrentView('results')
    } catch (e) {
      console.error('Upload failed:', e)
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = useCallback(async (message, mode, hidden = false) => {
    if (!sessionId || !message.trim()) return

    const isInterview = mode === 'interview'
    const setMessages = isInterview ? setInterviewMessages : setCareerMessages

    if (!hidden) {
      setMessages(prev => [...prev, { role: 'user', content: message }])
    }

    setChatLoading(true)
    try {
      const headers = await getAuthHeaders({ 'Content-Type': 'application/json' })
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ session_id: sessionId, message }),
      })

      if (res.status === 401) { setShowAuthModal(true); return }
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (e) {
      console.error('Chat failed:', e)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }, [sessionId, getAuthHeaders]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartCareerChat = useCallback(() => {
    requireAuth(() => {
      setChatMode('career')
      setCurrentView('chat')
      if (careerMessages.length === 0) {
        sendMessage(
          "You are now in career advisor mode — NOT mock interview mode. Do NOT ask me interview questions or start an interview. Instead, greet me warmly as my career advisor, tell me you've reviewed my resume analysis, and offer to help me improve my resume, discuss my gaps, or plan my career strategy for the role I was analysed for. Be friendly and supportive.",
          'career',
          true
        )
      }
    })
  }, [careerMessages.length, sendMessage, requireAuth])

  const handleStartInterview = useCallback(() => {
    requireAuth(() => {
      if (interviewStarted) {
        setChatMode('interview')
        setCurrentView('chat')
        return
      }
      setChatMode('interview')
      setCurrentView('chat')
      setInterviewStarted(true)
      sendMessage(
        "Start a mock interview for the role I was analysed for. Get into character as a senior interviewer appropriate for this role — introduce yourself with a name and title, then begin with your first question. Stay in character throughout.",
        'interview',
        true
      )
    })
  }, [interviewStarted, sendMessage, requireAuth])

  const handleNavigate = (view) => {
    if (view === 'landing') {
      if (scores || analysisResult) {
        const confirmed = window.confirm('Are you sure you want to exit? This will clear your session.')
        if (!confirmed) return
        resetSession()
        return
      }
      setCurrentView('landing')
    } else if (view === 'career') {
      handleStartCareerChat()
    } else if (view === 'interview') {
      handleStartInterview()
    } else if (view === 'results') {
      setCurrentView('results')
    } else {
      setCurrentView(view)
    }
  }

  const handleDownloadTranscript = (mode) => {
    const msgs = mode === 'interview' ? interviewMessages : careerMessages
    const label = mode === 'interview' ? 'Mock Interview' : 'Career Chat'
    const text = msgs.map(m =>
      `${m.role === 'user' ? 'YOU' : 'CRACKD'}:\n${m.content}\n`
    ).join('\n---\n\n')
    const blob = new Blob([`CrackD ${label} Transcript\n${'='.repeat(40)}\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crackd-${mode}-transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView onUpload={handleUpload} loading={loading} error={error} />
      case 'results':
        return (
          <ResultsDashboard
            analysis={analysisResult}
            scores={scores}
            onCareerChat={handleStartCareerChat}
            onMockInterview={handleStartInterview}
            onBack={() => {
              const confirmed = window.confirm('Are you sure you want to exit? This will clear your session.')
              if (confirmed) resetSession()
            }}
          />
        )
      case 'chat':
        return (
          <ChatView
            mode={chatMode}
            onModeChange={setChatMode}
            careerMessages={careerMessages}
            interviewMessages={interviewMessages}
            onSendMessage={sendMessage}
            onDownloadTranscript={handleDownloadTranscript}
            onStartInterview={handleStartInterview}
            interviewStarted={interviewStarted}
            chatLoading={chatLoading}
          />
        )
      default:
        return <LandingView onUpload={handleUpload} loading={loading} error={error} />
    }
  }

  return (
    <>
      <Layout
        currentView={currentView}
        chatMode={chatMode}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        hasResults={!!scores || !!analysisResult}
        user={user}
        onLogout={handleLogout}
        onSignIn={() => setShowAuthModal(true)}
      >
        {renderView()}
      </Layout>

      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); pendingAction.current = null }}
        />
      )}
    </>
  )
}
