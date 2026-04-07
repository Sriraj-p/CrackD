'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { SessionProvider, useSession } from '@/contexts/session-context'
import {
  Zap, BarChart3, MessageSquare, MessagesSquare, LogOut,
  Sun, Moon, ChevronsLeft, ChevronsRight, User, AlertTriangle, WifiOff,
} from 'lucide-react'

const navItems = [
  { label: 'Analysis Center', href: '/analysis-center', icon: BarChart3 },
  { label: 'Mock Interview', href: '/mock-interview', icon: MessageSquare },
  { label: 'Career Chat', href: '/career-chat', icon: MessagesSquare },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return "Burning the midnight oil? Let's make it count."
  if (h < 9) return "Early bird gets the offer. Let's prep."
  if (h < 12) return "Good morning! Ready to crush it?"
  if (h < 17) return "Afternoon grind. Smart move prepping now."
  if (h < 21) return "Evening session. Consistency wins interviews."
  return "Late night hustle. That dedication will pay off."
}

function SessionErrorBanner() {
  const { sessionError } = useSession()
  if (!sessionError) return null
  return (
    <div className="mx-6 lg:mx-8 mt-4 flex items-center gap-3 glass-card rounded-xl px-4 py-3 border border-accent/30 bg-accent/5">
      <WifiOff className="w-4 h-4 text-accent shrink-0" />
      <p className="font-sans text-sm text-accent">{sessionError}</p>
    </div>
  )
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    }
    return false
  })
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
    }
    return 'dark'
  })
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  // Only warn when leaving mock-interview or career-chat TO analysis-center
  const hasActiveSession = pathname === '/mock-interview' || pathname === '/career-chat'

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    if (hasActiveSession && href === '/analysis-center') {
      e.preventDefault()
      setPendingHref(href)
      setShowWarning(true)
    }
  }, [hasActiveSession])

  const confirmNavigation = () => {
    if (pendingHref) router.push(pendingHref)
    setShowWarning(false)
    setPendingHref(null)
  }

  const cancelNavigation = () => {
    setShowWarning(false)
    setPendingHref(null)
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({ email: user.email, name: user.user_metadata?.full_name || user.email?.split('@')[0] })
      } else {
        // No authenticated user — redirect to login
        router.push(`/login?redirect=${pathname}`)
      }
    }
    getUser()
  }, [supabase.auth, router, pathname])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <motion.aside initial={false} animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="dashboard-sidebar flex flex-col h-full shrink-0 relative z-20">

        <div className="flex items-center gap-2 px-5 pt-6 pb-4">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-lg font-semibold text-foreground tracking-tight">
              Crack<span className="text-primary italic">D</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={(e) => handleNavClick(e, item.href)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-all duration-200 group ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{item.label}</motion.span>}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-4 flex flex-col gap-1">
          <button onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200">
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 shrink-0" /> : <Moon className="w-4.5 h-4.5 shrink-0" />}
            {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>

          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans text-foreground font-medium truncate">{user.name}</p>
                  <p className="text-[10px] font-sans text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setShowSignOutConfirm(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200">
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>

        </div>

        {/* Protruding collapse/expand toggle on sidebar edge */}
        <button onClick={() => setCollapsed((c) => !c)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 z-30 w-6 h-12 rounded-r-lg bg-secondary/80 border border-l-0 border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 backdrop-blur-sm shadow-sm">
          {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
        </button>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        <div aria-hidden className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px]" style={{ background: 'var(--primary)' }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px]" style={{ background: 'var(--accent)' }} />
        </div>

        {/* Greeting — top right */}
        <div className="hidden md:flex justify-end px-6 lg:px-8 pt-6">
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="glass-card px-4 py-2.5 rounded-xl max-w-xs">
            <p className="font-sans text-sm text-primary font-medium italic">{getGreeting()}</p>
          </motion.div>
        </div>

        {/* Session error banner */}
        <SessionErrorBanner />

        <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 lg:p-8 pt-4 lg:pt-4 max-w-7xl mx-auto">
          {children}
        </motion.div>
      </main>

      {/* Session warning modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={cancelNavigation} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }} className="relative glass-card rounded-2xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-1">Start a new analysis?</h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    Going back to the Analysis Center will end your current session. All conversation history and feedback will be lost.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={cancelNavigation} className="px-4 py-2 rounded-xl text-sm font-sans text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">Stay in session</button>
                <button onClick={confirmNavigation} className="px-4 py-2 rounded-xl text-sm font-sans font-medium bg-accent text-accent-foreground hover:opacity-90 transition-all">End session &amp; go back</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign out confirmation modal */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowSignOutConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }} className="relative glass-card rounded-2xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-1">Sign out?</h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    Your current session and any unsaved progress will be lost.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowSignOutConfirm(false)} className="px-4 py-2 rounded-xl text-sm font-sans text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">Cancel</button>
                <button onClick={handleSignOut} className="px-4 py-2 rounded-xl text-sm font-sans font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-all">Sign out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardInner>{children}</DashboardInner>
    </SessionProvider>
  )
}