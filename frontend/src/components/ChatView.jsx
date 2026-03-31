import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send, Paperclip, Download, Sparkles, Loader2 } from 'lucide-react'

export default function ChatView({
  mode,
  onModeChange,
  careerMessages,
  interviewMessages,
  onSendMessage,
  onDownloadTranscript,
  onStartInterview,
  interviewStarted,
  chatLoading,
}) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const messages = mode === 'interview' ? interviewMessages : careerMessages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [mode])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const msg = input.trim()
    setInput('')
    setSending(true)
    await onSendMessage(msg, mode)
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSend()
    }
  }

  const isCareer = mode === 'career'
  const pageTitle = isCareer ? 'Career Guidance' : 'Mock Interview'
  const pageSubtitle = isCareer
    ? 'Your personal AI mentor for the late-night breakthrough.'
    : 'Live simulation with a senior professional.'

  // Show thinking indicator when: last message is from user OR chatLoading (hidden trigger in progress)
  const isThinking = chatLoading

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--gradient-surface)',
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '24px 40px 16px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.8rem',
              fontWeight: 400,
              color: 'var(--on-surface)',
              lineHeight: 1.2,
            }}>
              {pageTitle} <em style={{ color: 'var(--primary)' }}>*Sessions*</em>
            </h1>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.85rem',
              color: 'var(--on-surface-dim)',
              marginTop: '4px',
            }}>
              {pageSubtitle}
            </p>
          </div>

          {/* Mode tabs + Download */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              background: 'var(--surface-container)',
              borderRadius: '999px',
              padding: '3px',
            }}>
              <button
                onClick={() => onModeChange('career')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  background: isCareer ? 'var(--primary-container)' : 'transparent',
                  color: isCareer ? 'var(--primary)' : 'var(--on-surface-variant)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  fontWeight: isCareer ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Career Chat
              </button>
              <button
                onClick={() => {
                  if (!interviewStarted) {
                    onStartInterview()
                  } else {
                    onModeChange('interview')
                  }
                }}
                style={{
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  background: !isCareer ? 'var(--primary-container)' : 'transparent',
                  color: !isCareer ? 'var(--primary)' : 'var(--on-surface-variant)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  fontWeight: !isCareer ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Mock Interview
              </button>
            </div>

            {messages.length > 0 && (
              <button
                onClick={() => onDownloadTranscript(mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid var(--outline)',
                  background: 'transparent',
                  color: 'var(--on-surface-variant)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.color = 'var(--primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--outline)'
                  e.currentTarget.style.color = 'var(--on-surface-variant)'
                }}
              >
                <Download size={12} /> Transcript
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 40px',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          paddingBottom: '20px',
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--on-surface-dim)',
            }}>
              <Sparkles size={32} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1rem',
              }}>
                {isCareer
                  ? 'Your career conversation is about to begin...'
                  : 'Your interviewer is preparing...'}
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={i}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: '20px',
                  animationDelay: `${Math.min(i * 50, 300)}ms`,
                }}
              >
                <div style={{
                  maxWidth: isUser ? '65%' : '72%',
                  width: 'auto',
                }}>
                  {/* Label */}
                  {!isUser && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                    }}>
                      <Sparkles size={12} color="var(--primary)" />
                      <span className="label-upper" style={{ color: 'var(--primary)' }}>
                        {isCareer ? 'System Mentor' : 'Interviewer'}
                      </span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div style={{
                    padding: isUser ? '14px 18px' : '18px 22px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser
                      ? 'var(--surface-container-high)'
                      : 'var(--surface-container)',
                    border: isUser
                      ? '1px solid var(--outline)'
                      : '1px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {isUser ? (
                      <p style={{
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        color: 'var(--on-surface)',
                      }}>
                        {msg.content}
                      </p>
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Timestamp for user messages */}
                  {isUser && (
                    <div style={{
                      textAlign: 'right',
                      marginTop: '4px',
                      fontSize: '0.65rem',
                      color: 'var(--on-surface-dim)',
                    }}>
                      Sent • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Thinking indicator */}
          {isThinking && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '20px',
            }}>
              <div style={{ maxWidth: '72%' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                }}>
                  <Sparkles size={12} color="var(--primary)" />
                  <span className="label-upper" style={{ color: 'var(--primary)' }}>
                    {isCareer ? 'System Mentor' : 'Interviewer'}
                  </span>
                </div>
                <div style={{
                  padding: '18px 22px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'var(--surface-container)',
                  border: '1px solid var(--glass-border)',
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      animation: 'pulse-glow 1.5s ease-in-out infinite',
                    }} />
                    <div style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      animation: 'pulse-glow 1.5s ease-in-out infinite 0.3s',
                    }} />
                    <div style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      animation: 'pulse-glow 1.5s ease-in-out infinite 0.6s',
                    }} />
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--on-surface-dim)',
                      marginLeft: '8px',
                      fontStyle: 'italic',
                    }}>
                      {isCareer ? 'Composing insight...' : 'Formulating question...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        flexShrink: 0,
        padding: '16px 40px 20px',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            background: 'var(--surface-container)',
            borderRadius: '16px',
            padding: '8px 8px 8px 16px',
            border: '1px solid var(--outline)',
            transition: 'border-color 0.2s',
          }}>
            {/* Attachment icon (decorative for now) */}
            <button style={{
              background: 'none',
              border: 'none',
              color: 'var(--on-surface-dim)',
              cursor: 'pointer',
              padding: '6px',
              flexShrink: 0,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-dim)'}
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isCareer
                ? 'Describe your career goals or ask a question...'
                : 'Type your interview response...'}
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--on-surface)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none',
                padding: '6px 0',
                lineHeight: 1.5,
                maxHeight: '120px',
                overflow: 'auto',
              }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: input.trim() ? 'var(--primary)' : 'var(--surface-container-high)',
                color: input.trim() ? 'var(--on-primary)' : 'var(--on-surface-dim)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s var(--ease-out)',
              }}
            >
              {sending ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--on-surface-dim)',
          }}>
            Press CMD + Enter to send session thought
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
