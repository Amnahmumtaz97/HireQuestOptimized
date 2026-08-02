'use client'

import { useEffect, useRef, useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { X, Send, Sparkles, Minimize2 } from 'lucide-react'

type ChatRole = 'assistant' | 'user'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  time: string
}

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content:
      "Hi! I'm HireQuest AI. I can help you pick an interview track, explain how feedback works, or walk you through your first mock. What are you preparing for?",
    time: 'Now',
  },
]

const QUICK_PROMPTS = [
  'How does AI feedback work?',
  'Which interview categories are available?',
  'Start a mock interview',
  'How is my performance evaluated?',
]

function formatTime() {
  const d = new Date()
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (open && !minimized) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
        inputRef.current?.focus()
      })
    }
  }, [open, minimized, messages.length])

  const send = (text: string) => {
    const value = text.trim()
    if (!value) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: value,
      time: formatTime(),
    }
    // NOTE: UI-only stub. No AI calls are made — a placeholder assistant
    // response is queued so the interaction feels alive during design review.
    const stubReply: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content:
        "Great — I'm just the UI shell for now, so I can't answer live yet. Once wired up, I'll route this to HireQuest's AI and reply with a real answer.",
      time: formatTime(),
    }

    setMessages((prev) => [...prev, userMsg, stubReply])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Launcher (floating button — no background around lottie) */}
      <button
        type="button"
        aria-label={open ? 'Close HireQuest AI chat' : 'Open HireQuest AI chat'}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          setMinimized(false)
        }}
        className={[
          'group fixed z-[60] bottom-5 right-5 sm:bottom-6 sm:right-6',
          'inline-flex items-center justify-center',
          'h-20 w-20 sm:h-24 sm:w-24',
          'bg-transparent border-0 shadow-none p-0',
          'transition-transform duration-200 will-change-transform',
          'hover:-translate-y-0.5',
          open ? 'scale-95' : 'scale-100',
        ].join(' ')}
      >
        {open ? (
          <span className="grid h-11 w-11 place-items-center rounded-full bg-card border border-border shadow-[0_10px_24px_-10px_rgba(17,24,39,0.28)]">
            <X className="h-5 w-5 text-foreground" strokeWidth={1.8} />
          </span>
        ) : (
          <div className="relative h-full w-full">
            <DotLottieReact
              src="/Live%20chatbot.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
            {/* Live indicator dot */}
            <span
              aria-hidden
              className="absolute right-2 top-2 grid h-3 w-3 place-items-center rounded-full bg-success shadow-[0_0_0_3px_var(--success-muted)]"
            >
              <span
                className="h-1 w-1 rounded-full bg-primary-foreground"
                style={{ animation: 'chatbot-pulse 1.6s ease-in-out infinite' }}
              />
            </span>
          </div>
        )}
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="HireQuest AI Chat"
        aria-hidden={!open}
        className={[
          'fixed z-[59] bottom-24 right-4 sm:right-6',
          'w-[min(100%,calc(100vw-2rem))] max-w-[380px] sm:w-[380px]',
          'origin-bottom-right transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open
            ? minimized
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none',
        ].join(' ')}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_28px_64px_-20px_rgba(17,24,39,0.32)]">
          {/* Header */}
          <div
            className="relative flex items-center justify-between gap-3 bg-primary px-4 py-3.5 text-primary-foreground"
            style={{
              background:
                'linear-gradient(135deg, var(--primary-active) 0%, var(--primary) 55%, var(--primary-hover) 100%)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 shrink-0">
                <DotLottieReact
                  src="/Live%20chatbot.lottie"
                  loop
                  autoplay
                  style={{ width: '100%', height: '100%' }}
                />
                <span
                  aria-hidden
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-primary"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14.5px] font-bold tracking-[-0.01em]">
                  HireQuest AI
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] text-primary-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Online · Replies in seconds
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
                onClick={() => setMinimized((m) => !m)}
                className="grid h-10 w-10 place-items-center rounded-lg text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Minimize2 className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Body */}
          {!minimized && (
            <>
              <div
                ref={scrollRef}
                className="max-h-[min(62vh,calc(100dvh-11rem))] min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5 bg-[var(--secondary)] sm:min-h-[240px]"
              >
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}

                {/* Typing hint on first open */}
                <div className="pt-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
                    Quick prompts
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => send(p)}
                        className="text-[12.5px] font-semibold px-3 py-1.5 rounded-full border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Composer */}
              <div className="border-t border-border bg-card px-3 py-3">
                <div className="relative flex items-end gap-2 rounded-xl border border-border bg-[var(--secondary)] px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-[color-mix(in_oklab,var(--primary)_18%,transparent)] transition-all">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask HireQuest AI anything…"
                    className="flex-1 resize-none bg-transparent border-0 outline-none text-[14px] text-foreground placeholder:text-muted-foreground/80 py-1.5 max-h-32 leading-[1.5]"
                    style={{ boxShadow: 'none' }}
                  />
                  <button
                    type="button"
                    aria-label="Send message"
                    onClick={() => send(input)}
                    disabled={!input.trim()}
                    className={[
                      'grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all',
                      input.trim()
                        ? 'bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_color-mix(in_oklab,var(--primary)_60%,transparent)] hover:bg-primary-hover'
                        : 'bg-border text-muted-foreground cursor-not-allowed',
                    ].join(' ')}
                  >
                    <Send className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" strokeWidth={1.8} />
                    Powered by HireQuest AI
                  </span>
                  <span className="hidden sm:inline">
                    Press <kbd className="rounded border border-border bg-card px-1 font-sans">Enter</kbd> to send
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes chatbot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.4); opacity: 0.35; }
        }
      `}</style>
    </>
  )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={['flex gap-2.5', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      {!isUser && (
        <div className="h-8 w-8 shrink-0">
          <DotLottieReact
            src="/Live%20chatbot.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
      <div
        className={[
          'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-[1.55]',
          isUser
            ? 'rounded-br-md bg-primary text-primary-foreground shadow-[0_4px_12px_-6px_color-mix(in_oklab,var(--primary)_40%,transparent)]'
            : 'rounded-bl-md border border-border bg-card text-foreground',
        ].join(' ')}
      >
        <p>{msg.content}</p>
        <div
          className={[
            'mt-1 text-[10.5px]',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground',
          ].join(' ')}
        >
          {msg.time}
        </div>
      </div>
      {isUser && (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          You
        </div>
      )}
    </div>
  )
}
