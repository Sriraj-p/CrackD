import { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import LandingView from './components/LandingView'
import ResultsDashboard from './components/ResultsDashboard'
import ChatView from './components/ChatView'

const API_BASE = ''

export default function App() {
  const [theme, setTheme] = useState('dark')
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const createSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/session`, { method: 'POST' })
      const data = await res.json()
      setSessionId(data.session_id)
    } catch (e) {
      console.error('Session creation failed:', e)
      setError('Could not connect to server. Please refresh.')
    }
  }

  useEffect(() => { createSession() }, [])

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
    if (!sessionId) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('session_id', sessionId)
      formData.append('job_description', jobDescription)
      if (file) formData.append('file', file)
      formData.append('resume_text', resumeText || '')

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      })
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
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (e) {
      console.error('Chat failed:', e)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }, [sessionId])

  const handleStartCareerChat = useCallback(() => {
    setChatMode('career')
    setCurrentView('chat')
    if (careerMessages.length === 0) {
      sendMessage(
        "You are now in career advisor mode — NOT mock interview mode. Do NOT ask me interview questions or start an interview. Instead, greet me warmly as my career advisor, tell me you've reviewed my resume analysis, and offer to help me improve my resume, discuss my gaps, or plan my career strategy for the role I was analysed for. Be friendly and supportive.",
        'career',
        true
      )
    }
  }, [careerMessages.length, sendMessage])

  const handleStartInterview = useCallback(() => {
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
  }, [interviewStarted, sendMessage])

  const handleNavigate = (view) => {
    if (view === 'landing') {
      if (scores) {
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
    <Layout
      currentView={currentView}
      chatMode={chatMode}
      onNavigate={handleNavigate}
      theme={theme}
      onToggleTheme={toggleTheme}
      hasResults={!!scores}
    >
      {renderView()}
    </Layout>
  )
}
