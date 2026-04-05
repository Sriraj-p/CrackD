'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mic, Send, RotateCcw, MessageSquare, Clock, Target, TrendingUp, Brain, Zap, ChevronRight, AlertCircle } from 'lucide-react'
import { useSession } from '@/contexts/session-context'
import { sendChatMessage } from '@/lib/api'

type InterviewMode = 'setup' | 'starting' | 'active' | 'complete'

interface Message {
  role: 'interviewer' | 'user' | 'system'
  content: string
}

const interviewTypes = [
  { id: 'behavioral', label: 'Behavioral', description: 'STAR method, soft skills', icon: MessageSquare },
  { id: 'technical', label: 'Technical', description: 'DSA, system design', icon: Brain },
  { id: 'hr', label: 'HR', description: 'Culture fit, salary', icon: Target },
  { id: 'case', label: 'Case Study', description: 'Problem solving', icon: TrendingUp },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

export default function MockInterviewPage() {
  const { sessionId, sessionReady, analysisScores } = useSession()
  const [mode, setMode] = useState<InterviewMode>('setup')
  const [selectedType, setSelectedType] = useState('behavioral')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const startInterview = useCallback(async () => {
    if (!sessionReady || !sessionId) {
      setError('Not connected to CrackD servers. Please refresh the page.')
      return
    }

    setMode('starting')
    setError(null)
    setQuestionCount(0)

    // Add system notice for the user
    const systemMsg: Message = {
      role: 'system',
      content: `This is a simulation of a ${selectedType} interview round. Your AI interviewer will adapt to your responses and provide real-time feedback. Good luck!`,
    }
    setMessages([systemMsg])

    // Send hidden message to backend to trigger interview mode
    // The backend's detect_mode will pick up "mock interview" and switch to interview mode
    const hiddenPrompt = `Start a mock ${selectedType} interview for the role I was analysed for. Get into character as a senior interviewer appropriate for this role — introduce yourself with a name and title, then begin with your first question. Stay in character throughout. Focus on ${selectedType} questions.`

    setIsThinking(true)
    const result = await sendChatMessage(sessionId, hiddenPrompt)
    setIsThinking(false)

    if ('error' in result) {
      setError(result.error)
      setMode('setup')
      return
    }

    setMessages((prev) => [...prev, { role: 'interviewer', content: result.response }])
    setMode('active')
    setQuestionCount(1)
  }, [sessionId, sessionReady, selectedType])

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isThinking || !sessionId) return

    const userMsg: Message = { role: 'user', content: inputValue }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsThinking(true)
    setError(null)

    const result = await sendChatMessage(sessionId, inputValue)
    setIsThinking(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    setMessages((prev) => [...prev, { role: 'interviewer', content: result.response }])
    setQuestionCount((c) => c + 1)
  }, [inputValue, isThinking, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const resetInterview = () => {
    setMode('setup')
    setMessages([])
    setInputValue('')
    setQuestionCount(0)
    setError(null)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-foreground mb-2">Mock Interview</h1>
        <p className="font-sans text-muted-foreground">Practice with AI that adapts to your skill level and provides real-time feedback.</p>
      </motion.div>

      {mode === 'setup' && (
        <motion.div variants={stagger} initial="hidden" animate="visible">
          {!analysisScores && (
            <motion.div variants={fadeUp} className="mb-6 glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-sm font-medium text-foreground mb-1">No resume analysis found</p>
                  <p className="font-sans text-xs text-muted-foreground">
                    For the best experience, upload and analyze your resume in the Analysis Center first. The interviewer will tailor questions to your profile and target role.
                    You can still start an interview without it — the AI will ask general questions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="mb-6">
            <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Choose interview type</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {interviewTypes.map((type) => {
                const Icon = type.icon; const sel = selectedType === type.id
                return (
                  <button key={type.id} onClick={() => setSelectedType(type.id)}
                    className={`glass-card rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] ${sel ? 'border-primary/50 bg-primary/5' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${sel ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}><Icon className="w-5 h-5" /></div>
                    <p className="font-sans text-sm font-medium text-foreground">{type.label}</p>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {error && (
            <motion.div variants={fadeUp} className="mb-4 glass-card rounded-xl px-4 py-3 border border-accent/30 bg-accent/5">
              <p className="font-sans text-sm text-accent">{error}</p>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="flex justify-center mt-8">
            <button onClick={startInterview} disabled={!sessionReady}
              className="btn-pill bg-primary text-primary-foreground text-base glow-primary hover:opacity-90 hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {!sessionReady ? 'Connecting...' : 'Start Interview'} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}

      {mode === 'starting' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="font-sans text-base font-medium text-foreground">Your interviewer is preparing...</p>
          <p className="font-sans text-sm text-muted-foreground mt-1">Setting up a {selectedType} interview session</p>
        </div>
      )}

      {(mode === 'active' || mode === 'complete') && (
        <div className="flex flex-col h-[calc(100vh-14rem)]">
          {/* Header bar */}
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-[10px] text-muted-foreground uppercase tracking-wide">Type</span>
                <span className="font-mono text-xs font-medium text-foreground">{interviewTypes.find(t => t.id === selectedType)?.label}</span>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-[10px] text-muted-foreground uppercase tracking-wide">Questions</span>
                <span className="font-mono text-xs font-medium text-foreground">{questionCount}</span>
              </div>
            </div>
            <button onClick={resetInterview}
              className="glass-card rounded-xl px-4 py-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> New Interview
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Zap className="w-4 h-4 text-primary" /></div>
                <div>
                  <p className="font-sans text-sm font-medium text-foreground">CrackD Interviewer</p>
                  <p className="font-sans text-[10px] text-muted-foreground">{interviewTypes.find((t) => t.id === selectedType)?.label} Round · Live AI</p>
                </div>
              </div>
              <div className="flex items-center gap-1 glass-card px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-sans text-muted-foreground">Live</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : msg.role === 'system' ? 'items-center' : 'items-start'}`}>
                  {msg.role === 'system' ? (
                    <div className="rounded-xl px-4 py-2.5 max-w-[90%] bg-primary/5 border border-primary/10">
                      <p className="font-sans text-xs text-muted-foreground italic text-center leading-relaxed">{msg.content}</p>
                    </div>
                  ) : (
                    <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${msg.role === 'user' ? 'bg-primary/10 border border-primary/15' : 'bg-secondary/60 border border-border/50'}`}>
                      <p className="font-sans text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {isThinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                  <div className="rounded-2xl px-4 py-3 bg-secondary/60 border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="rounded-xl px-4 py-2.5 bg-accent/5 border border-accent/20">
                    <p className="font-sans text-xs text-accent">{error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="px-5 py-4 border-t border-border">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"><Mic className="w-4 h-4 text-primary" /></button>
                <input type="text" placeholder="Type your response..." value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                <button onClick={sendMessage} disabled={!inputValue.trim() || isThinking}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-30">
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}