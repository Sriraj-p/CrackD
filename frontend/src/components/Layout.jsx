import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout({ currentView, onNavigate, theme, onToggleTheme, hasResults, children }) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--surface)',
    }}>
      {/* Sidebar */}
      <Sidebar
    currentView={currentView}
    chatMode={chatMode}
    onNavigate={onNavigate}
    hasResults={hasResults}
  />

      {/* Main area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100vh',
      }}>
        {/* Top Bar */}
        <TopBar
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        {/* Announcement Banner */}
        <div style={{
          background: 'var(--primary)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'inline-block',
            animation: 'scroll-left 30s linear infinite',
            padding: '6px 0',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--on-primary)',
          }}>
            🚀 CrackD V2 is coming — Voice Chat interviews, Login-based sessions, 30-day progress tracking, Company-specific prep & more — Stay tuned!
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            🚀 CrackD V2 is coming — Voice Chat interviews, Login-based sessions, 30-day progress tracking, Company-specific prep & more — Stay tuned!
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            🚀 CrackD V2 is coming — Voice Chat interviews, Login-based sessions, 30-day progress tracking, Company-specific prep & more — Stay tuned!
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            🚀 CrackD V2 is coming — Voice Chat interviews, Login-based sessions, 30-day progress tracking, Company-specific prep & more — Stay tuned!
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* Contact Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          padding: '6px 32px',
          background: 'var(--surface-dim)',
          borderBottom: '1px solid var(--outline-variant)',
          flexShrink: 0,
          fontSize: '0.7rem',
          color: 'var(--on-surface-dim)',
          letterSpacing: '0.03em',
        }}>
          <span>For enquiries & collaboration:</span>
          <a
            href="mailto:sriraj.paruchuru@gmail.com"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--primary)',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ✉ sriraj.paruchuru@gmail.com
          </a>
          <a
            href="https://instagram.com/sriraj_p"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--primary)',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            📷 @sriraj_p
          </a>
        </div>

        {/* Content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          padding: '12px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'center',
          borderTop: '1px solid var(--outline-variant)',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '0.8rem',
            color: 'var(--on-surface-dim)',
          }}>
            CrackD by Sriraj Paruchuru - Boffin's Den Winner 2026
          </span>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '0.8rem',
            color: 'var(--on-surface-dim)',
            textAlign: 'center',
            opacity: 0.7,
          }}>
            "You don't rise to the level of your goals. You fall to the level of your preparation."
          </span>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'flex-end' }}>
            {['Privacy Policy', 'Terms of Service', 'Journal'].map(link => (
              <span key={link} style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '0.8rem',
                color: 'var(--on-surface-dim)',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--on-surface-dim)'}
              >
                {link}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}