"use client"

import { motion } from 'framer-motion'

export function ProgressRing({ size = 84, progress = 0.62 }: { size?: number; progress?: number }) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#0031b0" />
          <stop offset="100%" stopColor="#1e5af3" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} stroke="#0b1220" fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        stroke="url(#g1)"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-sm font-semibold"
        style={{ fill: 'var(--foreground)', fontSize: 14 }}
      >
        {Math.round(progress * 100)}%
      </text>
    </svg>
  )
}

export default ProgressRing
