'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-start pt-40 pb-0 overflow-hidden grid-bg"
    >
      <div className="hero-radial absolute inset-0 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-slate-300 text-sm font-medium">New onboarding experience</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white mb-6"
        >
          Your{' '}
          <span className="text-gradient-blue">Shortcut</span>{' '}
          to Interview{' '}
          <span className="text-white">Success</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
        >
          AI-powered interview preparation made simple and effective. Practice with realistic
          mock interviews, get instant feedback, and land your dream role.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(59,130,246,0.55)' }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center gap-2.5 text-white font-semibold text-base px-8 py-4 rounded-full"
          >
            Try Prep AI Now
            <ArrowRight size={18} strokeWidth={2.5} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 bg-slate-900/70 border border-slate-700/60 text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200"
          >
            <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center">
              <Play size={8} fill="currentColor" className="ml-0.5" />
            </div>
            See our plans
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-16 w-full max-w-5xl mx-auto px-4"
      >
        <HeroDashboard />
      </motion.div>
    </section>
  )
}

function HeroDashboard() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden brain-glow"
      style={{
        background: 'linear-gradient(135deg, #030b18 0%, #020910 100%)',
        border: '1px solid rgba(59,130,246,0.35)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="relative w-full" style={{ minHeight: '460px' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 50%, #061530 0%, #020b18 60%, #010810 100%)',
          }}
        />

        {/* Floating Brain */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrainVisual />
        </motion.div>

        {/* Confidence card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute top-6 left-6 backdrop-blur rounded-xl px-5 py-4 min-w-[160px]"
          style={{ background: 'rgba(6,15,30,0.92)', border: '1px solid rgba(30,50,90,0.7)' }}
        >
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">Confidence</p>
          <p className="text-blue-400 text-3xl font-bold">92%</p>
          <p className="text-green-400 text-xs mt-1 font-medium">↑ 14% this week</p>
        </motion.div>

        {/* Voice Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="absolute bottom-6 left-6 backdrop-blur rounded-xl px-4 py-3"
          style={{ background: 'rgba(6,15,30,0.85)', border: '1px solid rgba(30,50,90,0.6)' }}
        >
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-2">Voice Analysis</p>
          <VoiceBars />
        </motion.div>

        {/* Interview Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-6 right-6 backdrop-blur rounded-xl px-4 py-3"
          style={{ background: 'rgba(6,15,30,0.85)', border: '1px solid rgba(30,50,90,0.6)' }}
        >
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-1">Interview Score</p>
          <p className="text-white text-2xl font-bold">8.7 <span className="text-slate-500 text-base font-normal">/ 10</span></p>
          <p className="text-slate-500 text-xs mt-0.5">System Design • Senior</p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#010810] to-transparent" />
    </div>
  )
}

function BrainVisual() {
  const nodes: [number, number][] = [
    [300, 75], [240, 90], [360, 90], [195, 118], [405, 118],
    [160, 150], [440, 150], [220, 142], [380, 142], [300, 128],
    [148, 188], [452, 188], [202, 182], [398, 182], [262, 168], [338, 168], [300, 172],
    [158, 228], [442, 228], [212, 222], [388, 222], [266, 212], [334, 212], [300, 217],
    [172, 270], [428, 270], [228, 262], [372, 262], [300, 258],
    [197, 310], [403, 310], [256, 302], [344, 302], [300, 297],
    [242, 347], [358, 347], [300, 342], [272, 362], [328, 362],
  ]

  const connections: [number, number][] = [
    [0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[1,7],[2,8],[0,9],
    [5,10],[6,11],[7,12],[8,13],[1,14],[2,15],[9,16],
    [10,17],[11,18],[12,19],[13,20],[14,21],[15,22],[16,23],
    [17,24],[18,25],[19,26],[20,27],[21,28],[22,28],[23,28],
    [24,29],[25,30],[26,31],[27,32],[28,33],
    [29,34],[30,35],[31,36],[32,36],[33,36],
    [34,37],[35,38],[36,39],[37,40],[38,40],
    [5,12],[6,13],[7,14],[8,15],[10,19],[11,20],[17,26],[18,27],
    [9,23],[16,28],[3,7],[4,8],[24,31],[25,32],
  ]

  return (
    <svg
      viewBox="0 0 600 450"
      className="w-full max-w-2xl"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 35px rgba(34,211,238,0.3))' }}
    >
      <defs>
        <radialGradient id="brainGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.3" />
        </radialGradient>
        <filter id="nGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="lGlow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="pGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Brain silhouette outlines */}
      <g filter="url(#pGlow)">
        <path d="M300,68 C330,58 370,63 400,80 C430,96 450,122 456,150 C462,178 458,206 448,230 C437,256 422,278 412,298 C402,318 397,335 392,348 C381,365 366,374 350,377 C334,380 315,377 305,370 C302,368 300,365 300,362"
          fill="none" stroke="url(#brainGrad)" strokeWidth="2.2" opacity="0.8"/>
        <path d="M300,68 C270,58 230,63 200,80 C170,96 150,122 144,150 C138,178 142,206 152,230 C163,256 178,278 188,298 C198,318 203,335 208,348 C219,365 234,374 250,377 C266,380 285,377 295,370 C298,368 300,365 300,362"
          fill="none" stroke="url(#brainGrad)" strokeWidth="2.2" opacity="0.8"/>
        <path d="M300,68 C299,140 300,220 300,362" fill="none" stroke="#22d3ee" strokeWidth="1.1" opacity="0.3" strokeDasharray="5 7"/>

        {/* Gyri right */}
        <path d="M312,102 C345,92 375,108 400,124 C422,138 442,158 452,178" fill="none" stroke="#38bdf8" strokeWidth="1.3" opacity="0.55"/>
        <path d="M310,145 C342,133 374,143 400,156 C424,168 444,188 450,210" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.48"/>
        <path d="M310,192 C336,180 364,190 390,202 C414,213 436,232 445,252" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.42"/>
        <path d="M315,238 C338,228 364,236 388,247 C410,258 430,276 438,294" fill="none" stroke="#60a5fa" strokeWidth="0.9" opacity="0.36"/>
        <path d="M320,280 C342,272 365,280 386,290 C406,300 424,318 430,336" fill="none" stroke="#38bdf8" strokeWidth="0.9" opacity="0.3"/>

        {/* Gyri left */}
        <path d="M288,102 C255,92 225,108 200,124 C178,138 158,158 148,178" fill="none" stroke="#38bdf8" strokeWidth="1.3" opacity="0.55"/>
        <path d="M290,145 C258,133 226,143 200,156 C176,168 156,188 150,210" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.48"/>
        <path d="M290,192 C264,180 236,190 210,202 C186,213 164,232 155,252" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.42"/>
        <path d="M285,238 C262,228 236,236 212,247 C190,258 170,276 162,294" fill="none" stroke="#60a5fa" strokeWidth="0.9" opacity="0.36"/>
        <path d="M280,280 C258,272 235,280 214,290 C194,300 176,318 170,336" fill="none" stroke="#38bdf8" strokeWidth="0.9" opacity="0.3"/>

        {/* Cerebellum */}
        <path d="M248,370 C264,380 282,385 300,385 C318,385 336,380 352,370" fill="none" stroke="#22d3ee" strokeWidth="1.3" opacity="0.55"/>
        <path d="M258,376 C272,383 286,387 300,387" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.38"/>
        <path d="M342,376 C328,383 314,387 300,387" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.38"/>
      </g>

      {/* Neural connections */}
      <g filter="url(#lGlow)">
        {connections.map(([a, b], i) => {
          const nodeA = nodes[a];
          const nodeB = nodes[b];
          if (!nodeA || !nodeB) return null;
          const [x1, y1] = nodeA;
          const [x2, y2] = nodeB;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(59,130,246,0.35)" strokeWidth="0.75">
              <animate attributeName="opacity" values="0.15;0.6;0.15" dur={`${2.2 + (i % 9) * 0.32}s`} repeatCount="indefinite"/>
            </line>
          );
        })}
      </g>

      {/* Nodes */}
      {nodes.map(([x, y], i) => {
        const bright = i % 6 === 0
        const dur = 1.9 + (i % 7) * 0.27
        return (
          <g key={i} filter="url(#nGlow)">
            <circle cx={x} cy={y} r={bright ? 10 : 7} fill="rgba(34,211,238,0.06)">
              <animate attributeName="r" values={bright ? "8;13;8" : "5;9;5"} dur={`${dur}s`} repeatCount="indefinite"/>
            </circle>
            <circle cx={x} cy={y} r={bright ? 5 : 3.5} fill={bright ? "rgba(34,211,238,0.6)" : "rgba(59,130,246,0.48)"}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${dur}s`} repeatCount="indefinite"/>
            </circle>
            <circle cx={x} cy={y} r={bright ? 2.5 : 1.8} fill={bright ? "#22d3ee" : "#60a5fa"}/>
          </g>
        )
      })}

      {/* Travelling pulses */}
      {[
        "M300,68 L262,168 L202,182 L158,228 L172,270 L242,347",
        "M300,68 L338,168 L398,182 L442,228 L428,270 L358,347",
        "M198,118 L300,128 L402,118 L452,188 L300,217 L148,188 L300,217 L300,297"
      ].map((path, i) => (
        <circle key={`p${i}`} r="2.8" fill="#22d3ee" opacity="0.85" filter="url(#nGlow)">
          <animateMotion dur={`${4.5 + i * 1.6}s`} repeatCount="indefinite" path={path}/>
          <animate attributeName="opacity" values="0;0.9;0.9;0" dur={`${4.5 + i * 1.6}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  )
}

function VoiceBars() {
  const bars = [0.4, 0.7, 0.5, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.75, 0.5, 0.9, 0.65]
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((h, i) => (
        <div key={i} className="w-1.5 rounded-sm bg-blue-500 voice-bar"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.08}s`, animationDuration: `${0.8 + (i % 4) * 0.2}s` }}/>
      ))}
    </div>
  )
}
