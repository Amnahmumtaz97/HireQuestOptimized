'use client'

/**
 * Decorative doodles for the auth shell — blobs, arcs, hexagons, soft diagonals.
 * No stripe/grid line patterns.
 */
export function AuthDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft blue blobs */}
      <div
        className="absolute -left-[12%] -top-[18%] h-[420px] w-[420px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22), transparent 68%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="absolute -right-[10%] bottom-[-12%] h-[380px] w-[380px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute left-[40%] top-[55%] h-[220px] w-[220px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Soft diagonal accent wedges */}
      <div
        className="absolute -left-8 top-[18%] h-[220px] w-[55%] opacity-[0.07]"
        style={{
          background:
            'linear-gradient(165deg, #1e40af 0%, #2563eb 55%, transparent 100%)',
          clipPath: 'polygon(0 22%, 100% 0, 100% 78%, 0 100%)',
        }}
      />
      <div
        className="absolute -right-10 bottom-[10%] h-[180px] w-[45%] opacity-[0.06]"
        style={{
          background:
            'linear-gradient(200deg, #2563eb 0%, #1d4ed8 50%, transparent 100%)',
          clipPath: 'polygon(0 0, 100% 18%, 100% 100%, 0 82%)',
        }}
      />

      {/* Wireframe circles */}
      <div
        className="absolute -left-16 top-[42%] h-56 w-56 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_28%,transparent)] opacity-50"
      />
      <div
        className="absolute -left-6 top-[48%] h-36 w-36 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_18%,transparent)] opacity-40"
      />
      <div
        className="absolute -right-20 top-[12%] h-64 w-64 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_22%,transparent)] opacity-45"
      />
      <div
        className="absolute right-[6%] top-[18%] h-40 w-40 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_14%,transparent)] opacity-35"
      />

      {/* Hexagon doodles */}
      <svg
        className="absolute left-[8%] bottom-[14%] h-24 w-24 opacity-[0.22]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 6 L88 28 V72 L50 94 L12 72 V28 Z"
          stroke="var(--primary)"
          strokeWidth="1.4"
        />
        <path
          d="M50 22 L72 35 V61 L50 74 L28 61 V35 Z"
          stroke="var(--primary)"
          strokeWidth="1"
          opacity="0.7"
        />
      </svg>
      <svg
        className="absolute right-[10%] bottom-[22%] h-16 w-16 opacity-[0.18]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 8 L86 29 V71 L50 92 L14 71 V29 Z"
          stroke="var(--primary)"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        className="absolute right-[28%] top-[10%] h-12 w-12 opacity-[0.16]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 8 L86 29 V71 L50 92 L14 71 V29 Z"
          stroke="var(--primary)"
          strokeWidth="1.6"
        />
      </svg>

      {/* Floating soft dots */}
      {[
        { left: '12%', top: '22%', size: 3 },
        { left: '22%', top: '68%', size: 2 },
        { left: '78%', top: '30%', size: 3 },
        { left: '86%', top: '62%', size: 2 },
        { left: '48%', top: '16%', size: 2 },
        { left: '62%', top: '78%', size: 3 },
      ].map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary/40"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            boxShadow: '0 0 10px color-mix(in oklab, var(--primary) 45%, transparent)',
          }}
        />
      ))}
    </div>
  )
}

/** Compact doodles for inside the form panel */
export function AuthFormDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -right-10 -top-10 h-44 w-44 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute -left-12 bottom-0 h-40 w-40 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
          filter: 'blur(45px)',
        }}
      />
      <div className="absolute -right-8 top-[30%] h-28 w-28 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_20%,transparent)] opacity-40" />
      <div className="absolute right-2 top-[36%] h-16 w-16 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_12%,transparent)] opacity-30" />
      <svg
        className="absolute left-4 bottom-8 h-14 w-14 opacity-[0.14]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 8 L86 29 V71 L50 92 L14 71 V29 Z"
          stroke="var(--primary)"
          strokeWidth="1.6"
        />
      </svg>
      <div
        className="absolute left-0 top-[55%] h-24 w-[42%] opacity-[0.05]"
        style={{
          background: 'linear-gradient(165deg, #2563eb, transparent)',
          clipPath: 'polygon(0 20%, 100% 0, 100% 80%, 0 100%)',
        }}
      />
    </div>
  )
}
