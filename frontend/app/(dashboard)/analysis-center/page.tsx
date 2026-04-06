'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, CheckCircle2, AlertTriangle, TrendingUp, Loader2, X,
  Briefcase, Link as LinkIcon, Shield, Zap, Lock, Lightbulb, Award, Target, Sparkles,
  FileCheck, AlertCircle, Search, Users, Bot, Brain,
} from 'lucide-react'
import { useSession } from '@/contexts/session-context'
import { uploadResume, type AnalysisScores, type HighlightCard } from '@/lib/api'
import { Markdown } from '@/components/ui/markdown'

type UploadState = 'idle' | 'dragging' | 'uploaded' | 'analyzing' | 'done' | 'error'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

// Breakdown bar config for the score breakdown section
const breakdownConfig = [
  { key: 'keyword_match' as const, label: 'Keyword Match' },
  { key: 'formatting' as const, label: 'Formatting' },
  { key: 'impact_statements' as const, label: 'Impact Statements' },
  { key: 'section_completeness' as const, label: 'Section Completeness' },
]

// Map highlight icon names to Lucide components
const highlightIcons = {
  check: CheckCircle2,
  trending: TrendingUp,
  alert: AlertTriangle,
  search: Search,
}

function ScoreRing({ score, size = 'lg' }: { score: number; size?: 'lg' | 'sm' }) {
  const r = size === 'lg' ? 54 : 38
  const c = 2 * Math.PI * r
  const viewBox = size === 'lg' ? '0 0 128 128' : '0 0 96 96'
  const cx = size === 'lg' ? 64 : 48
  const strokeW = size === 'lg' ? 8 : 6
  const wrapClass = size === 'lg' ? 'w-36 h-36' : 'w-24 h-24'
  const textClass = size === 'lg' ? 'font-serif text-4xl font-bold text-primary' : 'font-serif text-2xl font-bold text-primary'
  const labelClass = size === 'lg' ? 'text-[10px] text-muted-foreground font-sans' : 'text-[8px] text-muted-foreground font-sans'
  return (
    <div className={`relative ${wrapClass}`}>
      <svg className="w-full h-full -rotate-90" viewBox={viewBox}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--secondary)" strokeWidth={strokeW} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--primary)" strokeWidth={strokeW} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={textClass}>{score}</span>
        <span className={labelClass}>Overall Fit</span>
      </div>
    </div>
  )
}

function getScoreColor(value: number): string {
  if (value >= 75) return 'text-green-400'
  if (value >= 50) return 'text-primary'
  if (value >= 30) return 'text-amber-400'
  return 'text-red-400'
}

function getScoreBarColor(value: number): string {
  if (value >= 75) return 'bg-green-400'
  if (value >= 50) return 'bg-primary'
  if (value >= 30) return 'bg-amber-400'
  return 'bg-red-400'
}

// Split the analysis markdown into named sections by ## headers
function splitAnalysisSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = text.split(/^## /m)
  for (const part of parts) {
    if (!part.trim()) continue
    const newlineIdx = part.indexOf('\n')
    if (newlineIdx === -1) continue
    const header = part.substring(0, newlineIdx).trim().toLowerCase()
    const content = part.substring(newlineIdx + 1).trim()
    sections[header] = content
  }
  return sections
}

// Detailed analysis card with score ring for HR/ATS/Knowledge
function AnalysisCard({ title, icon: Icon, score, benchmark, children }: {
  title: string
  icon: React.ElementType
  score: number
  benchmark: string
  children: React.ReactNode
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-medium text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-serif text-2xl font-semibold ${getScoreColor(score)}`}>
            {score}<span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-3">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.3 }}
          className={`h-full rounded-full ${getScoreBarColor(score)}`} />
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 italic">{benchmark}</p>
      <div className="font-sans text-sm">{children}</div>
    </div>
  )
}

export default function AnalysisCenterPage() {
  const { sessionId, sessionReady, setAnalysisResult, setAnalysisScores, setAnalysisHighlights } = useSession()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Real results from backend
  const [scores, setScores] = useState<AnalysisScores | null>(null)
  const [highlights, setHighlights] = useState<HighlightCard[] | null>(null)
  const [analysisText, setAnalysisText] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Split analysis text into sections for the two-column layout
  const sections = useMemo(() => analysisText ? splitAnalysisSections(analysisText) : {}, [analysisText])

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  // Stage file only — no auto-start
  const handleFile = useCallback((file: File) => {
    if (!file) return
    setUploadedFile(file)
    setUploadState('uploaded')
    setErrorMessage(null)
  }, [])

  // Real analysis — sends PDF to backend
  const startAnalysis = async () => {
    if (!uploadedFile) return

    if (!sessionReady || !sessionId) {
      setErrorMessage('Not connected to CrackD servers. Please refresh the page or sign in again.')
      setUploadState('error')
      return
    }

    setUploadState('analyzing')
    setErrorMessage(null)

    // Build job description string from title + URL
    const jobDescription = [
      jobTitle && `Job Title: ${jobTitle}`,
      jobUrl && `Job URL: ${jobUrl}`,
      !jobTitle && !jobUrl && 'General resume analysis',
    ].filter(Boolean).join('\n')

    const result = await uploadResume(sessionId, uploadedFile, jobDescription)

    if ('error' in result) {
      setErrorMessage(result.error)
      setUploadState('error')
      return
    }

    // Store scores, highlights, and analysis text
    setScores(result.scores ?? null)
    setHighlights(result.highlights ?? null)
    setAnalysisText(result.analysis)

    // Share with session context so mock interview and career chat can reference it
    setAnalysisResult(result.analysis)
    setAnalysisScores(result.scores ?? null)
    setAnalysisHighlights(result.highlights ?? null)

    setUploadState('done')
    setShowResults(true)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const reset = () => {
    setShowResults(false)
    setUploadState('idle')
    setUploadedFile(null)
    setScores(null)
    setHighlights(null)
    setAnalysisText(null)
    setErrorMessage(null)
    setJobTitle('')
    setJobUrl('')
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      {!showResults && (
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left — Motivational text */}
          <motion.div variants={fadeUp} className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="mb-8">
              <span className="inline-block glass-card px-4 py-1.5 rounded-full text-xs font-sans text-primary uppercase tracking-widest mb-4">Step 1 — Resume Upload</span>
              <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground text-balance mb-4">
                Your resume is your <span className="italic text-primary">first impression.</span>
              </h1>
              <p className="font-sans text-muted-foreground text-lg leading-relaxed text-pretty">
                Upload your CV and our AI agents will parse every detail, score it against ATS systems, and give you a clear roadmap to stand out.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: Sparkles, stat: '94%', label: 'of users improved their ATS score in one session' },
                { icon: Target, stat: '2.3x', label: 'faster than manual resume optimization' },
                { icon: Award, stat: '78%', label: 'interview callback rate after CrackD analysis' },
              ].map(({ icon: Icon, stat, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><Icon className="w-5 h-5 text-primary" /></div>
                  <div>
                    <span className="font-serif text-2xl font-semibold text-primary">{stat}</span>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Upload + Job details */}
          <motion.div variants={fadeUp} className="lg:col-span-7 flex flex-col gap-5">
            {/* Upload zone */}
            <div onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setUploadState((s) => s === 'idle' ? 'dragging' : s) }}
              onDragLeave={() => setUploadState((s) => s === 'dragging' ? 'idle' : s)}
              onClick={() => (uploadState === 'idle' || uploadState === 'dragging') && fileInputRef.current?.click()}
              className={`glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[220px] ${uploadState === 'idle' || uploadState === 'dragging' ? 'cursor-pointer' : ''} ${uploadState === 'dragging' ? 'border-primary/50 scale-[1.01]' : ''}`}>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

              {(uploadState === 'idle' || uploadState === 'dragging') && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><Upload className="w-7 h-7 text-primary" /></div>
                  <p className="font-sans text-base font-medium text-foreground mb-1">Drop your resume here, or click to browse</p>
                  <p className="font-sans text-sm text-muted-foreground">PDF or DOCX, up to 10MB</p>
                </>
              )}
              {uploadState === 'uploaded' && (
                <>
                  <CheckCircle2 className="w-10 h-10 text-primary mb-3" />
                  <p className="font-sans text-base font-medium text-foreground">{uploadedFile?.name}</p>
                  <p className="font-sans text-sm text-muted-foreground mb-4">{uploadedFile && formatSize(uploadedFile.size)}</p>
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); startAnalysis() }}
                      className="btn-pill bg-primary text-primary-foreground text-sm glow-primary hover:opacity-90 hover:scale-105 active:scale-95 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Analyze Resume
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); reset() }}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </>
              )}
              {uploadState === 'analyzing' && (
                <>
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <p className="font-sans text-base font-medium text-foreground">AI agents are analyzing...</p>
                  <p className="font-sans text-sm text-muted-foreground mt-1">{uploadedFile?.name} · {uploadedFile && formatSize(uploadedFile.size)}</p>
                  <div className="flex items-center gap-3 mt-4">
                    {['Parsing sections', 'Extracting skills', 'Scoring ATS'].map((step, i) => (
                      <span key={step} className="text-[10px] font-sans text-primary/70 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />{step}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {uploadState === 'error' && (
                <>
                  <AlertCircle className="w-10 h-10 text-accent mb-3" />
                  <p className="font-sans text-base font-medium text-foreground">Analysis failed</p>
                  <p className="font-sans text-sm text-accent mt-1 mb-4">{errorMessage}</p>
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); startAnalysis() }}
                      className="btn-pill bg-primary text-primary-foreground text-sm hover:opacity-90 hover:scale-105 active:scale-95 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Retry
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); reset() }}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-3 h-3" /> Start over
                    </button>
                  </div>
                </>
              )}
              {uploadState === 'done' && (
                <>
                  <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
                  <p className="font-sans text-base font-medium text-foreground">{uploadedFile?.name}</p>
                  <p className="font-sans text-sm text-muted-foreground">{uploadedFile && formatSize(uploadedFile.size)} · Analysis complete</p>
                </>
              )}
            </div>

            {/* Job Details */}
            <div className="glass-card rounded-3xl p-6 flex flex-col gap-5">
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground mb-1">Target Role</h3>
                <p className="font-sans text-xs text-muted-foreground">Tell us what you&apos;re applying for to get tailored ATS scoring.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block font-sans text-xs font-medium text-muted-foreground mb-1.5">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input type="text" placeholder="e.g. ML Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-muted-foreground mb-1.5">Job Listing URL <span className="text-muted-foreground/50">(optional)</span></label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input type="url" placeholder="https://linkedin.com/jobs/..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                {[{ icon: Shield, text: 'Bank-level encryption' }, { icon: Zap, text: 'AI parsing in seconds' }, { icon: Lock, text: 'Your data stays private' }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans"><Icon className="w-3 h-3" />{text}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showResults && (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">
          {/* Header row */}
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-medium text-foreground mb-1">Analysis Results</h1>
              <p className="font-sans text-sm text-muted-foreground">{uploadedFile?.name}{jobTitle && <> · targeting <span className="text-primary font-medium">{jobTitle}</span></>}</p>
            </div>
            <button onClick={reset} className="btn-pill glass-card text-foreground text-sm border border-border hover:scale-105 active:scale-95 flex items-center gap-2">
              <Upload className="w-4 h-4" /> New Analysis
            </button>
          </motion.div>

          {/* Overall score banner */}
          {scores && (
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={scores.overall_fit} />
              <div className="flex-1">
                <h3 className="font-serif text-xl font-medium text-foreground mb-1">
                  {scores.overall_fit >= 75 ? 'Strong match — you\'re in great shape' :
                   scores.overall_fit >= 50 ? 'Good score — room to improve' :
                   scores.overall_fit >= 30 ? 'Needs work — but we\'ve got a plan' :
                   'Significant gaps — let\'s fix them together'}
                </h3>
                <p className="font-sans text-sm text-muted-foreground">
                  {scores.overall_fit >= 50
                    ? 'Your resume is ATS-compatible. Check the detailed analysis below for specific improvements.'
                    : 'Your resume needs some attention. The detailed analysis below will show you exactly where to focus.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* ═══ Two-column layout ═══ */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">

            {/* ─── LEFT COLUMN ─── */}
            <div className="lg:col-span-5 flex flex-col gap-5">

              {/* Score Breakdown bars */}
              {scores && (
                <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                  <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Score Breakdown</h3>
                  <div className="flex flex-col gap-4">
                    {breakdownConfig.map((cfg) => {
                      const value = scores[cfg.key] ?? 0
                      return (
                        <div key={cfg.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-sans text-sm font-medium text-foreground">{cfg.label}</span>
                            <span className={`font-serif text-sm font-semibold ${getScoreColor(value)}`}>{value}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, delay: 0.2 }}
                              className={`h-full rounded-full ${getScoreBarColor(value)}`} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* 4 Highlight cards — 2x2 grid */}
              {highlights && highlights.length >= 4 && (
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                  {highlights.map((h, i) => {
                    const Icon = highlightIcons[h.icon] || CheckCircle2
                    const isStrength = h.icon === 'check' || h.icon === 'trending'
                    return (
                      <div key={i} className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${isStrength ? 'text-primary' : 'text-amber-500'}`} />
                          <span className="font-sans text-xs font-semibold text-foreground leading-tight">{h.title}</span>
                        </div>
                        <p className="font-sans text-[11px] text-muted-foreground leading-relaxed">{h.description}</p>
                      </div>
                    )
                  })}
                </motion.div>
              )}

              {/* Parsed resume details — Resume Breakdown + Job Requirements */}
              {(sections['resume breakdown'] || sections['job requirements']) && (
                <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                  {sections['resume breakdown'] && (
                    <div className="mb-4">
                      <h3 className="font-serif text-base font-semibold text-foreground mb-2">Resume Breakdown</h3>
                      <div className="font-sans text-sm"><Markdown>{sections['resume breakdown']}</Markdown></div>
                    </div>
                  )}
                  {sections['job requirements'] && (
                    <div>
                      <h3 className="font-serif text-base font-semibold text-foreground mb-2">Job Requirements</h3>
                      <div className="font-sans text-sm"><Markdown>{sections['job requirements']}</Markdown></div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* ─── RIGHT COLUMN ─── */}
            <div className="lg:col-span-7 flex flex-col gap-5">

              {/* Overall Assessment (Step 6 content — most important, shown first) */}
              {sections['overall assessment'] && (
                <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Overall Assessment</h3>
                  <div className="font-sans"><Markdown>{sections['overall assessment']}</Markdown></div>
                </motion.div>
              )}

              {/* HR Analysis card with score */}
              {scores && sections['hr analysis'] && (
                <motion.div variants={fadeUp}>
                  <AnalysisCard
                    title="HR Analysis"
                    icon={Users}
                    score={scores.hr_score}
                    benchmark="Successful candidates for this role typically score 65-80 in HR screening."
                  >
                    <Markdown>{sections['hr analysis']}</Markdown>
                  </AnalysisCard>
                </motion.div>
              )}

              {/* ATS Compatibility card with score */}
              {scores && sections['ats compatibility'] && (
                <motion.div variants={fadeUp}>
                  <AnalysisCard
                    title="ATS Compatibility"
                    icon={Bot}
                    score={scores.ats_score}
                    benchmark="Resumes that pass ATS screening for this role typically score 70-85."
                  >
                    <Markdown>{sections['ats compatibility']}</Markdown>
                  </AnalysisCard>
                </motion.div>
              )}

              {/* Knowledge & Competency Gaps card with score */}
              {scores && sections['knowledge & competency gaps'] && (
                <motion.div variants={fadeUp}>
                  <AnalysisCard
                    title="Knowledge & Competency Gaps"
                    icon={Brain}
                    score={scores.knowledge_score}
                    benchmark="Successful candidates typically cover 75-85% of required competencies."
                  >
                    <Markdown>{sections['knowledge & competency gaps']}</Markdown>
                  </AnalysisCard>
                </motion.div>
              )}
            </div>
          </div>

          {/* Fallback: if sections didn't parse, show full analysis */}
          {analysisText && !sections['overall assessment'] && !sections['hr analysis'] && (
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6">
              <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Detailed Analysis</h3>
              <div className="font-sans"><Markdown>{analysisText}</Markdown></div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
