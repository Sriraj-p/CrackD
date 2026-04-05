'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Mic,
  Star,
  Clock,
  Target,
  Zap,
  Brain,
} from 'lucide-react'

type Tab = 'analysis' | 'interview'

/* ── Fake analysis data ─────────────────── */
const analysisSteps = [
  { label: 'Parse resume sections', done: true },
  { label: 'Extract skills & keywords', done: true },
  { label: 'Score ATS compatibility', done: true },
  { label: 'Generate improvement tips', done: true },
  { label: 'Build performance report', status: 'active' as const },
]

const scoreCategories = [
  { label: 'Keyword Match', score: 82 },
  { label: 'Formatting', score: 95 },
  { label: 'Impact Statements', score: 71 },
  { label: 'Section Completeness', score: 68 },
]

/* ── Fake interview data ────────────────── */
const interviewMessages = [
  {
    role: 'interviewer' as const,
    text: 'Tell me about a time you led a team through a difficult challenge.',
    time: '0:00',
  },
  {
    role: 'user' as const,
    text: 'In my previous role, our team migrated a monolith to microservices in 3 months...',
    time: '0:32',
    score: 7,
  },
  {
    role: 'interviewer' as const,
    text: 'How did you handle disagreements about the architecture?',
    time: '1:15',
  },
]

const metrics = [
  { label: 'Clarity', value: 8 },
  { label: 'Structure', value: 7 },
  { label: 'Relevance', value: 9 },
  { label: 'Confidence', value: 6 },
]

/* ── Showcase Component ─────────────────── */
export function LoginShowcase() {
  const [tab, setTab] = useState<Tab>('analysis')

  return (
    <div className="w-full h-full bg-card/50 border-l border-border flex flex-col overflow-hidden">
      {/* Top bar with tab switcher */}
      <div className="flex items-center justify-center pt-8 pb-4 px-6">
        <div className="flex items-center bg-secondary/60 rounded-full p-1 border border-border/50">
          {(['analysis', 'interview'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-6 py-2 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                tab === t
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === t && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {t === 'analysis' ? (
                  <BarChart3 className="w-3.5 h-3.5" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5" />
                )}
                {t === 'analysis' ? 'Analysis' : 'Interview'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 'analysis' ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              {/* Score ring preview */}
              <div className="glass-card rounded-2xl p-5 flex items-center gap-5">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="var(--secondary)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - 0.78)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-lg font-bold text-primary">78</span>
                  </div>
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">ATS Score</p>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    Good — a few tweaks will push this above 85
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-[11px] text-primary font-sans font-medium">+12 from suggestions</span>
                  </div>
                </div>
              </div>

              {/* Score categories */}
              <div className="glass-card rounded-2xl p-4">
                <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Breakdown
                </p>
                <div className="flex flex-col gap-3">
                  {scoreCategories.map((cat) => (
                    <div key={cat.label} className="flex items-center gap-3">
                      <span className="font-sans text-xs text-foreground w-32 shrink-0">{cat.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground w-8 text-right">{cat.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress steps */}
              <div className="glass-card rounded-2xl p-4">
                <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Progress
                </p>
                <div className="flex flex-col gap-2">
                  {analysisSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-primary/40 shrink-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        </div>
                      )}
                      <span className={`font-sans text-xs ${step.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Context files */}
              <div className="glass-card rounded-2xl p-4">
                <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Context
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { icon: FileText, name: 'Resume_2026.pdf' },
                    { icon: Target, name: 'SWE_JobDescription.txt' },
                  ].map(({ icon: Icon, name }) => (
                    <div key={name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-sans text-xs text-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              {/* Interview type badge */}
              <div className="flex items-center gap-2">
                <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Brain className="w-3 h-3 text-primary" />
                  <span className="text-xs font-sans font-medium text-foreground">Behavioral Round</span>
                </div>
                <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-sans text-muted-foreground">2:15</span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
                {interviewMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {msg.role === 'interviewer' ? (
                        <Zap className="w-3 h-3 text-primary" />
                      ) : (
                        <Mic className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-[10px] text-muted-foreground font-sans">
                        {msg.role === 'interviewer' ? 'CrackD AI' : 'You'} · {msg.time}
                      </span>
                    </div>
                    <div
                      className={`rounded-xl px-3.5 py-2.5 max-w-[90%] ${
                        msg.role === 'user'
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-secondary/60 border border-border/50'
                      }`}
                    >
                      <p className="font-sans text-xs text-foreground leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                    {msg.score && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 10 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`w-2.5 h-2.5 ${
                              j < msg.score
                                ? 'text-primary fill-primary'
                                : 'text-muted-foreground/20'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1 font-mono">
                          {msg.score}/10
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-primary" />
                  <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-secondary/60 border border-border/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>

              {/* Performance metrics */}
              <div className="glass-card rounded-2xl p-4">
                <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Live Performance
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {metrics.map((m) => (
                    <div key={m.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[11px] text-muted-foreground">{m.label}</span>
                        <span className="font-mono text-[11px] text-foreground">{m.value}/10</span>
                      </div>
                      <div className="h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${m.value * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick tips */}
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-sans text-xs font-medium text-foreground">Real-time tip</p>
                    <p className="font-sans text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Quantify your impact — &quot;reduced deployment time by 60%&quot; is stronger than &quot;delivered on time.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
