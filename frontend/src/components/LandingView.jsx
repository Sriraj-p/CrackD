import { useState, useRef } from 'react'
import { Upload, FileText, Sparkles, MessageSquareText, Video, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'

export default function LandingView({ onUpload, loading, error }) {
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = () => {
    if (!jobDescription.trim()) return
    if (!file && !resumeText.trim()) return
    onUpload(file, resumeText, jobDescription)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--gradient-surface)',
      overflow: 'auto',
    }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 40px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'start',
      }}>
        {/* Left: Headline */}
        <div style={{ paddingTop: '20px' }}>
          <div className="label-primary" style={{ marginBottom: '16px' }}>
            THE EDITORIAL INTELLIGENCE
          </div>
          <h1 className="headline-display" style={{ marginBottom: '24px' }}>
            Prepare to{' '}
            <em>crack</em>{' '}
            your next interview
          </h1>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--on-surface-variant)',
            maxWidth: '440px',
            marginBottom: '32px',
          }}>
            A serene workspace designed to lower cortisol and heighten focus.
            Transform your professional narrative through curated AI feedback
            and expert-level simulation.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
              Begin Your Journey
            </button>
            <button className="btn-ghost">
              View Methodology
            </button>
          </div>
        </div>

        {/* Right: Upload Card */}
        <div className="glass-card" style={{
          padding: '28px',
          animation: 'fadeIn 0.6s var(--ease-out) 0.2s both',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.2rem',
                fontWeight: 500,
                color: 'var(--on-surface)',
                marginBottom: '4px',
              }}>
                Resume Lab
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                Deep analysis of your career trajectory
              </p>
            </div>
            <FileText size={20} color="var(--primary)" />
          </div>

          {/* File Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--outline)'}`,
              borderRadius: '12px',
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s var(--ease-out)',
              background: dragActive ? 'var(--primary-container)' : 'var(--surface-container)',
              marginBottom: '16px',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files[0]) setFile(e.target.files[0])
              }}
            />
            <Upload size={28} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: '4px' }}>
              {file ? file.name : 'Drop your manuscript here'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-dim)' }}>
              PDF or DOCX (Max 10MB)
            </div>
            {file && (
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                style={{
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--error)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Remove file
              </button>
            )}
          </div>

          {/* OR divider */}
          {!file && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '12px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--outline)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or paste</span>
                <div style={{ flex: 1, height: 1, background: 'var(--outline)' }} />
              </div>
              <textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--outline)',
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '16px',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--outline)'}
              />
            </>
          )}

          {/* Job Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--on-surface-variant)',
              marginBottom: '6px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Target Role
            </label>
            <textarea
              placeholder="Paste job description, URL, or type role + company (e.g., Senior Product Designer at Stripe)"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--outline)',
                background: 'var(--surface-container)',
                color: 'var(--on-surface)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--outline)'}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(207, 102, 121, 0.1)',
              color: 'var(--error)',
              fontSize: '0.8rem',
              marginBottom: '12px',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || (!file && !resumeText.trim()) || !jobDescription.trim()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading || (!file && !resumeText.trim()) || !jobDescription.trim() ? 0.5 : 1,
              cursor: loading ? 'wait' : undefined,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Analysing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Analyse Resume
              </>
            )}
          </button>

          {/* Processing status */}
          {loading && (
            <div style={{
              marginTop: '12px',
              padding: '8px',
              textAlign: 'center',
            }}>
              <div className="label-upper" style={{ marginBottom: '8px' }}>
                System Processing Status: Active
              </div>
              <div style={{
                height: '3px',
                borderRadius: '2px',
                background: 'var(--surface-container-high)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: '60%',
                  background: 'var(--primary)',
                  borderRadius: '2px',
                  animation: 'shimmer 2s ease-in-out infinite',
                  backgroundSize: '200% 100%',
                  backgroundImage: `linear-gradient(90deg, var(--primary) 25%, var(--primary-bright) 50%, var(--primary) 75%)`,
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Cards Section */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '20px 40px 60px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '28px',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.6rem',
              fontWeight: 400,
              color: 'var(--on-surface)',
              marginBottom: '6px',
            }}>
              The Modern Syllabus
            </h2>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--on-surface-variant)',
            }}>
              Preparation is an art form. We provide the tools to master it through
              asymmetrical logic and tonal depth.
            </p>
          </div>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--primary)',
            cursor: 'pointer',
          }}>
            Explore Platform <ArrowRight size={14} />
          </span>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px',
        }}>
          {/* Career Chat Card */}
          <div style={{
            background: 'var(--surface-container)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '200px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <MessageSquareText size={20} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.3rem',
              fontWeight: 500,
              color: 'var(--on-surface)',
              marginBottom: '8px',
            }}>
              Career Chat
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--on-surface-variant)',
              lineHeight: 1.5,
              maxWidth: '280px',
            }}>
              Engage in high-fidelity dialogue with an intelligence trained on world-class hiring standards.
            </p>
            <div className="label-primary" style={{ marginTop: 'auto', paddingTop: '16px' }}>
              Active Session
            </div>
          </div>

          {/* Mock Interview Card */}
          <div style={{
            background: 'var(--surface-container)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '200px',
          }}>
            <Video size={20} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.3rem',
              fontWeight: 500,
              color: 'var(--on-surface)',
              marginBottom: '8px',
            }}>
              Mock Interview
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--on-surface-variant)',
              lineHeight: 1.5,
            }}>
              Real-time simulation with ambient biometric analysis.
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '16px',
        }}>
          {/* Readiness Card */}
          <div style={{
            background: 'var(--surface-container)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <TrendingUp size={18} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1rem',
              fontWeight: 500,
              color: 'var(--on-surface)',
              marginBottom: '4px',
            }}>
              The Scholar
            </h3>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--on-surface-variant)',
              marginBottom: '16px',
            }}>
              Your progress, curated like a collection of fine art.
            </p>
            {/* Progress bar */}
            <div style={{
              height: '4px',
              borderRadius: '2px',
              background: 'var(--surface-container-high)',
              marginBottom: '8px',
            }}>
              <div style={{
                height: '100%',
                width: '75%',
                borderRadius: '2px',
                background: 'var(--primary)',
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--on-surface-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              <span>Readiness</span>
              <span>75%</span>
            </div>
          </div>

          {/* Upgrade Card */}
          <div style={{
            background: 'var(--gradient-cta)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.4rem',
                fontWeight: 500,
                color: 'var(--on-primary)',
                marginBottom: '8px',
              }}>
                Upgrade to Pro
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.8)',
                maxWidth: '320px',
              }}>
                Unlock unlimited sessions, deep narrative analysis, and exclusive interview blueprints.
              </p>
            </div>
            <button style={{
              padding: '12px 28px',
              borderRadius: '999px',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              }}
            >
              Elevate Experience
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
