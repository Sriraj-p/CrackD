import { LayoutDashboard, MessageSquareText, Video, FileText, Settings, HelpCircle } from 'lucide-react'

const navItems = [
  { id: 'landing', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'career', label: 'Career Chat', icon: MessageSquareText },
  { id: 'interview', label: 'Mock Interview', icon: Video },
  { id: 'results', label: 'Resume Lab', icon: FileText },
]

export default function Sidebar({ currentView, onNavigate, hasResults }) {
  const getActiveId = () => {
    if (currentView === 'chat') return 'career'
    return currentView
  }
  const activeId = getActiveId()

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minWidth: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--surface-dim)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--outline-variant)',
      flexShrink: 0,
    }}>
      {/* Scholar Card */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--outline-variant)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          borderRadius: '12px',
          background: 'var(--primary-container)',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'var(--gradient-cta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--on-primary)',
          }}>
            S
          </div>
          <div>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--on-surface)',
              lineHeight: 1.2,
            }}>
              The Scholar
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--on-surface-variant)',
              marginTop: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Study Session
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {navItems.map(item => {
          const isActive = activeId === item.id
          const Icon = item.icon
          const isDisabled = (item.id === 'results' && !hasResults) ||
                            (item.id === 'career' && !hasResults) ||
                            (item.id === 'interview' && !hasResults)

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'var(--primary-container)' : 'transparent',
                color: isActive ? 'var(--primary)' : isDisabled ? 'var(--on-surface-dim)' : 'var(--on-surface-variant)',
                cursor: isDisabled ? 'default' : 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s var(--ease-out)',
                textAlign: 'left',
                width: '100%',
                opacity: isDisabled ? 0.4 : 1,
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.background = 'var(--surface-container)'
                  e.currentTarget.style.color = 'var(--on-surface)'
                }
              }}
              onMouseLeave={e => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--on-surface-variant)'
                }
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Upgrade CTA */}
        <button
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '999px',
            border: '1px solid var(--primary)',
            background: 'transparent',
            color: 'var(--primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s var(--ease-out)',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--primary-container)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Upgrade to Pro
        </button>

        {/* Settings & Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
          {[
            { icon: Settings, label: 'Settings' },
            { icon: HelpCircle, label: 'Support' },
          ].map(item => (
            <button
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--on-surface-variant)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--on-surface)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
