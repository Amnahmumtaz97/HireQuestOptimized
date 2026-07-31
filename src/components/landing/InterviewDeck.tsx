'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Check,
  Mic,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

type DeckRole = 'question' | 'metrics' | 'feedback'

const WAVE = [0, 0.1, 0.2, 0.3, 0.15, 0.25, 0.05, 0.35]

export function InterviewDeck() {
  const [dealt, setDealt] = useState(false)
  const [front, setFront] = useState<DeckRole>('question')

  useEffect(() => {
    const id = window.setTimeout(() => setDealt(true), 120)
    return () => window.clearTimeout(id)
  }, [])

  const cardClass = (role: DeckRole) =>
    [
      'hq-deck-card',
      `hq-deck-card--${role}`,
      front === role ? 'hq-deck-card--front' : '',
    ].join(' ')

  return (
    <div
      className={['hq-deck-stage', dealt ? 'hq-deck-stage--dealt' : ''].join(' ')}
      data-front={front}
    >
      <button
        type="button"
        className={cardClass('feedback')}
        data-role="feedback"
        onClick={() => setFront('feedback')}
        aria-pressed={front === 'feedback'}
      >
        <div className="hq-deck-eyebrow">
          <span className="hq-deck-icon-badge">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
          </span>
          <span className="hq-deck-eyebrow-text">live feedback</span>
        </div>
        <ul className="hq-deck-fb-list">
          <li className="hq-deck-fb-item">
            <Check className="hq-deck-fb-icon" strokeWidth={2.2} />
            Good structure and clarity
          </li>
          <li className="hq-deck-fb-item">
            <Check className="hq-deck-fb-icon" strokeWidth={2.2} />
            Nice explanation of re-rendering
          </li>
          <li className="hq-deck-fb-item">
            <AlertTriangle className="hq-deck-fb-icon hq-deck-fb-icon--warn" strokeWidth={2} />
            Mention the reconciliation algorithm
          </li>
          <li className="hq-deck-fb-item">
            <AlertTriangle className="hq-deck-fb-icon hq-deck-fb-icon--warn" strokeWidth={2} />
            Explain the role of keys in lists
          </li>
        </ul>
      </button>

      <button
        type="button"
        className={cardClass('metrics')}
        data-role="metrics"
        onClick={() => setFront('metrics')}
        aria-pressed={front === 'metrics'}
      >
        <div className="hq-deck-eyebrow">
          <span className="hq-deck-icon-badge">
            <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.8} />
          </span>
          <span className="hq-deck-eyebrow-text">your scores</span>
        </div>
        <div className="hq-deck-metric-row">
          <div className="hq-deck-metric">
            <div className="hq-deck-metric-top">
              <TrendingUp className="h-3 w-3" strokeWidth={2} />
              <span>confidence</span>
            </div>
            <div className="hq-deck-metric-value">92%</div>
            <div className="hq-deck-metric-trend">↑ 14% this week</div>
          </div>
          <div className="hq-deck-metric">
            <div className="hq-deck-metric-top">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              <span>clarity</span>
            </div>
            <div className="hq-deck-metric-value">8.7</div>
            <div className="hq-deck-metric-trend">better structure</div>
          </div>
        </div>
      </button>

      <button
        type="button"
        className={cardClass('question')}
        data-role="question"
        onClick={() => setFront('question')}
        aria-pressed={front === 'question'}
      >
        <div className="hq-deck-eyebrow">
          <span className="hq-deck-icon-badge">
            <Mic className="h-3.5 w-3.5" strokeWidth={1.8} />
          </span>
          <span className="hq-deck-eyebrow-text">question 3 of 8</span>
        </div>
        <p className="hq-deck-q-title">
          Walk me through how React reconciles the virtual DOM. What triggers a re-render?
        </p>
        <div className="hq-deck-waveform" aria-hidden>
          {WAVE.map((delay, i) => (
            <span key={i} style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
        <div className="hq-deck-timer">
          <span>listening…</span>
          <span className="hq-deck-badge">02:14</span>
        </div>
      </button>
    </div>
  )
}
