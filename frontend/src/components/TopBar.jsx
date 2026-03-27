import { Moon, Sun, User } from 'lucide-react'

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 0 && hour < 5) return { text: 'burning the midnight oil I see, good luck!', emoji: '✨' }
  if (hour >= 5 && hour < 8) return { text: 'early bird gets the offer!', emoji: '🌅' }
  if (hour >= 8 && hour < 12) return { text: "let's crack this morning!", emoji: '☀️' }
  if (hour >= 12 && hour < 17) return { text: 'afternoon grind, respect.', emoji: '💪' }
  if (hour >= 17 && hour < 21) return { text: 'evening prep session, nice.', emoji: '🌙' }
  return { text: 'burning the midnight oil I see, good luck!', emoji: '✨' }
}

export default function TopBar({ theme, onToggleTheme }) {
  const greeting = getTimeGreeting()

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

      {/* Right: Greeting + Theme + User */}
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

        {/* User avatar */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--surface-container-high)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid var(--outline)',
        }}>
          <User size={16} color="var(--on-surface-variant)" />
        </div>
      </div>
    </header>
  )
}
