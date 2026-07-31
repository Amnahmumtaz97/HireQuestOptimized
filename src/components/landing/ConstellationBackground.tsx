'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'

type Props = {
  className?: string
  /**
   * Visual intensity (0..1). Higher = brighter points/lines.
   */
  intensity?: number
}

type Vec2 = { x: number; y: number }

type Particle = {
  p: Vec2
  v: Vec2
  r: number
  tw: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

export function ConstellationBackground({ className, intensity = 0.5 }: Props) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const resizeRef = useRef<number | null>(null)

  // target -> smoothed cursor for “premium” lag
  const pointerRef = useRef<{ target: Vec2; smooth: Vec2; vel: Vec2 }>({
    target: { x: -10_000, y: -10_000 },
    smooth: { x: -10_000, y: -10_000 },
    vel: { x: 0, y: 0 },
  })

  const intensity01 = useMemo(() => {
    const base = clamp(intensity, 0, 1)
    // Light backgrounds need much more contrast so the mesh stays visible against pure white
    return isLight ? clamp(base * 1.9, 0, 1) : base
  }, [intensity, isLight])

  const colorMode = isLight ? 'light' : 'dark'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    if (prefersReducedMotion()) {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)
      drawStatic(ctx, rect.width, rect.height, intensity01, colorMode)
      return
    }

    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      particles: [] as Particle[],
      time: 0,
    }

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointerRef.current.target = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onPointerLeave = () => {
      pointerRef.current.target = { x: -10_000, y: -10_000 }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('blur', onPointerLeave)

    const setSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const nextW = Math.max(1, Math.floor(rect.width * dpr))
      const nextH = Math.max(1, Math.floor(rect.height * dpr))

      if (nextW === canvas.width && nextH === canvas.height && state.dpr === dpr) {
        state.width = rect.width
        state.height = rect.height
        return
      }

      canvas.width = nextW
      canvas.height = nextH
      state.width = rect.width
      state.height = rect.height
      state.dpr = dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const area = rect.width * rect.height
      const density = 1 / 18_000
      const count = clamp(Math.round(area * density), 32, 120)
      state.particles = createParticles(count, rect.width, rect.height)
    }

    const scheduleResize = () => {
      if (resizeRef.current != null) window.clearTimeout(resizeRef.current)
      resizeRef.current = window.setTimeout(setSize, 120)
    }

    setSize()
    window.addEventListener('resize', scheduleResize, { passive: true })

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      state.time += dt

      // smooth cursor with spring + damping for natural delay
      const pr = pointerRef.current
      const k = 32
      const damping = 12
      const dx = pr.target.x - pr.smooth.x
      const dy = pr.target.y - pr.smooth.y
      pr.vel.x += dx * k * dt
      pr.vel.y += dy * k * dt
      pr.vel.x *= Math.max(0, 1 - damping * dt)
      pr.vel.y *= Math.max(0, 1 - damping * dt)
      pr.smooth.x += pr.vel.x * dt
      pr.smooth.y += pr.vel.y * dt

      ctx.clearRect(0, 0, state.width, state.height)
      drawFrame(ctx, state, pr.smooth, intensity01, colorMode)

      frameRef.current = window.requestAnimationFrame(tick)
    }

    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', onPointerLeave)
      window.removeEventListener('resize', scheduleResize)
      if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current)
      if (resizeRef.current != null) window.clearTimeout(resizeRef.current)
    }
  }, [intensity01, colorMode])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}

function createParticles(count: number, width: number, height: number): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i += 1) {
    const speed = 6 + Math.random() * 14
    const a = Math.random() * Math.PI * 2
    particles.push({
      p: { x: Math.random() * width, y: Math.random() * height },
      v: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
      r: 0.8 + Math.random() * 1.7,
      tw: Math.random() * Math.PI * 2,
    })
  }
  return particles
}

function drawStatic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity01: number,
  colorMode: 'dark' | 'light',
) {
  const area = width * height
  const density = 1 / 22_000
  const count = clamp(Math.round(area * density), 26, 90)
  const particles = createParticles(count, width, height).map((p) => ({
    ...p,
    v: { x: 0, y: 0 },
  }))
  drawLinesAndPoints(ctx, width, height, particles, { x: -10_000, y: -10_000 }, intensity01, 0, colorMode)
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: { width: number; height: number; particles: Particle[]; time: number },
  pointer: Vec2,
  intensity01: number,
  colorMode: 'dark' | 'light',
) {
  const w = state.width
  const h = state.height
  if (w <= 0 || h <= 0) return

  const pointerStrength = 28
  const pullRadius = clamp(Math.min(w, h) * 0.23, 150, 260)
  const pullRadius2 = pullRadius * pullRadius

  for (const p of state.particles) {
    p.p.x += p.v.x * (1 / 60)
    p.p.y += p.v.y * (1 / 60)

    if (p.p.x < -30) p.p.x = w + 30
    if (p.p.x > w + 30) p.p.x = -30
    if (p.p.y < -30) p.p.y = h + 30
    if (p.p.y > h + 30) p.p.y = -30

    const dx = pointer.x - p.p.x
    const dy = pointer.y - p.p.y
    const dist2 = dx * dx + dy * dy
    if (dist2 < pullRadius2) {
      const dist = Math.max(18, Math.sqrt(dist2))
      const falloff = 1 - dist / pullRadius
      const f = (pointerStrength / dist) * 0.07 * falloff
      p.v.x += (dx / dist) * f
      p.v.y += (dy / dist) * f
    }

    p.v.x *= 0.995
    p.v.y *= 0.995

    const sp = Math.sqrt(p.v.x * p.v.x + p.v.y * p.v.y)
    if (sp > 26) {
      p.v.x = (p.v.x / sp) * 26
      p.v.y = (p.v.y / sp) * 26
    } else if (sp < 5) {
      const k = 5 / Math.max(0.0001, sp)
      p.v.x *= k
      p.v.y *= k
    }
  }

  drawLinesAndPoints(ctx, w, h, state.particles, pointer, intensity01, state.time, colorMode)
}

function drawLinesAndPoints(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: Particle[],
  pointer: Vec2,
  intensity01: number,
  t: number,
  colorMode: 'dark' | 'light',
) {
  const maxDist = clamp(Math.min(width, height) * 0.16, 90, 170)
  const maxDist2 = maxDist * maxDist

  const isLight = colorMode === 'light'
  const pointAlpha = (isLight ? 1 : 0.85) * intensity01
  const lineAlpha = (isLight ? 0.75 : 0.42) * intensity01

  const boostRadius = clamp(Math.min(width, height) * 0.26, 170, 310)
  const boostRadius2 = boostRadius * boostRadius

  ctx.save()
  ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter'

  // Lines
  ctx.lineWidth = isLight ? 1.15 : 1
  for (let i = 0; i < particles.length; i += 1) {
    const a = particles[i]
    for (let j = i + 1; j < particles.length; j += 1) {
      const b = particles[j]
      const dx = a.p.x - b.p.x
      const dy = a.p.y - b.p.y
      const d2 = dx * dx + dy * dy
      if (d2 > maxDist2) continue

      const d = Math.sqrt(d2)
      const f = 1 - d / maxDist

      // Brighter near pointer
      let cursorBoost = 0
      const mdx = pointer.x - (a.p.x + b.p.x) * 0.5
      const mdy = pointer.y - (a.p.y + b.p.y) * 0.5
      const md2 = mdx * mdx + mdy * mdy
      if (md2 < boostRadius2) {
        cursorBoost = 0.26 * (1 - Math.sqrt(md2) / boostRadius)
      }

      const alpha = clamp((f * f) * (lineAlpha + cursorBoost), 0, isLight ? 0.8 : 0.75)
      ctx.strokeStyle = isLight
        ? `rgba(37, 99, 235, ${alpha})`
        : `rgba(120, 200, 255, ${alpha})`
      ctx.beginPath()
      ctx.moveTo(a.p.x, a.p.y)
      ctx.lineTo(b.p.x, b.p.y)
      ctx.stroke()
    }
  }

  // Points + twinkle
  for (const p of particles) {
    const tw = 0.55 + 0.45 * Math.sin(p.tw + t * 1.2)
    let a = pointAlpha * tw

    const dx = pointer.x - p.p.x
    const dy = pointer.y - p.p.y
    const dist2 = dx * dx + dy * dy
    if (dist2 < boostRadius2) {
      a += 0.18 * (1 - Math.sqrt(dist2) / boostRadius)
    }

    ctx.fillStyle = isLight
      ? `rgba(37, 99, 235, ${clamp(a * 1.1, 0, 0.98)})`
      : `rgba(205, 235, 255, ${clamp(a, 0, 0.95)})`
    ctx.beginPath()
    ctx.arc(p.p.x, p.p.y, p.r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = isLight
      ? `rgba(124, 58, 237, ${0.22 * intensity01 * tw})`
      : `rgba(90, 175, 255, ${0.08 * intensity01 * tw})`
    ctx.beginPath()
    ctx.arc(p.p.x, p.p.y, p.r * 4.2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

