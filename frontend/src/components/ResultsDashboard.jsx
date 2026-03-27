import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Download, MessageSquareText, Video, ArrowLeft, TrendingUp, Target, FileCheck, Zap } from 'lucide-react'

const scoreConfig = [
  { key: 'overall_fit', label: 'Overall Fit', icon: Target, suffix: '%' },
  { key: 'experience_relevance', label: 'Experience', icon: TrendingUp, suffix: '/100' },
  { key: 'resume_quality', label: 'Resume Quality', icon: FileCheck, suffix: '/100' },
  { key: 'growth_potential', label: 'Growth', icon: Zap, suffix: '/100' },
]

function ScoreCard({ label, value, icon: Icon, suffix, delay }) {
  const getColor = (v) => {
    if (v >= 75) return 'var(--success)'
    if (v >= 50) return 'var(--primary)'
    if (v >= 30) return 'var(--warning)'
    return 'var(--error)'
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        background: 'var(--surface-container)',
        borderRadius: '16px',
        padding: '24px',
        animationDelay: `${delay}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: getColor(value),
        opacity: 0.6,
        borderRadius: '16px 16px 0 0',
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <div className="label-upper">{label}</div>
        <Icon size={18} color="var(--on-surface-dim)" />
      </div>

      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2.5rem',
        fontWeight: 400,
        color: getColor(value),
        lineHeight: 1,
        marginBottom: '8px',
      }}>
        {value}<span style={{ fontSize: '1rem', color: 'var(--on-surface-dim)' }}>{suffix}</span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '4px',
        borderRadius: '2px',
        background: 'var(--surface-container-high)',
      }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          borderRadius: '2px',
          background: getColor(value),
          transition: 'width 1s var(--ease-out)',
        }} />
      </div>
    </div>
  )
}

export default function ResultsDashboard({ analysis, scores, onCareerChat, onMockInterview, onBack }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      doc.setFontSize(20)
      doc.text('CrackD — Resume Analysis Report', 20, 25)

      doc.setFontSize(10)
      doc.setTextColor(120)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35)

      if (scores) {
        doc.setFontSize(12)
        doc.setTextColor(0)
        let y = 50
        doc.text(`Overall Fit: ${scores.overall_fit}%`, 20, y)
        doc.text(`Experience Relevance: ${scores.experience_relevance}/100`, 20, y + 10)
        doc.text(`Resume Quality: ${scores.resume_quality}/100`, 20, y + 20)
        doc.text(`Growth Potential: ${scores.growth_potential}/100`, 20, y + 30)
        y += 45
        doc.setDrawColor(200)
        doc.line(20, y, 190, y)
        y += 10

        if (analysis) {
          doc.setFontSize(10)
          const lines = doc.splitTextToSize(analysis, 170)
          for (const line of lines) {
            if (y > 270) {
              doc.addPage()
              y = 20
            }
            doc.text(line, 20, y)
            y += 5.5
          }
        }
      }

      doc.save('crackd-analysis-report.pdf')
    } catch (e) {
      console.error('PDF generation failed:', e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100%',
      overflow: 'auto',
      background: 'var(--gradient-surface)',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px',
      }}>
        {/* Header */}
        <div className="animate-fade-in" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '36px',
        }}>
          <div>
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--on-surface-variant)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: 0,
                marginBottom: '12px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
            >
              <ArrowLeft size={14} /> New Analysis
            </button>
            <h1 className="headline-section" style={{ fontSize: '1.8rem', fontStyle: 'normal' }}>
              Analysis <em style={{ color: 'var(--primary)' }}>Results</em>
            </h1>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--on-surface-variant)',
              marginTop: '6px',
            }}>
              Your career trajectory, examined through dual lenses.
            </p>
          </div>
        </div>

        {/* Score Cards Grid */}
        {scores && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {scoreConfig.map((cfg, i) => (
              <ScoreCard
                key={cfg.key}
                label={cfg.label}
                value={scores[cfg.key]}
                icon={cfg.icon}
                suffix={cfg.suffix}
                delay={i * 100}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          <button className="btn-primary" onClick={onCareerChat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareText size={16} /> Discuss Resume
          </button>
          <button className="btn-primary" onClick={onMockInterview} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={16} /> Start Mock Interview
          </button>
          <button className="btn-ghost" onClick={handleDownloadPDF} disabled={downloading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> {downloading ? 'Generating...' : 'Download Report'}
          </button>
        </div>

        {/* Analysis Content */}
        {analysis && (
          <div
            className="animate-slide-up glass-card"
            style={{
              padding: '32px',
              animationDelay: '400ms',
            }}
          >
            <div className="label-upper" style={{ marginBottom: '16px' }}>
              Detailed Analysis
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
