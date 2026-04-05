'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, CheckCircle2, AlertTriangle, TrendingUp, Loader2, X,
  Briefcase, Link as LinkIcon, Shield, Zap, Lock, Lightbulb, Award, Target, Sparkles,
  FileCheck, AlertCircle,
} from 'lucide-react'
import { useSession } from '@/contexts/session-context'
import { uploadResume, type AnalysisScores } from '@/lib/api'

type UploadState = 'idle' | 'dragging' | 'uploaded' | 'analyzing' | 'done' | 'error'

// Score config matching the backend's four score dimensions
const scoreConfig = [
  { key: 'overall_fit' as const, label: 'Overall Fit', icon: Target, suffix: '%' },
  { key: 'experience_relevance' as const, label: 'Experience Relevance', icon: TrendingUp, suffix: '/100' },
  { key: 'resume_quality' as const, label: 'Resume Quality', icon: FileCheck, suffix: '/100' },
  { key: 'growth_potential' as const, label: 'Growth Potential', icon: Zap, suffix: '/100' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

function ScoreRing({ score }: { score: number }) {
  const r = 54, c = 2 * Math.PI * r
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--secondary)" strokeWidth="8" />
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-bold text-primary">{score}</span>
        <span className="text-[10px] text-muted-foreground font-sans">Overall Fit</span>
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

export default function AnalysisCenterPage() {
  const { sessionId, sessionReady, setAnalysisResult, setAnalysisScores } = useSession()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Real results from backend
  const [scores, setScores] = useState<AnalysisScores | null>(null)
  const [analysisText, setAnalysisText] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    // Store scores and analysis text
    setScores(result.scores)
    setAnalysisText(result.analysis)

    // Share with session context so mock interview and career chat can reference it
    setAnalysisResult(result.analysis)
    setAnalysisScores(result.scores)

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

      {showResults && scores && (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">
          {/* Header */}
          <motion.div variants={fadeUp}>
            <h1 className="font-serif text-3xl font-medium text-foreground mb-2">Analysis Results</h1>
            <p className="font-sans text-muted-foreground">{uploadedFile?.name}{jobTitle && <> · targeting <span className="text-primary font-medium">{jobTitle}</span></>}</p>
          </motion.div>

          {/* Overall score ring + summary */}
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

          {/* Score cards grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scoreConfig.map((cfg) => {
              const Icon = cfg.icon
              const value = scores[cfg.key]
              return (
                <div key={cfg.key} className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">{cfg.label}</span>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className={`font-serif text-3xl font-semibold ${getScoreColor(value)} mb-2`}>
                    {value}<span className="text-sm text-muted-foreground">{cfg.suffix}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full ${getScoreBarColor(value)}`} />
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* Detailed analysis from backend */}
          {analysisText && (
            <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6">
              <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Detailed Analysis</h3>
              <div className="font-sans text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {analysisText}
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
            <button onClick={reset} className="btn-pill glass-card text-foreground text-sm border border-border hover:scale-105 active:scale-95 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Analyze Another Resume
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
