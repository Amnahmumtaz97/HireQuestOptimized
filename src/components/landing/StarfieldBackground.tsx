'use client'

/** Uiverse.io (amir_6539) — starfield via layered box-shadows + looping translate. */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function starShadow(count: number, seed: number) {
  const rnd = mulberry32(seed)
  const parts: string[] = []
  for (let i = 0; i < count; i += 1) {
    parts.push(`${Math.floor(rnd() * 2000)}px ${Math.floor(rnd() * 2000)}px var(--hq-star-color)`)
  }
  return parts.join(',')
}

const SHADOW_S = starShadow(700, 11)
const SHADOW_M = starShadow(200, 29)
const SHADOW_L = starShadow(100, 47)

function StarLayer({
  shadow,
  size,
  duration,
}: {
  shadow: string
  size: 1 | 2 | 3
  duration: number
}) {
  const dim = `${size}px`
  return (
    <>
      <div
        className="hq-star-layer"
        style={{
          width: dim,
          height: dim,
          boxShadow: shadow,
          animationDuration: `${duration}s`,
        }}
      />
      <div
        className="hq-star-layer"
        style={{
          top: 2000,
          width: dim,
          height: dim,
          boxShadow: shadow,
          animationDuration: `${duration}s`,
        }}
      />
    </>
  )
}

export function StarfieldBackground({
  section = false,
  overlay = false,
}: {
  section?: boolean
  /** Stars only — no opaque sky fill (for layering over existing artwork). */
  overlay?: boolean
}) {
  const classes = [
    'hq-starfield',
    section || overlay ? 'hq-starfield--section' : '',
    overlay ? 'hq-starfield--overlay' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} aria-hidden>
      <StarLayer shadow={SHADOW_S} size={1} duration={50} />
      <StarLayer shadow={SHADOW_M} size={2} duration={100} />
      <StarLayer shadow={SHADOW_L} size={3} duration={150} />
    </div>
  )
}
