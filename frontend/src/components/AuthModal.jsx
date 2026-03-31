import { useState } from 'react'
import { X, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('options') // 'options' | 'email-login' | 'email-register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleOAuth = async (provider) => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setError(error.message)
    // Supabase handles the redirect — onAuthStateChange in App.jsx picks up the session
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // onAuthStateChange in App.jsx handles the rest
    setLoading(false)
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // onAuthStateChange in App.jsx handles the rest
    setLoading(false)
  }

  const resetToOptions = () => {
    setMode('options')
    setError(null)
    setEmail('')
    setPassword('')
    setFullName('')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease both',
        }}
      />

      {/* Modal */}
      <div
        className="glass-card animate-slide-up"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 400,
          padding: '32px',
          zIndex: 1001,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--on-surface-dim)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            borderRadius: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--on-surface)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-dim)'}
        >
          <X size={18} />
        </button>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1.8rem',
            fontWeight: 500,
            color: 'var(--primary)',
            letterSpacing: '-0.03em',
            marginBottom: '6px',
          }}>
            CrackD
          </h2>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--on-surface-variant)',
          }}>
            {mode === 'options' && 'Sign in to get started'}
            {mode === 'email-login' && 'Sign in with email'}
            {mode === 'email-register' && 'Create your account'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(207, 102, 121, 0.1)',
            border: '1px solid rgba(207, 102, 121, 0.2)',
            marginBottom: '20px',
          }}>
            <AlertCircle size={15} color="var(--error)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--error)', lineHeight: 1.4 }}>
              {error}
            </span>
          </div>
        )}

        {/* ─── Options View ─── */}
        {mode === 'options' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Google */}
            <button onClick={() => handleOAuth('google')} style={oauthBtnStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub */}
            <button onClick={() => handleOAuth('github')} style={oauthBtnStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--on-surface)">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '4px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--outline)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-dim)', letterSpacing: '0.05em' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--outline)' }} />
            </div>

            {/* Email */}
            <button onClick={() => setMode('email-login')} style={oauthBtnStyle}>
              <Mail size={18} color="var(--on-surface-variant)" />
              <span>Continue with Email</span>
            </button>

            {/* Sign up link */}
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('email-register'); setError(null) }}
                style={linkBtnStyle}
              >
                Sign up
              </button>
            </p>
          </div>
        )}

        {/* ─── Email Login ─── */}
        {mode === 'email-login' && (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={fieldWrapStyle}>
              <label className="label-upper" htmlFor="login-email">Email</label>
              <input
                id="login-email" type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.ac.uk"
                autoComplete="email"
                style={inputStyle}
                onFocus={e => applyFocus(e.target)} onBlur={e => removeFocus(e.target)}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label className="label-upper" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password" type={showPassword ? 'text' : 'password'} value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => applyFocus(e.target)} onBlur={e => removeFocus(e.target)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtnStyle} tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={submitBtnStyle(loading)}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={14} /></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('email-register'); setError(null); setPassword('') }} style={linkBtnStyle}>Sign up</button>
              {' · '}
              <button type="button" onClick={resetToOptions} style={linkBtnStyle}>Back</button>
            </p>
          </form>
        )}

        {/* ─── Email Register ─── */}
        {mode === 'email-register' && (
          <form onSubmit={handleEmailRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={fieldWrapStyle}>
              <label className="label-upper" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name" type="text" value={fullName} required
                onChange={e => setFullName(e.target.value)}
                placeholder="Sriraj Paruchuru"
                autoComplete="name"
                style={inputStyle}
                onFocus={e => applyFocus(e.target)} onBlur={e => removeFocus(e.target)}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label className="label-upper" htmlFor="reg-email">Email</label>
              <input
                id="reg-email" type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.ac.uk"
                autoComplete="email"
                style={inputStyle}
                onFocus={e => applyFocus(e.target)} onBlur={e => removeFocus(e.target)}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label className="label-upper" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password" type={showPassword ? 'text' : 'password'} value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => applyFocus(e.target)} onBlur={e => removeFocus(e.target)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtnStyle} tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={submitBtnStyle(loading)}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={14} /></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('email-login'); setError(null); setPassword('') }} style={linkBtnStyle}>Sign in</button>
              {' · '}
              <button type="button" onClick={resetToOptions} style={linkBtnStyle}>Back</button>
            </p>
          </form>
        )}
      </div>
    </>
  )
}

// ─── Shared styles ───

const oauthBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid var(--outline)',
  background: 'var(--surface-container)',
  color: 'var(--on-surface)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.84rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s',
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid var(--outline)',
  background: 'var(--surface-container)',
  color: 'var(--on-surface)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.86rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}

const fieldWrapStyle = { display: 'flex', flexDirection: 'column', gap: '5px' }

const eyeBtnStyle = {
  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', color: 'var(--on-surface-dim)',
  cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
}

const linkBtnStyle = {
  background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.78rem', textDecoration: 'underline',
  textUnderlineOffset: '2px', fontFamily: 'var(--font-sans)',
}

const submitBtnStyle = (loading) => ({
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '8px', padding: '13px', fontSize: '0.8rem',
  opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
})

const applyFocus = (el) => { el.style.borderColor = 'var(--primary)'; el.style.boxShadow = '0 0 0 2px var(--primary-container)' }
const removeFocus = (el) => { el.style.borderColor = 'var(--outline)'; el.style.boxShadow = 'none' }
