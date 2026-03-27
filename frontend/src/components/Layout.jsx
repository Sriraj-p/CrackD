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
