'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

const PATTERNS = [
  ['1100', '1110', '0010', '0011'],
  ['1010', '1111', '0101', '0100'],
  ['0110', '1110', '0111', '0011'],
  ['1001', '1101', '1111', '0101'],
  ['1111', '1000', '1110', '0010'],
  ['0100', '1110', '0111', '0001'],
] as const

const TILE_COLORS = ['blue', 'cyan', 'orange', 'green'] as const

const GENERATION_MESSAGES = [
  'Building your interview',
  'Reading your configuration',
  'Shaping your question set',
  'Preparing your practice session',
] as const

type Tile = {
  index: number
  color: (typeof TILE_COLORS)[number]
  firstPattern: number
  secondPattern: number
  active: boolean
}

function createTiles(): Tile[] {
  const columns = 14
  const rows = 8
  const tiles: Tile[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column
      const inUpperCluster = row < 4 && column > 5 && column < 13
      const inLowerCluster = row > 3 && column > 1 && column < 9
      const inLeftAccent = row > 1 && row < 6 && column < 4
      const active = inUpperCluster || inLowerCluster || inLeftAccent
      const isGap = (row + column * 2) % 7 === 0 || (row === 3 && column === 9)

      tiles.push({
        index,
        active: active && !isGap,
        color: TILE_COLORS[(row * 3 + column) % TILE_COLORS.length],
        firstPattern: (index * 3 + row) % PATTERNS.length,
        secondPattern: (index + column * 2 + 1) % PATTERNS.length,
      })
    }
  }

  return tiles
}

const TILES = createTiles()

function Pattern({ patternIndex }: { patternIndex: number }) {
  return (
    <span className="hq-generation-pattern" aria-hidden="true">
      {PATTERNS[patternIndex].map((row, rowIndex) =>
        [...row].map((filled, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            className={filled === '1' ? 'hq-generation-pixel hq-generation-pixel--filled' : 'hq-generation-pixel'}
          />
        )),
      )}
    </span>
  )
}

export function InterviewGenerationLoader() {
  const [revealingTiles, setRevealingTiles] = useState<Set<number>>(() => new Set())
  const revealTimers = useRef<Map<number, number>>(new Map())

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousBodyTouchAction = body.style.touchAction
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'

    return () => {
      for (const timer of revealTimers.current.values()) window.clearTimeout(timer)
      revealTimers.current.clear()
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      body.style.touchAction = previousBodyTouchAction
    }
  }, [])

  const revealTile = (index: number) => {
    if (revealTimers.current.has(index)) return

    setRevealingTiles((current) => new Set(current).add(index))
    const timer = window.setTimeout(() => {
      revealTimers.current.delete(index)
      setRevealingTiles((current) => {
        const next = new Set(current)
        next.delete(index)
        return next
      })
    }, 8000)
    revealTimers.current.set(index, timer)
  }

  return (
    <div className="hq-generation-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="hq-generation-loader__topline" aria-hidden="true">
        <span>HQ / INTERVIEW ENGINE</span>
        <span className="hq-generation-loader__signal">LIVE BUILD</span>
      </div>

      <div className="hq-generation-loader__grid">
        {TILES.map((tile) => (
          <div
            key={tile.index}
            className={[
              'hq-generation-tile',
              `hq-generation-tile--${tile.color}`,
              revealingTiles.has(tile.index) ? 'hq-generation-tile--revealing' : '',
            ].join(' ')}
            tabIndex={0}
            aria-label={`Reveal grid pattern ${tile.index + 1}`}
            onMouseEnter={() => revealTile(tile.index)}
            onFocus={() => revealTile(tile.index)}
            style={{ '--tile-index': tile.index } as CSSProperties}
          >
            <Pattern patternIndex={tile.firstPattern} />
            <Pattern patternIndex={tile.secondPattern} />
          </div>
        ))}
      </div>

      <div className="hq-generation-loader__content">
        <div className="hq-generation-loader__eyebrow">
          <span className="hq-generation-loader__dot" aria-hidden="true" />
          PERSONALIZED SESSION
        </div>
        <h1 className="hq-generation-loader__headline" aria-hidden="true">
          {GENERATION_MESSAGES.map((message, index) => (
            <span
              key={message}
              className="hq-generation-loader__headline-line"
              style={{ '--message-index': index } as CSSProperties}
            >
              {message}
            </span>
          ))}
        </h1>
        <div className="hq-generation-loader__progress" aria-hidden="true">
          <span />
        </div>
        <span className="sr-only">Building your interview. Please wait while your personalized session is prepared.</span>
      </div>

      <div className="hq-generation-loader__footer" aria-hidden="true">
        <span>CONFIGURATION RECEIVED</span>
        <span>QUESTIONS IN PROGRESS</span>
        <span>SESSION PREPARING</span>
      </div>
    </div>
  )
}
