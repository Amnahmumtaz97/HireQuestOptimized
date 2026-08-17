'use client'

import { useId } from 'react'

export type IsometricIllustrationVariant = 'product' | 'features' | 'solutions'

type IsometricIllustrationProps = {
  variant: IsometricIllustrationVariant
  className?: string
}

/** Shared projection so every scene reads as the same camera and depth. */
const TW = 34
const TH = 17
const ZH = 30
const ORIGIN = { x: 320, y: 252 }

type Pt = { x: number; y: number }

function iso(gx: number, gy: number, gz = 0): Pt {
  return {
    x: ORIGIN.x + (gx - gy) * TW,
    y: ORIGIN.y + (gx + gy) * TH - gz * ZH,
  }
}

function points(list: Pt[]) {
  return list.map((p) => `${Math.round(p.x * 10) / 10},${Math.round(p.y * 10) / 10}`).join(' ')
}

type BoxProps = {
  gx: number
  gy: number
  w?: number
  d?: number
  h?: number
  z?: number
  top?: string
  right?: string
  left?: string
}

function Box({
  gx,
  gy,
  w = 1,
  d = 1,
  h = 1,
  z = 0,
  top = 'var(--hq-iso-surface)',
  right = 'var(--hq-iso-blue-mid)',
  left = 'var(--hq-iso-blue-deep)',
}: BoxProps) {
  const topFace = [
    iso(gx, gy, z + h),
    iso(gx + w, gy, z + h),
    iso(gx + w, gy + d, z + h),
    iso(gx, gy + d, z + h),
  ]
  const rightFace = [
    iso(gx + w, gy, z + h),
    iso(gx + w, gy + d, z + h),
    iso(gx + w, gy + d, z),
    iso(gx + w, gy, z),
  ]
  const leftFace = [
    iso(gx, gy + d, z + h),
    iso(gx + w, gy + d, z + h),
    iso(gx + w, gy + d, z),
    iso(gx, gy + d, z),
  ]

  return (
    <g>
      <polygon points={points(leftFace)} fill={left} />
      <polygon points={points(rightFace)} fill={right} />
      <polygon
        points={points(topFace)}
        fill={top}
        stroke="var(--hq-iso-line)"
        strokeWidth="1"
        strokeOpacity=".5"
      />
    </g>
  )
}

/** Maps flat content onto the down-left face of a box (grid units x, height units y). */
function leftFaceMatrix(gx: number, gy: number, d: number, z: number, h: number) {
  const o = iso(gx, gy + d, z + h)
  return `matrix(${TW} ${TH} 0 ${ZH} ${o.x} ${o.y})`
}

function GroundPlane() {
  return (
    <g>
      <polygon
        points={points([iso(-3.4, -3.4), iso(3.4, -3.4), iso(3.4, 3.4), iso(-3.4, 3.4)])}
        fill="var(--hq-iso-ground)"
        opacity=".55"
      />
      <ellipse
        cx={ORIGIN.x}
        cy={ORIGIN.y + 92}
        rx="196"
        ry="34"
        fill="var(--hq-iso-shadow)"
        opacity=".14"
      />
    </g>
  )
}

/** Product: a desk workspace — monitor, keyboard, and a stack of reports. */
function ProductScene({ id }: { id: string }) {
  return (
    <g>
      <Box
        gx={-2.3}
        gy={-2.3}
        w={4.6}
        d={4.6}
        h={0.22}
        top="var(--hq-iso-surface)"
        right="var(--hq-iso-blue-mid)"
        left="var(--hq-iso-blue-deep)"
      />

      <Box gx={-1.7} gy={-1.95} w={3.2} d={0.26} h={2.1} z={0.22} top="var(--hq-iso-blue-soft)" />
      <g transform={leftFaceMatrix(-1.7, -1.95, 0.26, 0.22, 2.1)}>
        <rect x="0.12" y="0.14" width="2.96" height="1.82" rx="0.1" fill={`url(#${id}-screen)`} />
        <rect x="0.28" y="0.32" width="1.15" height="0.16" rx="0.08" fill="var(--hq-iso-blue)" />
        <rect x="0.28" y="0.62" width="2.4" height="0.12" rx="0.06" fill="var(--hq-iso-muted)" />
        <rect x="0.28" y="0.86" width="2.05" height="0.12" rx="0.06" fill="var(--hq-iso-muted)" opacity=".7" />
        <rect x="0.28" y="1.1" width="2.28" height="0.12" rx="0.06" fill="var(--hq-iso-muted)" opacity=".5" />
        {[0.42, 0.72, 0.55, 0.88].map((barHeight, index) => (
          <rect
            key={barHeight}
            x={0.3 + index * 0.34}
            y={1.72 - barHeight * 0.42}
            width="0.2"
            height={barHeight * 0.42}
            rx="0.06"
            fill={index === 3 ? 'var(--hq-iso-accent)' : 'var(--hq-iso-blue)'}
          />
        ))}
        <rect x="1.92" y="1.32" width="1.02" height="0.42" rx="0.1" fill="var(--hq-iso-blue)" opacity=".25" />
      </g>

      <Box gx={1.25} gy={-1.05} w={0.9} d={0.9} h={0.14} z={0.22} top="var(--hq-iso-blue-soft)" />
      <Box gx={1.33} gy={-0.97} w={0.9} d={0.9} h={0.14} z={0.36} top="var(--hq-iso-surface)" />
      <Box
        gx={1.41}
        gy={-0.89}
        w={0.9}
        d={0.9}
        h={0.14}
        z={0.5}
        top="var(--hq-iso-accent)"
        right="var(--hq-iso-blue)"
      />

      <Box gx={-1.35} gy={0.85} w={2.5} d={0.95} h={0.1} z={0.22} top="var(--hq-iso-blue-soft)" />
    </g>
  )
}

/** Features: a modular cluster of capability blocks at varied heights. */
function FeaturesScene() {
  const tiles = [
    { gx: -1.65, gy: -1.65, h: 1.45 },
    { gx: -0.55, gy: -1.65, h: 0.85 },
    { gx: 0.55, gy: -1.65, h: 1.95 },
    { gx: -1.65, gy: -0.55, h: 1.05 },
    { gx: -0.55, gy: -0.55, h: 2.35, accent: true },
    { gx: 0.55, gy: -0.55, h: 0.7 },
    { gx: -1.65, gy: 0.55, h: 1.7 },
    { gx: -0.55, gy: 0.55, h: 1.2, accent: true },
    { gx: 0.55, gy: 0.55, h: 1.9 },
  ]

  return (
    <g>
      {[...tiles]
        .sort((a, b) => a.gx + a.gy - (b.gx + b.gy))
        .map((tile) => (
          <Box
            key={`${tile.gx}-${tile.gy}`}
            gx={tile.gx}
            gy={tile.gy}
            w={0.95}
            d={0.95}
            h={tile.h}
            top={tile.accent ? 'var(--hq-iso-accent)' : 'var(--hq-iso-surface)'}
            right={tile.accent ? 'var(--hq-iso-blue)' : 'var(--hq-iso-blue-mid)'}
            left="var(--hq-iso-blue-deep)"
          />
        ))}
    </g>
  )
}

/** Solutions: an ascending path of platforms toward a milestone flag. */
function SolutionsScene() {
  const steps = [0, 1, 2, 3].map((index) => ({
    gx: -2.1 + index * 1.08,
    h: 0.55 + index * 0.62,
    accent: index === 3,
  }))
  const summit = steps[steps.length - 1]
  const flagBase = iso(summit.gx + 0.5, 0.3, summit.h)

  return (
    <g>
      {steps.map((step, index) => (
        <g key={step.gx}>
          <Box
            gx={step.gx}
            gy={-0.5}
            w={1}
            d={1.6}
            h={step.h}
            top={step.accent ? 'var(--hq-iso-accent)' : 'var(--hq-iso-surface)'}
            right={step.accent ? 'var(--hq-iso-blue)' : 'var(--hq-iso-blue-mid)'}
            left="var(--hq-iso-blue-deep)"
          />
          {index === 0 ? <Traveller gx={step.gx + 0.5} h={step.h} /> : null}
        </g>
      ))}

      <g>
        <rect
          x={flagBase.x - 2.5}
          y={flagBase.y - 74}
          width="5"
          height="74"
          rx="2.5"
          fill="var(--hq-iso-blue-deep)"
        />
        <path
          d={`M${flagBase.x + 2} ${flagBase.y - 72} L${flagBase.x + 46} ${flagBase.y - 58} L${flagBase.x + 2} ${flagBase.y - 44} Z`}
          fill="var(--hq-iso-accent)"
        />
      </g>
    </g>
  )
}

function Traveller({ gx, h }: { gx: number; h: number }) {
  const base = iso(gx, 0.3, h)
  return (
    <g>
      <ellipse cx={base.x} cy={base.y + 2} rx="14" ry="7" fill="var(--hq-iso-shadow)" opacity=".22" />
      <circle cx={base.x} cy={base.y - 17} r="15" fill="var(--hq-iso-blue)" />
    </g>
  )
}

function FloatingAccents({ id, variant }: { id: string; variant: IsometricIllustrationVariant }) {
  if (variant === 'product') {
    return (
      <g>
        <g className="hq-isometric-float hq-isometric-float--one">
          <rect x="70" y="118" width="120" height="66" rx="14" fill="var(--hq-iso-surface)" />
          <rect x="86" y="136" width="52" height="9" rx="4.5" fill="var(--hq-iso-muted)" />
          <rect x="86" y="153" width="88" height="14" rx="7" fill="var(--hq-iso-blue)" />
        </g>
        <g className="hq-isometric-float hq-isometric-float--two">
          <circle cx="519" cy="139" r="35" fill={`url(#${id}-orb)`} />
          <path
            d="m503 140 11 11 22-24"
            fill="none"
            stroke="var(--hq-iso-surface)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    )
  }

  if (variant === 'features') {
    return (
      <g>
        <g className="hq-isometric-float hq-isometric-float--two">
          <circle cx="524" cy="126" r="34" fill={`url(#${id}-orb)`} />
          <path
            d="M524 110v32m-16-16h32"
            stroke="var(--hq-iso-surface)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        <g className="hq-isometric-float hq-isometric-float--three">
          <circle cx="104" cy="158" r="24" fill="var(--hq-iso-surface)" />
          <circle cx="104" cy="158" r="9" fill="var(--hq-iso-accent)" />
        </g>
      </g>
    )
  }

  return (
    <g>
      <g className="hq-isometric-float hq-isometric-float--one">
        <rect x="74" y="132" width="112" height="58" rx="14" fill="var(--hq-iso-surface)" />
        <circle cx="104" cy="161" r="13" fill="var(--hq-iso-accent)" />
        <rect x="126" y="149" width="46" height="9" rx="4.5" fill="var(--hq-iso-muted)" />
        <rect x="126" y="165" width="32" height="9" rx="4.5" fill="var(--hq-iso-muted)" opacity=".6" />
      </g>
      <g className="hq-isometric-float hq-isometric-float--three">
        <circle cx="530" cy="182" r="30" fill={`url(#${id}-orb)`} />
        <path
          d="M530 168v28m-14-14h28"
          stroke="var(--hq-iso-surface)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

export function IsometricIllustration({ variant, className = '' }: IsometricIllustrationProps) {
  const rawId = useId()
  const id = rawId.replace(/:/g, '')

  return (
    <div
      className={`hq-isometric-scene relative mx-auto w-full max-w-[620px] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 640 500" focusable="false" className="h-auto w-full">
        <defs>
          <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--hq-iso-screen-a)" />
            <stop offset="1" stopColor="var(--hq-iso-screen-b)" />
          </linearGradient>
          <linearGradient id={`${id}-orb`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--hq-iso-accent)" />
            <stop offset="1" stopColor="var(--hq-iso-blue)" />
          </linearGradient>
        </defs>

        <GroundPlane />

        {variant === 'product' ? <ProductScene id={id} /> : null}
        {variant === 'features' ? <FeaturesScene /> : null}
        {variant === 'solutions' ? <SolutionsScene /> : null}

        <FloatingAccents id={id} variant={variant} />
      </svg>
    </div>
  )
}
