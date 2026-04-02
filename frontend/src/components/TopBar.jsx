import { useState } from 'react'
import { Moon, Sun, LogOut, ChevronDown, LogIn } from 'lucide-react'

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 0 && hour < 5) return { text: 'burning the midnight oil I see, good luck!', emoji: '✨' }
  if (hour >= 5 && hour < 8) return { text: 'early bird gets the offer!', emoji: '🌅' }
  if (hour >= 8 && hour < 12) return { text: "let's crack this morning!", emoji: '☀️' }
  if (hour >= 12 && hour < 17) return { text: 'afternoon grind, respect.', emoji: '💪' }
  if (hour >= 17 && hour < 21) return { text: 'evening prep session, nice.', emoji: '🌙' }
  return { text: 'burning the midnight oil I see, good luck!', emoji: '✨' }
}

export default function TopBar({ theme, onToggleTheme, user, onLogout, onSignIn }) {
  const greeting = getTimeGreeting()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header style={{
      height: 'var(--topbar-height)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--outline-variant)',
      flexShrink: 0,
      background: 'var(--surface)',
    }}>
      {/* Left: Logo + Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '1.3rem',
          fontWeight: 500,
          color: 'var(--primary)',
          cursor: 'pointer',
          letterSpacing: '-0.02em',
        }}>
          CrackD
        </span>
        <nav style={{ display: 'flex', gap: '24px' }}>
          {['Platform', 'Resources', 'Pricing'].map(link => (
            <span key={link} style={{
              fontSize: '0.85rem',
              color: 'var(--on-surface-variant)',
              cursor: 'pointer',
              fontWeight: 400,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--on-surface)'}
              onMouseLeave={e => e.target.style.color = 'var(--on-surface-variant)'}
            >
              {link}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Greeting + Theme + User/SignIn */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Time-aware greeting */}
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: 'var(--on-surface-dim)',
          opacity: 0.8,
        }}>
          {greeting.text}{greeting.emoji}
        </span>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--on-surface-variant)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* ─── Signed out: Sign In button ─── */}
        {!user && (
          <button
            onClick={onSignIn}
            className="btn-ghost"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              fontSize: '0.78rem',
            }}
          >
            <LogIn size={15} />
            Sign In
          </button>
        )}

        {/* ─── Signed in: User dropdown ─── */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '1px solid var(--outline)',
                borderRadius: '999px',
                padding: '4px 12px 4px 4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => {
                if (!showUserMenu) e.currentTarget.style.borderColor = 'var(--outline)'
              }}
            >
              {/* Avatar — use Supabase avatar or initials */}
              {user.avatar_url ? (
                  <>
                    <img
                      src={user.avatar_url}
                      alt=""
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex' }}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--primary-container)',
                      display: 'none', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--primary)', fontFamily: 'var(--font-sans)',
                      }}>
                        {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                      </span>
                    </div>
                  </>
                ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--primary-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: 'var(--primary)', fontFamily: 'var(--font-sans)',
                  }}>
                    {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </span>
                </div>
              )}
              <span style={{
                fontSize: '0.8rem', color: 'var(--on-surface)',
                fontFamily: 'var(--font-sans)', fontWeight: 500,
                maxWidth: '120px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.full_name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown size={14} color="var(--on-surface-dim)" style={{
                transition: 'transform 0.2s',
                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)',
              }} />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                <div className="glass-card" style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  minWidth: '200px', padding: '8px', zIndex: 100,
                  boxShadow: 'var(--shadow-lg)',
                  animation: 'fadeIn 0.15s var(--ease-out) both',
                }}>
                  <div style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--outline-variant)',
                    marginBottom: '4px',
                  }}>
                    <p style={{
                      fontSize: '0.82rem', fontWeight: 500,
                      color: 'var(--on-surface)', fontFamily: 'var(--font-sans)',
                    }}>
                      {user.full_name}
                    </p>
                    <p style={{
                      fontSize: '0.72rem', color: 'var(--on-surface-dim)',
                      fontFamily: 'var(--font-sans)', marginTop: '2px',
                    }}>
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); onLogout() }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', background: 'transparent', border: 'none',
                      borderRadius: '8px', cursor: 'pointer', color: 'var(--error)',
                      fontSize: '0.8rem', fontFamily: 'var(--font-sans)', fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(207, 102, 121, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}