'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  Sparkles,
  Briefcase,
  GraduationCap,
  Target,
  TrendingUp,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { useSession } from '@/contexts/session-context'
import { sendChatMessage } from '@/lib/api'
import { Markdown } from '@/components/ui/markdown'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

const suggestedTopics = [
  { icon: Briefcase, label: 'Career transition advice', prompt: 'I want to transition into a new role. What steps should I take given my background and resume analysis?' },
  { icon: GraduationCap, label: 'Resume improvement tips', prompt: 'Based on my resume analysis, what are the top things I should improve to stand out to recruiters?' },
  { icon: Target, label: 'Interview preparation strategy', prompt: 'What is the best strategy to prepare for interviews at top companies based on my profile?' },
  { icon: TrendingUp, label: 'Salary negotiation', prompt: 'How should I approach salary negotiation for my target role?' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

export default function CareerChatPage() {
  const { sessionId, sessionReady, analysisScores } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize — send hidden prompt to backend to enter career advisor mode and get a greeting
  useEffect(() => {
    if (initialized || !sessionReady || !sessionId) return

    const init = async () => {
      setInitialized(true)
      setIsTyping(true)

      // This hidden message triggers the backend's career mode and generates a real greeting
      const hiddenPrompt = "You are now in career advisor mode — NOT mock interview mode. Do NOT ask me interview questions or start an interview. Instead, greet me warmly as my career advisor, tell me you've reviewed my resume analysis (if available), and offer to help me improve my resume, discuss my gaps, or plan my career strategy for the role I was analysed for. Be friendly and supportive."

      const result = await sendChatMessage(sessionId, hiddenPrompt)
      setIsTyping(false)

      if ('error' in result) {
        setError(result.error)
        // Show a fallback greeting so the page isn't empty
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm your CrackD career advisor. I'm having trouble connecting right now, but feel free to ask me anything about career transitions, interview strategy, resume optimization, or salary negotiation.",
        }])
        return
      }

      setMessages([{ role: 'assistant', content: result.response }])
    }

    init()
  }, [initialized, sessionReady, sessionId])

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || inputValue.trim()
    if (!content || !sessionId) return

    setMessages((prev) => [...prev, { role: 'user', content }])
    setInputValue('')
    setIsTyping(true)
    setError(null)

    const result = await sendChatMessage(sessionId, content)
    setIsTyping(false)

    if ('error' in result) {
      setError(result.error)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
      }])
      return
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: result.response }])
  }, [inputValue, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden">
      <motion.div variants={fadeUp} className="mb-3 shrink-0">
        <h1 className="font-serif text-2xl font-medium text-foreground mb-1">Career Chat</h1>
        <p className="font-sans text-xs text-muted-foreground">
          Get personalized career advice from your AI advisor
          {analysisScores && <> — informed by your <span className="text-primary font-medium">resume analysis</span></>}
          .
        </p>
      </motion.div>

      {!analysisScores && (
        <motion.div variants={fadeUp} className="mb-3 shrink-0 glass-card rounded-xl px-4 py-2.5 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="font-sans text-xs text-muted-foreground">
              Tip: Upload and analyze your resume in the Analysis Center first for personalized advice tailored to your profile and target role.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {msg.role === 'assistant' ? <Zap className="w-4 h-4 text-primary" /> : <span className="text-xs font-sans font-medium text-muted-foreground">You</span>}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary/10 border border-primary/15' : 'bg-secondary/60 border border-border/50'}`}>
                  {msg.role === 'user' ? (
                    <p className="font-sans text-xs text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="font-sans text-xs"><Markdown>{msg.content}</Markdown></div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
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

        {/* Suggested topics — only show before user sends first message */}
        {messages.length <= 1 && !isTyping && (
          <div className="px-5 pb-3">
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((topic) => {
                const Icon = topic.icon
                return (
                  <button key={topic.label} onClick={() => sendMessage(topic.prompt)}
                    className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl text-xs font-sans text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200">
                    <Icon className="w-3 h-3 text-primary" />{topic.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-5 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input type="text" placeholder="Ask anything about your career..." value={inputValue}
                onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!sessionReady}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50" />
              <button onClick={() => sendMessage()} disabled={!inputValue.trim() || isTyping || !sessionReady}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-30">
                <Send className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-sans text-center mt-2">
            CrackD may make mistakes. Always verify important career advice.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}