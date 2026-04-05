'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Brain, Target, FileSearch, MessageCircle, BarChart3 } from 'lucide-react'

const stats = [
  { value: '94%', label: 'Interview Success Rate' },
  { value: '2.3x', label: 'Faster Prep Time' },
  { value: '50K+', label: 'Students Helped' },
]

const featureCards = [
  { icon: FileSearch, title: 'Smart Resume Parsing', description: 'AI extracts every detail from your CV' },
  { icon: BarChart3, title: 'ATS Score Analysis', description: 'Know exactly where you stand' },
  { icon: MessageCircle, title: 'Mock Interviews', description: 'Practice with adaptive AI' },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 32, filter: 'blur(4px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }
const card = { hidden: { opacity: 0, x: 40 }, visible: (i: number) => ({ opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 + i * 0.1 } }) }

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden px-4 pt-24 pb-16">
      <div aria-hidden className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--primary)' }} />
      <div aria-hidden className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl" style={{ background: 'var(--accent)' }} />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div className="lg:col-span-7 lg:pr-8" variants={container} initial="hidden" animate="visible">
            <motion.div variants={item} className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-sans text-muted-foreground tracking-wide uppercase">AI Multi-Agent Interview Prep</span>
            </motion.div>

            <motion.h1 variants={item} className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-tight text-balance text-foreground mb-6">
              Land your dream role. <span className="italic text-primary">Effortlessly.</span>
            </motion.h1>

            <motion.p variants={item} className="font-sans text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed text-pretty mb-10">
              CrackD&apos;s multi-agent AI analyzes your resume, scores ATS compatibility, and runs realistic mock interviews — all in one fluid, calming workspace.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link href="/login" className="btn-pill bg-primary text-primary-foreground text-base glow-primary hover:opacity-90 hover:scale-105 active:scale-95">Get Started Free</Link>
              <a href="#features" className="btn-pill glass-card text-foreground text-base border border-border hover:scale-105 active:scale-95">See How It Works</a>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap items-center gap-8 lg:gap-12">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-left">
                  <div className="font-serif text-3xl font-semibold text-primary">{value}</div>
                  <div className="text-xs font-sans text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="lg:col-span-5 relative">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} aria-hidden className="absolute -top-4 -left-4 flex items-center gap-2 glass-card px-3 py-2 rounded-full text-xs font-sans text-muted-foreground z-10">
              <Brain className="w-3 h-3 text-primary" />AI-Powered
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} aria-hidden className="absolute -bottom-2 -right-2 flex items-center gap-2 glass-card px-3 py-2 rounded-full text-xs font-sans text-muted-foreground z-10">
              <Target className="w-3 h-3 text-primary" />ATS Optimized
            </motion.div>

            <div className="flex flex-col gap-4 lg:pl-4">
              {featureCards.map(({ icon: Icon, title, description }, i) => (
                <motion.div key={title} custom={i} variants={card} initial="hidden" animate="visible"
                  className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:scale-[1.02] transition-transform duration-300"
                  style={{ marginLeft: i % 2 === 1 ? '2rem' : '0' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--primary)', opacity: 0.15 }}>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-foreground text-sm">{title}</p>
                    <p className="font-sans text-xs text-muted-foreground mt-1">{description}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card rounded-2xl p-4 flex items-center gap-3 max-w-fit ml-8 glow-primary">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-sans text-sm font-medium text-foreground">97% Match Rate</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2, duration: 0.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs font-sans text-muted-foreground">Scroll to explore</span>
        <ArrowDown className="w-4 h-4 text-muted-foreground animate-bounce" />
      </motion.div>
    </section>
  )
}
